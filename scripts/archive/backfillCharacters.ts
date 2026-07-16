import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'
const DEEPL_API_KEY = process.env.DEEPL_API_KEY!

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)

const isJapanese = (text: string | null | undefined): boolean => {
    if (!text) return false
    return /[぀-ゟ゠-ヿ一-龯]/.test(text)
}

const esc = (str: string | null | undefined): string => {
    if (!str) return 'NULL'
    return `'${str.replace(/'/g, "''")}'`
}

const normalizeRomaji = (text: string): string =>
    text.replace(/ou/gi, 'o').replace(/uu/gi, 'u').replace(/oo/gi, 'o')

const parseHeight = (description: string | null | undefined): number | null => {
    if (!description) return null
    const match = description.match(/(?:Height|身長)[^0-9]*(\d+)\s*cm/i)
    return match ? parseInt(match[1]) : null
}

const formatBirthday = (dateOfBirth: { year: number | null, month: number | null, day: number | null } | null): string | null => {
    if (!dateOfBirth) return null
    const { month, day } = dateOfBirth
    if (month && day) return `${month}月${day}日`
    if (month) return `${month}月`
    return null
}

const prepareDescription = (text: string | null | undefined): string => {
    if (!text) return ''
    return text
        .replace(/~![\s\S]*?!~/g, '')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/^(?:Height|身長|Weight|体重)[^\n]*\n?/gim, '')
        .replace(/\n/g, ' ')
        .trim()
        .slice(0, 500)
}

const translateWithDeepl = async (text: string, nameMap: Record<string, string>): Promise<string> => {
    if (!text) return ''
    let preprocessed = normalizeRomaji(text)
    for (const [en, ja] of Object.entries(nameMap)) {
        preprocessed = preprocessed.replaceAll(en, ja)
    }
    try {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: [preprocessed], target_lang: 'JA', source_lang: 'EN' }),
        })
        const data = await res.json()
        return data.translations?.[0]?.text ?? ''
    } catch (e) {
        console.log(`      ⚠️  翻訳失敗: ${e}`)
        return ''
    }
}

const fetchCharactersWithDetails = async (animeId: number): Promise<{ edges: any[], title: { native: string | null, romaji: string | null, english: string | null } }> => {
    let page = 1
    let hasNextPage = true
    const edges: any[] = []
    let animeTitle = { native: null as string | null, romaji: null as string | null, english: null as string | null }

    while (hasNextPage) {
        const query = `
            query ($id: Int, $page: Int) {
                Media(id: $id) {
                    title { native romaji english }
                    characters(page: $page, perPage: 50, sort: ROLE) {
                        pageInfo { hasNextPage }
                        edges {
                            role
                            voiceActors(language: JAPANESE) {
                                name { native }
                            }
                            node {
                                id
                                name { native full }
                                image { large }
                                age
                                gender
                                bloodType
                                dateOfBirth { year month day }
                                description(asHtml: false)
                            }
                        }
                    }
                }
            }
        `
        let retries = 0
        let data: any = null

        while (retries < 3) {
            const res = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables: { id: animeId, page } }),
            })
            if (res.status === 429) {
                console.log(`    ⏳ レート制限。5秒待機...`)
                await new Promise(r => setTimeout(r, 5000))
                retries++
                continue
            }
            data = await res.json()
            break
        }

        const mediaData = data?.data?.Media
        if (!mediaData) break

        if (page === 1 && mediaData.title) animeTitle = mediaData.title

        const charData = mediaData.characters
        if (!charData) break

        edges.push(...(charData.edges ?? []))
        hasNextPage = charData.pageInfo?.hasNextPage ?? false
        page++

        await new Promise(r => setTimeout(r, 600))
    }

    return { edges, title: animeTitle }
}

