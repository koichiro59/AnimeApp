import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)
const ANILIST_URL = 'https://graphql.anilist.co'

const QUERY = `
query ($ids: [Int]) {
    Page(perPage: 50) {
        media(id_in: $ids, type: ANIME) {
            id
            popularity
        }
    }
}
`

async function fetchPopularity(ids: number[]): Promise<{ id: number; popularity: number }[]> {
    const res = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: QUERY, variables: { ids } }),
    })
    const data = await res.json()
    return data.data?.Page?.media ?? []
}

function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
    return result
}

async function main() {
    console.log('📥 アニメ一覧を取得中...')
    const { data: animes, error } = await supabase
        .from('animes')
        .select('anime_id, anilist_id, title')
        .not('anilist_id', 'is', null)

    if (error) throw error
    console.log(`対象: ${animes!.length}件\n`)

    const chunks = chunk(animes!, 50)
    const updates: string[] = []
    let found = 0

    for (let i = 0; i < chunks.length; i++) {
        const group = chunks[i]
        const ids = group.map((a) => a.anilist_id as number)

        try {
            const results = await fetchPopularity(ids)
            const popMap = new Map(results.map((r) => [r.id, r.popularity]))

            for (const anime of group) {
                const pop = popMap.get(anime.anilist_id as number)
                if (pop != null) {
                    updates.push(`UPDATE animes SET popularity = ${pop} WHERE anime_id = '${anime.anime_id}';`)
                    found++
                }
            }
            console.log(`[${i + 1}/${chunks.length}] ${found}件取得済み`)
        } catch (e) {
            console.log(`[${i + 1}/${chunks.length}] ⚠️ 失敗: ${e}`)
        }

        await new Promise((r) => setTimeout(r, 600))
    }

    // キャラクターの popularity はアニメから引き継ぐ
    updates.push('')
    updates.push('-- キャラクターの人気度をアニメから引き継ぎ')
    updates.push('UPDATE characters c SET popularity = a.popularity FROM animes a WHERE c.anime_id = a.anime_id;')

    const outputFile = 'scripts/backfill_popularity.sql'
    fs.writeFileSync(outputFile, updates.join('\n'), 'utf8')
    console.log(`\n✅ ${found}件のアニメSQL + キャラ一括UPDATE生成 → ${outputFile}`)
    console.log('📋 Supabase SQL Editorで実行してください')
}

main().catch(console.error)
