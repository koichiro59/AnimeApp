import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!

// role が NULL のキャラを Supabase から取得
const fetchNullRoleCharacters = async (): Promise<{ character_id: string; anilist_id: number }[]> => {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/characters?select=character_id,anilist_id&role=is.null&anilist_id=not.is.null&limit=1000`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    return res.json()
}

// AniList からキャラの role を取得
const fetchRoleFromAnilist = async (anilistId: number): Promise<string | null> => {
    const query = `
        query ($id: Int) {
            Character(id: $id) {
                media(perPage: 1, sort: POPULARITY_DESC) {
                    edges { characterRole }
                }
            }
        }
    `
    let retries = 0
    while (retries < 3) {
        const res = await fetch(ANILIST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { id: anilistId } }),
        })
        if (res.status === 429) {
            console.log(`  ⏳ レート制限。5秒待機...`)
            await new Promise(r => setTimeout(r, 5000))
            retries++
            continue
        }
        const data = await res.json()
        const role = data?.data?.Character?.media?.edges?.[0]?.characterRole
        return role ?? null
    }
    return null
}

// Supabase の role を更新
const updateRole = async (characterId: string, role: string): Promise<void> => {
    await fetch(
        `${SUPABASE_URL}/rest/v1/characters?character_id=eq.${characterId}`,
        {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({ role }),
        }
    )
}

const main = async () => {
    console.log('🔍 role が NULL のキャラを取得中...')
    const chars = await fetchNullRoleCharacters()
    console.log(`  ${chars.length}件 見つかりました`)

    let updated = 0
    let skipped = 0
    const total = chars.length

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        const progress = `[${i + 1}/${total}]`
        const role = await fetchRoleFromAnilist(char.anilist_id)
        if (!role) {
            console.log(`  ${progress} ⚠️  ${char.character_id} → role 取得失敗`)
            skipped++
        } else {
            await updateRole(char.character_id, role)
            console.log(`  ${progress} ✅ ${char.character_id} → ${role}`)
            updated++
        }
        await new Promise(r => setTimeout(r, 400))
    }

    console.log(`\n完了: ${updated}件 更新, ${skipped}件 スキップ`)
    console.log('\n次に Supabase SQL Editor で scripts/fix_anime_rank.sql を実行してください。')
}

main().catch(console.error)
