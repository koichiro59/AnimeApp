import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)

// ── ユーティリティ ──────────────────────────────────────────────

const isJapanese = (text: string | null | undefined): boolean => {
    if (!text) return false
    return /[぀-ゟ゠-ヿ一-龯]/.test(text)
}

const esc = (str: string | null | undefined): string => {
    if (!str) return 'NULL'
    return `'${str.replace(/'/g, "''")}'`
}

const parseAge = (age: string | null | undefined): string => {
    if (!age) return 'NULL'
    const match = age.match(/\d+/)
    return match ? match[0] : 'NULL'
}

const normalizeGender = (gender: string | null | undefined): string | null => {
    if (!gender) return null
    const lower = gender.toLowerCase()
    if (lower.includes('female')) return '女性'
    if (lower.includes('male')) return '男性'
    if (lower.includes('agender') || lower.includes('non-binary')) return 'なし'
    if (isJapanese(gender)) return gender.slice(0, 10)
    return null
}

const cleanDescription = (text: string | null | undefined): string => {
    if (!text) return ''
    return text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/\n/g, ' ')
        .trim()
        .slice(0, 200)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── AniList API ────────────────────────────────────────────────

type AnilistMedia = {
    id: number
    native: string | null
    romaji: string | null
    english: string | null
}

const searchAnilistByTitle = async (title: string): Promise<AnilistMedia[]> => {
    const query = `
    query ($search: String) {
      Page(perPage: 10) {
        media(search: $search, type: ANIME) {
          id
          title { native romaji english }
        }
      }
    }
  `
    let retries = 0
    while (retries < 3) {
        const res = await fetch(ANILIST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { search: title } }),
        })
        if (res.status === 429) {
            console.log('    ⏳ レート制限。5秒待機...')
            await sleep(5000)
            retries++
            continue
        }
        const data = await res.json()
        return (data?.data?.Page?.media ?? []).map((m: any) => ({
            id: m.id,
            native: m.title.native ?? null,
            romaji: m.title.romaji ?? null,
            english: m.title.english ?? null,
        }))
    }
    return []
}

const normalize = (str: string | null | undefined): string =>
    (str ?? '').replace(/[\s　・：:!！?？。、]/g, '').toLowerCase()

const findBestMatch = (title: string, candidates: AnilistMedia[]): { match: AnilistMedia; confidence: 'exact' | 'normalized' } | null => {
    const exact = candidates.find(c => c.native === title)
    if (exact) return { match: exact, confidence: 'exact' }

    const normTitle = normalize(title)
    const normalized = candidates.find(c =>
        normalize(c.native) === normTitle ||
        normalize(c.romaji) === normTitle ||
        normalize(c.english) === normTitle
    )
    if (normalized) return { match: normalized, confidence: 'normalized' }
    return null
}

// アニメのキャラ一覧を AniList から全件取得
type AnilistCharacter = {
    id: number
    nameNative: string | null
    nameFull: string | null
    age: string | null
    gender: string | null
    description: string | null
}

const fetchAnilistCharacters = async (animeAnilistId: number): Promise<AnilistCharacter[]> => {
    const query = `
    query ($id: Int, $page: Int) {
      Media(id: $id) {
        characters(page: $page, perPage: 50, sort: ROLE) {
          pageInfo { hasNextPage }
          edges {
            role
            node {
              id
              name { native full }
              age
              gender
              description(asHtml: false)
            }
          }
        }
      }
    }
  `
    const result: AnilistCharacter[] = []
    let page = 1
    let hasNextPage = true

    while (hasNextPage) {
        let retries = 0
        let data: any = null

        while (retries < 3) {
            const res = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables: { id: animeAnilistId, page } }),
            })
            if (res.status === 429) {
                console.log('    ⏳ レート制限。5秒待機...')
                await sleep(5000)
                retries++
                continue
            }
            data = await res.json()
            break
        }

        const charData = data?.data?.Media?.characters
        if (!charData) break

        for (const edge of (charData.edges ?? [])) {
            if (edge.role === 'BACKGROUND') continue
            const node = edge.node
            result.push({
                id: node.id,
                nameNative: node.name?.native ?? null,
                nameFull: node.name?.full ?? null,
                age: node.age ?? null,
                gender: node.gender ?? null,
                description: node.description ?? null,
            })
        }

        hasNextPage = charData.pageInfo?.hasNextPage ?? false
        page++
        await sleep(600)
    }

    return result
}

