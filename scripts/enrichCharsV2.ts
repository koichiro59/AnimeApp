/**
 * enrichCharsV2.ts
 * キャラクター説明文の翻訳 + 属性タグ抽出 → SQLファイル生成
 *
 * 使い方:
 *   npx tsx scripts/enrichCharsV2.ts                # 全40アニメ
 *   npx tsx scripts/enrichCharsV2.ts 10 1            # 1位のアニメの先頭10人（テスト）
 *   npx tsx scripts/enrichCharsV2.ts 10 39 1         # 2位〜40位（1位をスキップ）
 *
 * 引数: [chars_per_anime] [anime_count] [anime_start_offset]
 */
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const ANILIST_URL = 'https://graphql.anilist.co'

// ── 引数パース ──────────────────────────────────────────────────
const CHAR_LIMIT   = parseInt(process.argv[2] ?? '10')   // 各アニメで何人まで
const ANIME_LIMIT  = parseInt(process.argv[3] ?? '40')   // 何アニメ処理するか
const ANIME_OFFSET = parseInt(process.argv[4] ?? '0')    // 何番目のアニメからか（0始まり）

// ── ユーティリティ ───────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const isJapanese = (text: string | null | undefined): boolean =>
    text ? /[぀-ゟ゠-ヿ一-龯]/.test(text) : false

const prepareDescription = (text: string | null | undefined): string => {
    if (!text) return ''
    return text
        .replace(/~![\s\S]*?!~/g, '')           // spoilerタグ除去
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // 画像除去
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクをテキストに
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/^(?:Height|身長|Weight|体重)[^\n]*\n?/gim, '')
        .replace(/\n/g, ' ')
        .trim()
        .slice(0, 600)
}

const roleRank = (role: string | null): number =>
    role === 'SUPPORTING' ? 2 : role === 'BACKGROUND' ? 3 : 1

const roleLabel = (role: string | null): string =>
    role === 'MAIN' ? '主要キャラ' : role === 'SUPPORTING' ? 'サブキャラ' : role ?? '不明'

const esc = (str: string | null | undefined): string => {
    if (str == null) return 'NULL'
    return `'${str.replace(/'/g, "''")}'`
}

// ── タグ定義 ─────────────────────────────────────────────────────

const TAG_CATEGORIES: Record<string, string[]> = {
    '髪色': ['金髪', '銀髪', '白髪', '黒髪', '茶髪', '赤髪', 'ピンク髪', '青髪', '緑髪', '紫髪', 'グレー髪', 'オレンジ髪', 'ツートーン'],
    '髪型': ['ツインテール', 'ポニーテール', 'ツーサイドアップ', 'ロングヘア', 'ショートヘア', 'ボブカット', 'お団子ヘア', 'アホ毛', '三つ編み', 'おさげ', '縦ロール', 'ウェーブヘア', 'メカクレ'],
    '顔・目': ['メガネ', '眼帯', 'オッドアイ', '赤目', '金目', 'ジト目', 'タレ目', 'つり目', '八重歯'],
    '動物・異形': ['猫耳', 'うさ耳', 'きつね耳', '犬耳', '狼耳', '獣耳(その他)', 'しっぽ', '翼', '角', '包帯'],
    '体型': ['長身', '小柄', '巨乳', '貧乳', '褐色肌', '白肌', '筋肉質', '細身', 'グラマー'],
    '年齢層': ['幼女', 'ロリ', 'ショタ', 'JK・高校生', 'お姉さん', 'おじさん', '老人'],
    '服装・萌え要素': ['制服', 'メイド服', '巫女服', '水着', 'ゴスロリ', '和服・着物', 'チャイナドレス', '軍服', 'ドレス', 'ミニスカ', 'ニーソ', 'へそ出し', 'パーカー', 'カチューシャ', 'リボン', 'チョーカー', '男の娘'],
    '性格・デレ系': ['ツンデレ', 'ヤンデレ', 'クーデレ', 'ダンデレ', 'デレデレ', 'カミデレ', 'ハジデレ', '小悪魔'],
    '性格・一般': ['天然', '元気', 'おっとり', 'クール', '真面目', 'ドジ', 'S属性', 'M属性', '無口', 'お嬢様', 'ボーイッシュ', '中二病', 'ナルシスト', 'マイペース'],
    '役割': ['主人公', 'ヒロイン', 'ライバル', '悪役', '幼馴染', '妹・弟', '兄・姉', '先輩', '委員長', '生徒会長', '転校生', '双子'],
    '家族系': ['父親', '母親'],
    '職業・身分': ['小学生', '中学生', '高校生', '大学生', '社会人', '教師', '医者・看護師', 'アイドル', '騎士', '勇者', '王族・姫', '執事', '巫女', 'シスター', '忍者', '探偵', '武道家'],
    '能力・設定': ['魔法使い', '剣士', '格闘家', '銃使い', '超能力', '天才', '異世界転生', 'ロボット・AI', '吸血鬼', 'エルフ', '人外', '妖怪', '魔王'],
    '特殊設定': ['二重人格', '記憶喪失', '不死・不老', 'ボクっ子', '不運'],
}