const main = async () => {
    console.log('📥 Supabaseからキャラ情報を取得中...')

    // image_urlがNULLかつanilist_idがあるキャラを全件取得
    const { data: characters, error: charError } = await supabase
        .from('characters')
        .select('character_id, anilist_id, name, anime_id')
        .is('image_url', null)
        .not('anilist_id', 'is', null)

    if (charError) throw charError
    console.log(`  対象キャラ: ${characters?.length ?? 0}件`)

    // 全アニメのanime_id → anilist_idマップを構築
    const { data: animes, error: animeError } = await supabase
        .from('animes')
        .select('anime_id, anilist_id')
        .not('anilist_id', 'is', null)

    if (animeError) throw animeError

    const animeIdMap = new Map<string, number>()
    for (const anime of animes ?? []) {
        animeIdMap.set(anime.anime_id, anime.anilist_id)
    }

    // アニメのanilist_id別にキャラをグループ化
    const byAnime = new Map<number, { character_id: string, anilist_id: number, name: string }[]>()
    for (const char of characters ?? []) {
        const animeAnilistId = animeIdMap.get(char.anime_id)
        if (!animeAnilistId) continue
        if (!byAnime.has(animeAnilistId)) byAnime.set(animeAnilistId, [])
        byAnime.get(animeAnilistId)!.push(char)
    }

    console.log(`  対象アニメ: ${byAnime.size}件\n`)

    const updates: string[] = []
    let processed = 0
    const total = characters?.length ?? 0

    for (const [animeAnilistId, dbChars] of byAnime) {
        console.log(`📺 アニメID:${animeAnilistId} → キャラ${dbChars.length}件`)

        const { edges: anilistEdges, title: animeTitle } = await fetchCharactersWithDetails(animeAnilistId)

        // 名前マップ構築（正規化キーで登録）
        const nameMap: Record<string, string> = {}
        // アニメタイトルを追加
        if (animeTitle.native) {
            if (animeTitle.english && animeTitle.english !== animeTitle.native) nameMap[normalizeRomaji(animeTitle.english)] = animeTitle.native
            if (animeTitle.romaji && animeTitle.romaji !== animeTitle.native) nameMap[normalizeRomaji(animeTitle.romaji)] = animeTitle.native
        }
        // キャラクター名を追加
        for (const edge of anilistEdges) {
            const { full, native } = edge.node.name
            if (full && native && isJapanese(native)) nameMap[normalizeRomaji(full)] = native
        }

        for (const dbChar of dbChars) {
            const edge = anilistEdges.find((e: any) => e.node.id === dbChar.anilist_id)
            if (!edge) {
                console.log(`  ⚠️  見つからず: ${dbChar.name}`)
                continue
            }

            const node = edge.node
            const imageUrl = node.image?.large ?? null
            const birthday = formatBirthday(node.dateOfBirth)
            const bloodType = node.bloodType ?? null
            const voiceActor = edge.voiceActors?.[0]?.name?.native ?? null
            const height = parseHeight(node.description)

            let description = ''
            const cleaned = prepareDescription(node.description)
            if (cleaned && !isJapanese(cleaned)) {
                description = await translateWithDeepl(cleaned, nameMap)
                console.log(`  🌐 翻訳: ${dbChar.name}`)
                await new Promise(r => setTimeout(r, 300))
            } else if (cleaned) {
                description = cleaned
            }

            updates.push(
                `UPDATE characters SET image_url = ${esc(imageUrl)}, birthday = ${esc(birthday)}, blood_type = ${esc(bloodType)}, voice_actor = ${esc(voiceActor)}, height = ${height ?? 'NULL'}, description = ${esc(description)} WHERE character_id = '${dbChar.character_id}';`
            )

            processed++
            if (processed % 20 === 0) console.log(`  進捗: ${processed}/${total}件`)
        }

        await new Promise(r => setTimeout(r, 1000))
    }

    const outputFile = 'scripts/backfill_characters.sql'
    fs.writeFileSync(outputFile, updates.join('\n'), 'utf8')
    console.log(`\n✅ ${updates.length}件のUPDATE文を生成 → ${outputFile}`)
    console.log('📋 Supabase SQL Editorで実行してください')
}

main().catch(console.error)
