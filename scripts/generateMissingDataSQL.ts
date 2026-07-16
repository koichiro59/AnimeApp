/**
 * generateMissingDataSQL.ts
 *
 * role または favourites が NULL のキャラを対象に、
 * AniList からアニメ単位でキャラ情報を取得して SQL UPDATE 文を生成する。
 *
 * 出力: scripts/backfill_missing_data.sql
 * 実行: npx tsx scripts/generateMissingDataSQL.ts
 */

import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const OUTPUT_PATH = 'scripts/sql/patches/91_backfill_missing_data.sql'
const DELAY_MS = 700

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// role=null または favourites=null のキャラを全件取得
const fetchTargetCharacters = async (): Promise<{ character_id: string; anime_id: string; anilist_id: number; role: string | null; favourites: number | null }[]> => {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/characters?select=character_id,anime_id,anilist_id,role,favourites&or=(role.is.null,favourites.is.null)&anilist_id=not.is.null&limit=20000`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) throw new Error(`Supabase characters fetch failed: ${res.status}`)
    return res.json()
}

// anime_id → anilist_id のマップを取得
const fetchAnimeAnilistIds = async (animeIds: string[]): Promise<Map<string, number>> => {
    const BATCH = 200
    const map = new Map<string, number>()
    for (let i = 0; i < animeIds.length; i += BATCH) {
        const batch = animeIds.slice(i, i + BATCH)
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/animes?select=anime_id,anilist_id&anime_id=in.(${batch.join(',')})`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        )
        if (!res.ok) throw new Error(`Supabase animes fetch failed: ${res.status}`)
        const data: { anime_id: string; anilist_id: number }[] = await res.json()
        data.forEach(a => map.set(a.anime_id, a.anilist_id))
    }
    return map
}

// AniList: アニメのキャラ一覧（role + favourites）をページネーションで全件取得
const fetchAnilistCharacters = async (
    animeAnilistId: number
): Promise<{ anilistCharId: number; role: string; favourites: number }[]> => {
    const query = `
        query ($id: Int, $page: Int) {
            Media(id: $id, type: ANIME) {
                characters(sort: ROLE, perPage: 25, page: $page) {
                    pageInfo { hasNextPage }
                    edges {
                        role
                        node { id favourites }
                    }
                }
            }
        }
    `
    const results: { anilistCharId: number; role: string; favourites: number }[] = []
    let page = 1

    while (true) {
        let retries = 0
        let data: any = null

        while (retries < 3) {
            const res = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables: { id: animeAnilistId, page } }),
            })
            if (res.status === 429) {
                console.log('  ⏳ レート制限。10秒待機...')
                await sleep(10000)
                retries++
                continue
            }
            data = await res.json()
            break
        }

        const characters = data?.data?.Media?.characters
        if (!characters) break

        for (const edge of characters.edges) {
            results.push({
                anilistCharId: edge.node.id,
                role: edge.role,
                favourites: edge.node.favourites ?? 0,
            })
        }

        if (!characters.pageInfo.hasNextPage) break
        page++
        await sleep(DELAY_MS)
    }

    return results
}

const main = async () => {
    console.log('📥 対象キャラを Supabase から取得中...')
    const chars = await fetchTargetCharacters()
    console.log(`  ${chars.length} 件対象（role または favourites が NULL）`)

    // anime_id でグループ化
    const byAnime = new Map<string, typeof chars>()
    for (const c of chars) {
        if (!byAnime.has(c.anime_id)) byAnime.set(c.anime_id, [])
        byAnime.get(c.anime_id)!.push(c)
    }

    const animeIds = [...byAnime.keys()]
    console.log(`  対象アニメ数: ${animeIds.length}`)

    console.log('\n📥 アニメの AniList ID を取得中...')
    const animeAnilistMap = await fetchAnimeAnilistIds(animeIds)

    const updates: string[] = []
    let animeCount = 0
    let matchedCount = 0

    const startTime = Date.now()

    const formatElapsed = () => {
        const sec = Math.floor((Date.now() - startTime) / 1000)
        const m = Math.floor(sec / 60).toString().padStart(2, '0')
        const s = (sec % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    console.log('\n🔍 AniList からキャラ情報を取得中...\n')

    for (const animeId of animeIds) {
        const animeAnilistId = animeAnilistMap.get(animeId)
        animeCount++

        const pct = Math.round((animeCount / animeIds.length) * 100)
        const prefix = `[${animeCount}/${animeIds.length}] (${pct}%) [${formatElapsed()}]`

        if (!animeAnilistId) {
            console.log(`${prefix} ${animeId} → AniList ID なし、スキップ`)
            continue
        }

        process.stdout.write(`${prefix} ${animeId} (AniList: ${animeAnilistId}) ... `)

        const anilistChars = await fetchAnilistCharacters(animeAnilistId)

        // anilist_id → AniList キャラ情報のマップ
        const anilistMap = new Map(anilistChars.map(c => [c.anilistCharId, c]))

        let animeUpdates = 0
        for (const char of byAnime.get(animeId)!) {
            const anilistChar = anilistMap.get(char.anilist_id)
            if (!anilistChar) continue

            const setClauses: string[] = []
            if (char.role === null) setClauses.push(`role = '${anilistChar.role}'`)
            if (char.favourites === null) setClauses.push(`favourites = ${anilistChar.favourites}`)

            if (setClauses.length > 0) {
                updates.push(`UPDATE characters SET ${setClauses.join(', ')} WHERE character_id = '${char.character_id}';`)
                matchedCount++
                animeUpdates++
            }
        }

        console.log(`✅ ${animeUpdates}件更新 (累計: ${matchedCount}件)`)

        await sleep(DELAY_MS)
    }

    if (updates.length === 0) {
        console.log('\n✅ 更新対象なし。')
        return
    }

    const sql = [
        '-- generateMissingDataSQL.ts による自動生成',
        `-- 対象: ${updates.length} 件`,
        '',
        ...updates,
    ].join('\n')

    fs.writeFileSync(OUTPUT_PATH, sql, 'utf-8')
    console.log(`\n✅ 完了: ${matchedCount} 件の UPDATE を ${OUTPUT_PATH} に出力しました。`)
    console.log('Supabase SQL Editor で実行してください。')
}

main().catch(console.error)
