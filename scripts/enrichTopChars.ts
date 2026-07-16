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

// ── ユーティリティ ───────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const isJapanese = (text: string | null | undefined): boolean =>
    text ? /[぀-ゟ゠-ヿ一-龯]/.test(text) : false

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

const roleRank = (role: string | null): number => {
    if (role === 'SUPPORTING') return 2
    if (role === 'BACKGROUND') return 3
    return 1
}

// ── タグ定義 (tagCharacters.ts と同じ) ──────────────────────────

const TAG_CATEGORIES: Record<string, string[]> = {
    '髪色': ['金髪', '銀髪', '白髪', '黒髪', '茶髪', '赤髪', 'ピンク髪', '青髪', '緑髪', '紫髪', 'グレー髪', 'オレンジ髪', 'ツートーン'],
    '髪型': ['ツインテール', 'ポニーテール', 'ツーサイドアップ', 'ロングヘア', 'ショートヘア', 'ボブカット', 'お団子ヘア', 'アホ毛', '三つ編み', 'おさげ', '縦ロール', 'ウェーブヘア', 'メカクレ'],
    '顔・目': ['メガネ', '眼帯', 'オッドアイ', '赤目', '金目', 'ジト目', 'タレ目', 'つり目', '八重歯'],
    '動物・異形': ['猫耳', 'うさ耳', 'きつね耳', '犬耳', '狼耳', '獣耳(その他)', 'しっぽ', '翼', '角', '包帯'],
    '体型': ['長身', '小柄', '巨乳', '貧乳', '褐色肌', '白肌', '筋肉質', '細身', 'グラマー'],
    '年齢層': ['幼女', 'ロリ', 'ショタ', 'JK/高校生', 'お姉さん', 'おじさん', '老人'],
    '服装・萌え要素': ['制服', 'メイド服', '巫女服', '水着', 'ゴスロリ', '和服/着物', 'チャイナドレス', '軍服', 'ドレス', 'ミニスカ', 'ニーソ', 'へそ出し', 'パーカー', 'カチューシャ', 'リボン', 'チョーカー', '男の娘'],
    '性格・デレ系': ['ツンデレ', 'ヤンデレ', 'クーデレ', 'ダンデレ', 'デレデレ', 'カミデレ', 'ハジデレ', '小悪魔'],
    '性格・一般': ['天然', '元気', 'おっとり', 'クール', '真面目', 'ドジ', 'S属性', 'M属性', '無口', 'お嬢様', 'ボーイッシュ', '中二病', 'ナルシスト', 'マイペース'],
    '役割': ['主人公', 'ヒロイン', 'ライバル', '悪役', '幼馴染', '妹/弟', '兄/姉', '先輩', '委員長', '生徒会長', '転校生', '双子'],
    '家族系': ['父親', '母親', 'シングルファーザー', 'シングルマザー'],
    '職業・身分': ['高校生', '中学生', '大学生', '社会人', '教師', '医者/看護師', 'アイドル', '騎士', '勇者', '王族/お姫様', '執事', '巫女', 'シスター', '忍者', '探偵', '武道家'],
    '能力・設定': ['魔法使い', '剣士', '格闘家', '銃使い', '超能力', '天才', '異世界転生', 'ロボット/アンドロイド', '吸血鬼', 'エルフ', '人外', '妖怪', '魔王'],
    '特殊設定': ['二重人格', '記憶喪失', '不死/不老', 'ボクっ子', 'TS', '不運'],
}

const ALL_TAGS = new Set(Object.values(TAG_CATEGORIES).flat())
const TAG_CATEGORY_LIST = Object.entries(TAG_CATEGORIES)
    .map(([cat, tags]) => `【${cat}】${tags.join('、')}`)
    .join('\n')

// ── Claude API ───────────────────────────────────────────────────

async function translateWithClaude(text: string, name: string): Promise<string> {
    const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{
            role: 'user',
            content: `アニメキャラクター「${name}」の説明文を自然な日本語に翻訳してください。アニメファン向けの読みやすい文体で、原文のニュアンスを忠実に伝えてください。翻訳文のみを返してください。\n\n${text}`
        }]
    })
    return res.content[0].type === 'text' ? res.content[0].text.trim() : ''
}

async function detectTags(char: {
    name: string
    gender: string | null
    age: number | null
    height: number | null
    description: string | null
}): Promise<string[]> {
    const info = [
        `名前: ${char.name}`,
        char.gender ? `性別: ${char.gender}` : null,
        char.age != null ? `年齢: ${char.age}歳` : null,
        char.height != null ? `身長: ${char.height}cm` : null,
        char.description ? `説明文:\n${char.description}` : null,
    ].filter(Boolean).join('\n')

    const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [{
            role: 'user',
            content: `以下のアニメキャラクターの情報を分析して、該当する属性タグをJSON配列で返してください。

【キャラクター情報】
${info}

【属性タグ一覧（カテゴリ別）】
${TAG_CATEGORY_LIST}

【ルール】
- 説明文や性別・年齢・身長から確実に判断できるタグのみを選ぶ
- 推測・憶測でのタグ付けは避ける
- 該当するタグが複数あれば全て選択
- 返答はJSONの文字列配列のみ（例: ["金髪", "ツンデレ", "高校生"]）`
        }]
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
        return (JSON.parse(jsonStr) as string[]).filter(t => ALL_TAGS.has(t))
    } catch {
        return []
    }
}

// ── AniList 取得 ─────────────────────────────────────────────────

