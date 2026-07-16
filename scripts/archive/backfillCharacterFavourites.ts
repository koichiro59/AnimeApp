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
        characters(id_in: $ids) {
            id
            favourites
        }
    }
}
`

async function fetchFavourites(ids: number[]): Promise<{ id: number; favourites: number }[]> {
    const res = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: QUERY, variables: { ids } }),
    })
    const data = await res.json()
    return data.data?.Page?.characters ?? []
}

function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
    return result
}

async function main() {
    console.log('📥 キャラ一覧取得中...')
    const { data: characters, error } = await supabase
        .from('characters')
        .select('character_id, anilist_id')
        .not('anilist_id', 'is', null)

    if (error) throw error
    console.log(`対象: ${characters!.length}件\n`)

    const chunks = chunk(characters!, 50)
    const updates: string[] = []
    let found = 0

    for (let i = 0; i < chunks.length; i++) {
        const group = chunks[i]
        const ids = group.map((c) => c.anilist_id as number)

        try {
            const results = await fetchFavourites(ids)
            const favMap = new Map(results.map((r) => [r.id, r.favourites]))

            for (const char of group) {
                const fav = favMap.get(char.anilist_id as number) ?? 0
                updates.push(`UPDATE characters SET favourites = ${fav} WHERE character_id = '${char.character_id}';`)
                found++
            }
            console.log(`[${i + 1}/${chunks.length}] ${found}件処理済み`)
        } catch (e) {
            console.log(`[${i + 1}/${chunks.length}] ⚠️ 失敗: ${e}`)
        }

        await new Promise((r) => setTimeout(r, 600))
    }

    // アニメ内ランクを一括計算
    updates.push('')
    updates.push('-- アニメ内でのキャラ人気ランクを計算（1=最人気）')
    updates.push(`UPDATE characters c SET anime_rank = sub.rank
FROM (
    SELECT character_id,
           ROW_NUMBER() OVER (PARTITION BY anime_id ORDER BY favourites DESC NULLS LAST) AS rank
    FROM characters
) sub
WHERE c.character_id = sub.character_id;`)

    const outputFile = 'scripts/backfill_character_favourites.sql'
    fs.writeFileSync(outputFile, updates.join('\n'), 'utf8')
    console.log(`\n✅ ${found}件のSQL + anime_rank計算を生成 → ${outputFile}`)
    console.log('📋 Supabase SQL Editorで実行してください')
}

main().catch(console.error)