const ALL_TAGS = new Set(Object.values(TAG_CATEGORIES).flat())

const TAG_CATEGORY_LIST = Object.entries(TAG_CATEGORIES)
    .map(([cat, tags]) => `【${cat}】${tags.join('・')}`)
    .join('\n')

// 重複タグ・同義タグの正規化
const ALIAS_MAP: Record<string, string> = {
    'JK/高校生': 'JK・高校生',
    '和服/着物': '和服・着物',
    '妹/弟': '妹・弟',
    '兄/姉': '兄・姉',
    '医者/看護師': '医者・看護師',
    'ロボット/アンドロイド': 'ロボット・AI',
    '王族/お姫様': '王族・姫',
    '王族・お姫様': '王族・姫',
}

// 同一カテゴリ内の優先タグ（両方ある場合、左を残す）
const PRIORITY_PAIRS: [string, string][] = [
    ['JK・高校生', '高校生'],
]

const normalizeTags = (raw: string[]): string[] => {
    // エイリアス変換
    let tags = raw.map(t => ALIAS_MAP[t] ?? t)
    // 有効タグのみ残す
    tags = tags.filter(t => ALL_TAGS.has(t))
    // 重複除去
    tags = [...new Set(tags)]
    // 優先ペアの処理
    for (const [primary, redundant] of PRIORITY_PAIRS) {
        if (tags.includes(primary) && tags.includes(redundant)) {
            tags = tags.filter(t => t !== redundant)
        }
    }
    return tags
}

// ── Claude API ───────────────────────────────────────────────────

async function translateWithClaude(
    englishText: string,
    name: string,
    animeTitle: string,
    role: string | null,
): Promise<string> {
    const prompt = `あなたはアニメ翻訳の専門家です。
以下のアニメキャラクター「${name}」（作品：${animeTitle}、役割：${roleLabel(role)}）の英語説明文を自然な日本語に翻訳してください。

【翻訳ルール】
- キャラクター名は「${name}」のまま使用する（翻訳・変換しない）
- アニメ・漫画用語は日本語の慣用表現を使う
- 自然で読みやすい日本語にする（直訳・翻訳調を避ける）
- スポイラータグ（~! !~）の内容は省略する
- 翻訳文のみを返す（前置き・注釈は不要）

【原文】
${englishText}`

    const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
    })
    return res.content[0].type === 'text' ? res.content[0].text.trim() : ''
}

async function detectTags(char: {
    name: string
    animeTitle: string
    role: string | null
    gender: string | null
    age: number | null
    height: number | null
    blood_type: string | null
    birthday: string | null
    voice_actor: string | null
    description: string | null
}): Promise<string[]> {
    const info = [
        `作品: ${char.animeTitle}`,
        `名前: ${char.name}`,
        `役割: ${roleLabel(char.role)}`,
        char.gender ? `性別: ${char.gender}` : null,
        char.age != null ? `年齢: ${char.age}歳` : null,
        char.height != null ? `身長: ${char.height}cm` : null,
        char.blood_type ? `血液型: ${char.blood_type}` : null,
        char.birthday ? `誕生日: ${char.birthday}` : null,
        char.voice_actor ? `声優: ${char.voice_actor}` : null,
        char.description ? `\n【説明文】\n${char.description}` : null,
    ].filter(Boolean).join('\n')

    const prompt = `以下のアニメキャラクターに該当する属性タグをJSON配列で返してください。

【キャラクター情報】
${info}

【属性タグ一覧（カテゴリ別）】
${TAG_CATEGORY_LIST}

【判定ルール】
1. 説明文・基本情報から明確に読み取れるタグのみ選ぶ（推測・憶測は不可）
2. 同一カテゴリ内のタグは原則1つ（例：「JK・高校生」と「高校生」は重複不可）
3. 外見・性格・役割・職業・能力など多角的に判断する
4. 返答はJSON配列のみ（例: ["金髪", "ツンデレ", "高校生"]）`

    const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
    try {
        const all = [...text.matchAll(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/g)]
        const lastStart = text.lastIndexOf('[')
        const lastEnd = text.lastIndexOf(']')
        const jsonStr = all.length
            ? all[all.length - 1][1]
            : lastStart !== -1 && lastEnd > lastStart ? text.slice(lastStart, lastEnd + 1) : null
        if (!jsonStr) return []
        return normalizeTags(JSON.parse(jsonStr) as string[])
    } catch {
        return []
    }
}

