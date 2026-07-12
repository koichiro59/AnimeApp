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
query ($id: Int, $page: Int) {
    Media(id: $id) {
        characters(page: $page, perPage: 50, sort: ROLE) {
            pageInfo { hasNextPage }
            edges {
                role
                node { id }
            }
        }
    }
}
`

async function fetchRoles(animeAnilistId: number): Promise<{ anilistId: number; role: string }[]> {
    let page = 1
    let hasNextPage = true
    const results: { anilistId: number; role: string }[] = []

    while (hasNextPage) {
        let retries = 0
        let data: any = null

        while (retries < 3) {
            const res = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: QUERY, variables: { id: animeAnilistId, page } }),
            })
            if (res.status === 429) {
                await new Promise(r => setTimeout(r, 5000))
                retries++
                continue
            }
            data = await res.json()
            break
        }

        const charData = data?.data?.Media?.characters
        if (!charData) break

        for (const edge of charData.edges ?? []) {
            results.push({ anilistId: edge.node.id, role: edge.role })
        }

        hasNextPage = charData.pageInfo?.hasNextPage ?? false
        page++
        await new Promise(r => setTimeout(r, 500))
    }

    return results
}

async function main() {
    console.log('📥 アニメ一覧取得中...')
    const { data: animes, error } = await supabase
        .from('animes')
        .select('anime_id, anilist_id, title')
        .not('anilist_id', 'is', null)

    if (error) throw error

    // DB上のキャラ：anilist_id → character_id マップ
    const { data: allChars } = await supabase
        .from('characters')
        .select('character_id, anilist_id')
        .not('anilist_id', 'is', null)

    const charMap = new Map<number, string>()
    for (const c of allChars ?? []) {
        charMap.set(c.anilist_id, c.character_id)
    }

    console.log(`アニメ: ${animes!.length}件 / キャラ: ${charMap.size}件\n`)

    const updates: string[] = []
    let found = 0

    for (let i = 0; i < animes!.length; i++) {
        const anime = animes![i]
        try {
            const roles = await fetchRoles(anime.anilist_id as number)

            for (const { anilistId, role } of roles) {
                const characterId = charMap.get(anilistId)
                if (characterId) {
                    updates.push(`UPDATE characters SET role = '${role}' WHERE character_id = '${characterId}';`)
                    found++
                }
            }

            if ((i + 1) % 10 === 0 || i === animes!.length - 1) {
                console.log(`[${i + 1}/${animes!.length}] ${found}件のロール取得済み`)
            }
        } catch (e) {
            console.log(`[${i + 1}/${animes!.length}] ⚠️ 失敗: ${anime.title} - ${e}`)
        }

        await new Promise(r => setTimeout(r, 600))
    }

    // anime_rank をロール基準で再計算
    updates.push('')
    updates.push('-- anime_rank をロール基準で再計算（MAIN→SUPPORTING→BACKGROUND、同一ロール内はfavourites順）')
    updates.push(`UPDATE characters c SET anime_rank = sub.rank
FROM (
    SELECT character_id,
           ROW_NUMBER() OVER (
               PARTITION BY anime_id
               ORDER BY
                   CASE role
                       WHEN 'MAIN'       THEN 1
                       WHEN 'SUPPORTING' THEN 2
                       ELSE                   3
                   END,
                   favourites DESC NULLS LAST
           ) AS rank
    FROM characters
) sub
WHERE c.character_id = sub.character_id;`)

    const outputFile = 'scripts/backfill_character_roles.sql'
    fs.writeFileSync(outputFile, updates.join('\n'), 'utf8')
    console.log(`\n✅ ${found}件のロールSQL + anime_rank再計算を生成 → ${outputFile}`)
    console.log('📋 Supabase SQL Editorで実行してください')
}

main().catch(console.error)