// ── メイン ────────────────────────────────────────────────────

const main = async () => {
    // counter.json から現在の文字ID を読み込む
    const counterFile = 'scripts/counter.json'
    const counter = JSON.parse(fs.readFileSync(counterFile, 'utf8'))
    let characterCounter: number = counter.characterCounter

    const allLines: string[] = [
        '-- =============================================',
        '-- anilist_id 欠損 & キャラ未登録 修正 SQL',
        `-- 生成日時: ${new Date().toISOString()}`,
        '-- =============================================',
        '',
    ]

    // ── 1. アニメの anilist_id チェック ──────────────────────
    console.log('🔍 [1/2] anilist_id が NULL のアニメを確認中...')
    const { data: nullAnimes, error: animeError } = await supabase
        .from('animes')
        .select('anime_id, title')
        .is('anilist_id', null)
        .order('anime_id')

    if (animeError) { console.error('❌ Supabase エラー:', animeError.message); process.exit(1) }

    const animeAutoUpdates: string[] = []
    const animeReviewItems: string[] = []

    if ((nullAnimes?.length ?? 0) === 0) {
        console.log('  ✅ 対象なし\n')
        allLines.push('-- ==================', '-- アニメ anilist_id 修正', '-- ==================', '-- 対象なし', '')
    } else {
        console.log(`  対象: ${nullAnimes!.length} 件\n`)
        for (let i = 0; i < nullAnimes!.length; i++) {
            const anime = nullAnimes![i]
            console.log(`  [${i + 1}/${nullAnimes!.length}] ${anime.title}`)
            const candidates = await searchAnilistByTitle(anime.title)
            const result = findBestMatch(anime.title, candidates)

            if (result) {
                const label = result.confidence === 'exact' ? '✅ 完全一致' : '🔶 正規化一致'
                console.log(`    ${label}: id=${result.match.id}`)
                animeAutoUpdates.push(`UPDATE animes SET anilist_id = ${result.match.id} WHERE anime_id = '${anime.anime_id}'; -- ${anime.title}`)
            } else if (candidates.length > 0) {
                console.log('    ⚠️  要確認')
                animeReviewItems.push(`-- ⚠️ 要確認: ${anime.title} (anime_id: ${anime.anime_id})`)
                candidates.slice(0, 3).forEach(c =>
                    animeReviewItems.push(`--   候補 id=${c.id} native=${c.native ?? '-'} romaji=${c.romaji ?? '-'}`)
                )
                animeReviewItems.push(`-- UPDATE animes SET anilist_id = [IDを選択] WHERE anime_id = '${anime.anime_id}';`, '')
            } else {
                console.log('    ❌ 候補なし')
                animeReviewItems.push(`-- ❌ 候補なし: ${anime.title} (anime_id: ${anime.anime_id})`, '')
            }
            await sleep(700)
        }
        allLines.push(
            '-- ==================', '-- アニメ anilist_id 修正', '-- ==================', '',
            '-- ✅ 自動マッチ（そのまま実行可）',
            ...(animeAutoUpdates.length > 0 ? animeAutoUpdates : ['-- なし']),
            '', '-- ⚠️ 手動確認',
            ...(animeReviewItems.length > 0 ? animeReviewItems : ['-- なし']), '',
        )
    }

    // ── 2. キャラが0件のアニメを検出・再取得 ─────────────────
    console.log('🔍 [2/2] キャラクターが0件のアニメを確認中...')

    // Supabase でキャラ数を anime_id 別に集計
    const { data: animesWithCharCount, error: countError } = await supabase
        .from('animes')
        .select('anime_id, title, anilist_id, characters(count)')
        .order('anime_id')

    if (countError) { console.error('❌ Supabase エラー:', countError.message); process.exit(1) }

    const noCharAnimes = (animesWithCharCount ?? []).filter((a: any) => {
        const cnt = a.characters?.[0]?.count ?? 0
        return cnt === 0 && a.anilist_id !== null
    })

    console.log(`  キャラ0件のアニメ: ${noCharAnimes.length} 件\n`)

    const charInserts: string[] = []
    const charReviewItems: string[] = []
    const seenCharIds = new Set<number>()

    for (let i = 0; i < noCharAnimes.length; i++) {
        const anime = noCharAnimes[i] as any
        console.log(`  [${i + 1}/${noCharAnimes.length}] ${anime.title} (anilist_id: ${anime.anilist_id})`)

        const chars = await fetchAnilistCharacters(anime.anilist_id)
        console.log(`    AniList から ${chars.length} 件取得`)

        let inserted = 0
        for (const char of chars) {
            if (seenCharIds.has(char.id)) continue
            seenCharIds.add(char.id)

            // 名前の決定: native が日本語 → そのまま / 日本語でない → full にフォールバック
            let name: string | null = null
            if (isJapanese(char.nameNative)) {
                name = char.nameNative
            } else if (char.nameFull) {
                name = char.nameFull  // 韓国語・中国語原作の場合は full（英語/ローマ字）を使用
                console.log(`    🔄 name fallback: ${char.nameNative} → ${char.nameFull}`)
            }

            if (!name) {
                charReviewItems.push(`-- ⏭️  名前取得不可: anilist_id=${char.id} (${anime.title})`)
                continue
            }

            const characterId = `CH${String(characterCounter).padStart(6, '0')}`
            characterCounter++

            const description = isJapanese(char.description) ? cleanDescription(char.description) : null

            charInserts.push(
                `INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES (${esc(characterId)}, ${esc(anime.anime_id)}, ${esc(name)}, ${esc(description)}, ${parseAge(char.age)}, ${esc(normalizeGender(char.gender))}, ${char.id}) ON CONFLICT DO NOTHING; -- ${anime.title}`
            )
            inserted++
        }
        console.log(`    ✅ INSERT 生成: ${inserted} 件`)
        await sleep(800)
    }

    allLines.push(
        '-- ==================',
        '-- キャラクター 未登録分 INSERT',
        `-- 対象アニメ: ${noCharAnimes.length} 件`,
        '-- ==================',
        '',
        ...charInserts,
        '',
        ...(charReviewItems.length > 0 ? ['-- ⚠️ スキップ（名前取得不可）', ...charReviewItems] : []),
    )

    // ── 出力 ──────────────────────────────────────────────────
    const outputPath = 'scripts/fix_anilist_ids.sql'
    fs.writeFileSync(outputPath, allLines.join('\n'), 'utf8')

    // counter.json を更新
    fs.writeFileSync(counterFile, JSON.stringify({
        ...counter,
        characterCounter,
        updatedAt: new Date().toISOString(),
    }, null, 2), 'utf8')

    console.log('\n=============================')
    console.log(`✅ ${outputPath} を生成しました`)
    console.log(`  アニメ  自動修正 : ${animeAutoUpdates.length} 件`)
    console.log(`  キャラ  INSERT   : ${charInserts.length} 件`)
    console.log(`  キャラ  スキップ : ${charReviewItems.length} 件`)
    console.log(`  counter.json 更新: characterCounter → ${characterCounter}`)
    console.log('=============================')
    console.log('\n次のステップ:')
    console.log('  1. scripts/fix_anilist_ids.sql の内容を確認')
    console.log('  2. Supabase ダッシュボードの SQL Editor で実行')
}

main().catch(console.error)