// ── AniList 取得 ─────────────────────────────────────────────────

type AnilistCharData = {
    description: string | null
    voiceActor: string | null
    imageUrl: string | null
}

async function fetchAnilistChars(animeAnilistId: number): Promise<Map<number, AnilistCharData>> {
    const map = new Map<number, AnilistCharData>()
    let page = 1
    let hasNext = true

    while (hasNext) {
        let retries = 0
        let data: any = null

        while (retries < 3) {
            const res = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `query($id:Int,$page:Int){
                        Media(id:$id){
                            characters(page:$page,perPage:50,sort:ROLE){
                                pageInfo{hasNextPage}
                                edges{
                                    voiceActors(language:JAPANESE){name{native}}
                                    node{
                                        id
                                        description(asHtml:false)
                                        image{large}
                                    }
                                }
                            }
                        }
                    }`,
                    variables: { id: animeAnilistId, page },
                }),
            })
            if (res.status === 429) {
                console.log('    ⏳ レート制限 5秒待機...')
                await sleep(5000)
                retries++
                continue
            }
            data = await res.json()
            break
        }

        const chars = data?.data?.Media?.characters
        if (!chars) break

        for (const edge of chars.edges ?? []) {
            map.set(edge.node.id, {
                description: edge.node.description ?? null,
                voiceActor: edge.voiceActors?.[0]?.name?.native ?? null,
                imageUrl: edge.node.image?.large ?? null,
            })
        }

        hasNext = chars.pageInfo?.hasNextPage ?? false
        page++
        await sleep(600)
    }

    return map
}

// ── メイン ───────────────────────────────────────────────────────

