/**
 * findEnglishChars2023.ts
 * 2023年春・夏アニメで英語説明文が残っているキャラを特定する
 * 実行: npx tsx scripts/findEnglishChars2023.ts
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!

const isJapanese = (text: string): boolean =>
    /[ぁ-んァ-ン一-龯]/.test(text)

const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
}

const main = async () => {
    // 2023年春・夏アニメを取得
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/animes?select=anime_id,title,broadcast_season&broadcast_season=like.*2023年*&limit=500`,
        { headers }
    )
    const animes: { anime_id: string; title: string; broadcast_season: string }[] = await res.json()

    const targets = animes.filter(a =>
        a.broadcast_season.includes('2023年春') || a.broadcast_season.includes('2023年夏')
    )

    console.log(`📺 2023年春・夏アニメ: ${targets.length}件\n`)

    // 各アニメの英語説明文キャラを収集
    const results: { anime_title: string; broadcast_season: string; character_id: string; name: string; description: string }[] = []

    for (const anime of targets) {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/characters?select=character_id,name,description&anime_id=eq.${anime.anime_id}&description=not.is.null&limit=500`,
            { headers }
        )
        const chars: { character_id: string; name: string; description: string }[] = await res.json()

        const englishChars = chars.filter(c => c.description && !isJapanese(c.description))
        if (englishChars.length > 0) {
            for (const c of englishChars) {
                results.push({
                    anime_title: anime.title,
                    broadcast_season: anime.broadcast_season,
                    character_id: c.character_id,
                    name: c.name,
                    description: c.description.slice(0, 60) + (c.description.length > 60 ? '...' : ''),
                })
            }
        }
    }

    // 結果表示
    console.log(`🔍 英語説明文が残っているキャラ: ${results.length}件\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    let currentAnime = ''
    for (const r of results) {
        if (r.anime_title !== currentAnime) {
            currentAnime = r.anime_title
            console.log(`\n📌 ${r.anime_title}（${r.broadcast_season}）`)
        }
        console.log(`  ${r.character_id} | ${r.name}`)
        console.log(`  "${r.description}"`)
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 集計
    const byAnime: Record<string, number> = {}
    for (const r of results) {
        byAnime[r.anime_title] = (byAnime[r.anime_title] ?? 0) + 1
    }
    console.log('\n📊 アニメ別件数:')
    for (const [title, count] of Object.entries(byAnime).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${count}件 | ${title}`)
    }
    console.log(`\n合計: ${results.length}件`)
}

main().catch(console.error)