async function fetchAnilistChars(animeAnilistId: number): Promise<Map<number, string | null>> {
    const map = new Map<number, string | null>()
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
                    query: `query($id:Int,$page:Int){Media(id:$id){characters(page:$page,perPage:50,sort:ROLE){pageInfo{hasNextPage}edges{node{id description(asHtml:false)}}}}}`,
                    variables: { id: animeAnilistId, page }
                })
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
            map.set(edge.node.id, edge.node.description ?? null)
        }

        hasNext = chars.pageInfo?.hasNextPage ?? false
        page++
        await sleep(600)
    }

    return map
}

// ── メイン ───────────────────────────────────────────────────────

async function main() {
    // 1. 上位40アニメ取得
    console.log('📺 上位40アニメを取得中...')
    const { data: animes, error: animeErr } = await supabase
        .from('animes')
        .select('anime_id, title, anilist_id')
        .eq('is_hidden', false)
        .order('popularity', { ascending: false, nullsFirst: false })
        .range(0, 39)

    if (animeErr) throw animeErr
    console.log(`  ${animes.length}件取得`)

    // 2. 各アニメのキャラ全件取得 → ソート → 上位10人抽出
    console.log('\n👥 対象キャラクター抽出中...')
    type TargetChar = {
        character_id: string
        anilist_id: number | null
        name: string
        gender: string | null
        age: number | null
        height: number | null
        anime_id: string
        anime_title: string
        anime_anilist_id: number | null
    }

    const targets: TargetChar[] = []

    for (const anime of animes) {
        const { data: chars, error: charErr } = await supabase
            .from('characters')
            .select('character_id, anilist_id, name, gender, age, height, role, favourites')
            .eq('anime_id', anime.anime_id)

        if (charErr) { console.log(`  ⚠️  ${anime.title}: ${charErr.message}`); continue }

        const sorted = [...(chars ?? [])].sort((a, b) => {
            const rd = roleRank(a.role) - roleRank(b.role)
            if (rd !== 0) return rd
            const fd = (b.favourites ?? 0) - (a.favourites ?? 0)
            if (fd !== 0) return fd
            return a.character_id.localeCompare(b.character_id)
        })

        for (const c of sorted.slice(0, 10)) {
            targets.push({
                character_id: c.character_id,
                anilist_id: c.anilist_id,
                name: c.name,
                gender: c.gender,
                age: c.age,
                height: c.height,
                anime_id: anime.anime_id,
                anime_title: anime.title,
                anime_anilist_id: anime.anilist_id,
            })
        }
    }

    console.log(`  対象: ${targets.length}件`)

    // 3. アニメ別にAniListからdescription取得
    console.log('\n🌐 AniListからdescription取得中...')
    const anilistDescMap = new Map<number, string | null>() // anilist_id → description

    const uniqueAnimeAnilistIds = [...new Set(
        animes.map(a => a.anilist_id).filter((id): id is number => id != null)
    )]

    for (let i = 0; i < uniqueAnimeAnilistIds.length; i++) {
        const id = uniqueAnimeAnilistIds[i]
        const anime = animes.find(a => a.anilist_id === id)
        process.stdout.write(`  [${i + 1}/${uniqueAnimeAnilistIds.length}] ${anime?.title ?? id}...`)
        const charMap = await fetchAnilistChars(id)
        for (const [charId, desc] of charMap) {
            anilistDescMap.set(charId, desc)
        }
        console.log(` ${charMap.size}件`)
        await sleep(1000)
    }

    // 4. 各キャラに翻訳 + タグ抽出 → Supabase更新
    console.log('\n✨ 翻訳・タグ抽出・DB更新中...\n')
    let done = 0
    let translated = 0
    let tagged = 0
    let skipped = 0

    for (const char of targets) {
        process.stdout.write(`[${done + 1}/${targets.length}] ${char.name}`)

        // AniListのdescription（英語原文）を取得
        const rawDesc = char.anilist_id != null ? anilistDescMap.get(char.anilist_id) ?? null : null
        const cleaned = prepareDescription(rawDesc)

        let description: string | null = null
        let newTags: string[] = []

        // 翻訳
        if (cleaned && !isJapanese(cleaned)) {
            try {
                description = await translateWithClaude(cleaned, char.name)
                process.stdout.write(' → 翻訳済み')
                translated++
                await sleep(300)
            } catch (e) {
                process.stdout.write(' → 翻訳失敗')
            }
        } else if (cleaned && isJapanese(cleaned)) {
            description = cleaned
            process.stdout.write(' → 日本語のまま')
        } else {
            process.stdout.write(' → 説明なし')
            skipped++
        }

        // タグ抽出
        try {
            newTags = await detectTags({
                name: char.name,
                gender: char.gender,
                age: char.age,
                height: char.height,
                description,
            })
            if (newTags.length > 0) {
                process.stdout.write(` | タグ: ${newTags.join('/')}`)
                tagged++
            }
            await sleep(300)
        } catch (e) {
            process.stdout.write(' | タグ失敗')
        }

        // Supabase更新
        const update: Record<string, any> = { tags: newTags.length > 0 ? newTags : null }
        if (description != null) update.description = description

        const { error: updateErr } = await supabase
            .from('characters')
            .update(update)
            .eq('character_id', char.character_id)

        if (updateErr) {
            console.log(` ⚠️  更新失敗: ${updateErr.message}`)
        } else {
            console.log()
        }

        done++
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ 完了: ${done}件処理`)
    console.log(`   翻訳: ${translated}件 / 説明なし・日本語スキップ: ${skipped}件`)
    console.log(`   タグ付き: ${tagged}件`)
}

main().catch(console.error)