async function main() {
    console.log(`\n設定: 各アニメ上位${CHAR_LIMIT}人 × ${ANIME_OFFSET + 1}位〜${ANIME_OFFSET + ANIME_LIMIT}位のアニメ\n`)

    // 上位アニメ取得
    const { data: animes, error: animeErr } = await supabase
        .from('animes')
        .select('anime_id, title, anilist_id')
        .eq('is_hidden', false)
        .order('popularity', { ascending: false, nullsFirst: false })
        .range(ANIME_OFFSET, ANIME_OFFSET + ANIME_LIMIT - 1)

    if (animeErr) throw animeErr

    // 対象キャラ収集
    type TargetChar = {
        character_id: string
        anilist_id: number | null
        name: string
        gender: string | null
        age: number | null
        height: number | null
        blood_type: string | null
        birthday: string | null
        voice_actor: string | null
        role: string | null
        anime_id: string
        anime_title: string
        anime_anilist_id: number | null
    }

    const targets: TargetChar[] = []

    for (const anime of animes) {
        const { data: chars } = await supabase
            .from('characters')
            .select('character_id, anilist_id, name, gender, age, height, blood_type, birthday, voice_actor, role, favourites')
            .eq('anime_id', anime.anime_id)

        const sorted = (chars ?? []).sort((a: any, b: any) => {
            const rd = roleRank(a.role) - roleRank(b.role)
            if (rd !== 0) return rd
            return (b.favourites ?? 0) - (a.favourites ?? 0)
        })

        for (const c of sorted.slice(0, CHAR_LIMIT)) {
            targets.push({
                character_id: c.character_id,
                anilist_id: c.anilist_id,
                name: c.name,
                gender: c.gender,
                age: c.age,
                height: c.height,
                blood_type: c.blood_type,
                birthday: c.birthday,
                voice_actor: c.voice_actor,
                role: c.role,
                anime_id: anime.anime_id,
                anime_title: anime.title,
                anime_anilist_id: anime.anilist_id,
            })
        }
    }

    console.log(`📋 対象: ${targets.length}件\n`)

    // AniList からdescription取得
    console.log('🌐 AniListからdescription取得中...')
    const anilistMap = new Map<number, AnilistCharData>()

    const uniqueAnimeIds = [...new Set(
        animes.map(a => a.anilist_id).filter((id): id is number => id != null)
    )]

    for (let i = 0; i < uniqueAnimeIds.length; i++) {
        const id = uniqueAnimeIds[i]
        const title = animes.find(a => a.anilist_id === id)?.title ?? id
        process.stdout.write(`  [${i + 1}/${uniqueAnimeIds.length}] ${title}...`)
        const charMap = await fetchAnilistChars(id)
        for (const [charId, data] of charMap) anilistMap.set(charId, data)
        console.log(` ${charMap.size}件`)
        await sleep(1000)
    }

    // 翻訳・タグ抽出
    console.log('\n✨ 翻訳・タグ抽出中...\n')

    const sqlLines = [
        `-- enrichCharsV2.ts による翻訳・タグ抽出`,
        `-- 生成日: ${new Date().toLocaleDateString('ja-JP')}`,
        `-- 対象: ${targets.length}件 (上位${CHAR_LIMIT}人 × 上位${ANIME_LIMIT}アニメ)`,
        '',
    ]

    let translated = 0, tagged = 0, noDesc = 0

    for (let i = 0; i < targets.length; i++) {
        const char = targets[i]
        const anilistData = char.anilist_id != null ? anilistMap.get(char.anilist_id) : null
        const rawDesc = anilistData?.description ?? null

        // 声優はAniListから取得、DBにないケースを補完
        const voiceActor = char.voice_actor ?? anilistData?.voiceActor ?? null

        const cleaned = prepareDescription(rawDesc)
        let description: string | null = null
        let translateStatus = ''

        if (cleaned && !isJapanese(cleaned)) {
            try {
                description = await translateWithClaude(cleaned, char.name, char.anime_title, char.role)
                translateStatus = '翻訳済み'
                translated++
                await sleep(300)
            } catch {
                translateStatus = '翻訳失敗'
                description = null
            }
        } else if (cleaned && isJapanese(cleaned)) {
            description = cleaned
            translateStatus = '日本語のまま'
        } else {
            translateStatus = '説明なし'
            noDesc++
        }

        // タグ抽出（説明文なしでも実行）
        let tags: string[] = []
        try {
            tags = await detectTags({
                name: char.name,
                animeTitle: char.anime_title,
                role: char.role,
                gender: char.gender,
                age: char.age,
                height: char.height,
                blood_type: char.blood_type,
                birthday: char.birthday,
                voice_actor: voiceActor,
                description,
            })
            if (tags.length > 0) tagged++
            await sleep(300)
        } catch {
            // タグなしで継続
        }

        const tagDisplay = tags.length > 0 ? tags.join(' / ') : 'なし'
        console.log(`[${i + 1}/${targets.length}] ${char.name} (${char.anime_title})`)
        console.log(`  ${translateStatus} | タグ: ${tagDisplay}`)
        if (description) console.log(`  説明: ${description.slice(0, 80)}...`)
        console.log()

        // SQL生成
        const tagsVal = tags.length > 0
            ? `ARRAY[${tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]`
            : 'NULL'
        const voiceActorUpdate = voiceActor !== char.voice_actor ? `, voice_actor = ${esc(voiceActor)}` : ''
        sqlLines.push(
            `UPDATE characters SET description = ${esc(description)}, tags = ${tagsVal}${voiceActorUpdate} WHERE character_id = '${char.character_id}'; -- ${char.name}`
        )
    }

    // SQLファイル出力
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rangeLabel = `offset${ANIME_OFFSET}-${ANIME_OFFSET + ANIME_LIMIT - 1}`
    const outPath = `scripts/sql/patches/15_enrich_${rangeLabel}_${timestamp}.sql`
    fs.writeFileSync(outPath, sqlLines.join('\n'), 'utf8')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ 完了: ${targets.length}件処理`)
    console.log(`   翻訳: ${translated}件 / 説明なし: ${noDesc}件`)
    console.log(`   タグ付き: ${tagged}件`)
    console.log(`\n📄 SQL出力先: ${outPath}`)
    console.log('   → Supabase SQL Editorで実行してください')
}

main().catch(console.error)
