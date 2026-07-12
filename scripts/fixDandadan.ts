import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)
const ANILIST_URL = 'https://graphql.anilist.co'

const TARGET_ANIMES = [
    { title: 'ダンダダン', anilist_id: 171018 },
    { title: 'ダンダダン 第2期', anilist_id: 185660 },
    { title: '俺だけ Season2', anilist_id: 176496 },
]

async function fetchAniListChars(animeAnilistId: number) {
    const allChars: { anilistId: number; role: string; favourites: number }[] = []
    let page = 1
    while (true) {
        const res = await fetch(ANILIST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query ($id: Int, $page: Int) {
                    Media(id: $id) {
                        characters(page: $page, perPage: 50, sort: ROLE) {
                            pageInfo { hasNextPage }
                            edges {
                                role
                                node { id favourites name { native full } }
                            }
                        }
                    }
                }`,
                variables: { id: animeAnilistId, page }
            })
        })
        const json = await res.json()
        const charData = json.data?.Media?.characters
        if (!charData) break
        for (const edge of charData.edges ?? []) {
            allChars.push({ anilistId: edge.node.id, role: edge.role, favourites: edge.node.favourites })
            console.log(`  AniList id:${edge.node.id} role:${edge.role} fav:${edge.node.favourites} ${edge.node.name.native ?? edge.node.name.full}`)
        }
        if (!charData.pageInfo?.hasNextPage) break
        page++
        await new Promise(r => setTimeout(r, 800))
    }
    return allChars
}

async function main() {
    const updates: string[] = []

    for (const target of TARGET_ANIMES) {
        console.log(`\n=== ${target.title} (${target.anilist_id}) ===`)

        // DBからキャラ取得
        const { data: anime } = await supabase.from('animes').select('anime_id').eq('anilist_id', target.anilist_id).single()
        if (!anime) { console.log('DBにアニメなし'); continue }

        const { data: dbChars } = await supabase
            .from('characters')
            .select('character_id, anilist_id, name')
            .eq('anime_id', (anime as any).anime_id)
            .not('anilist_id', 'is', null)

        const dbMap = new Map<number, string>()
        for (const c of dbChars ?? []) dbMap.set(c.anilist_id, c.character_id)
        console.log(`DB: ${dbMap.size}件`)

        // AniListからロール・favs取得
        const anilistChars = await fetchAniListChars(target.anilist_id)

        let matched = 0
        for (const { anilistId, role, favourites } of anilistChars) {
            const charId = dbMap.get(anilistId)
            if (!charId) continue
            const favVal = typeof favourites === 'number' ? favourites : 'NULL'
            updates.push(`UPDATE characters SET role = '${role}', favourites = ${favVal} WHERE character_id = '${charId}';`)
            matched++
        }
        console.log(`マッチ: ${matched}件`)
        await new Promise(r => setTimeout(r, 500))
    }

    // anime_rank 再計算
    updates.push('')
    updates.push('-- anime_rank 再計算')
    updates.push(`UPDATE characters c SET anime_rank = sub.rank
FROM (
    SELECT character_id,
           ROW_NUMBER() OVER (
               PARTITION BY anime_id
               ORDER BY
                   CASE role WHEN 'MAIN' THEN 1 WHEN 'SUPPORTING' THEN 2 ELSE 3 END,
                   favourites DESC NULLS LAST
           ) AS rank
    FROM characters
) sub
WHERE c.character_id = sub.character_id;`)

    const outputFile = 'scripts/fix_dandadan_roles.sql'
    fs.writeFileSync(outputFile, updates.join('\n'), 'utf8')
    console.log(`\n✅ ${updates.length}行のSQL生成 → ${outputFile}`)
}

main().catch(console.error)
