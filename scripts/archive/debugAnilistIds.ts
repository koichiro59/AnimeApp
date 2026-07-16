import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const ANILIST_URL = 'https://graphql.anilist.co'

// ダンダダン anilist_id: 171018
const animeAnilistId = 171018

const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: `
        query ($id: Int) {
            Media(id: $id) {
                title { native }
                characters(sort: ROLE, perPage: 20) {
                    edges {
                        role
                        node { id name { native full } favourites }
                    }
                }
            }
        }`,
        variables: { id: animeAnilistId }
    }),
})
const data = await res.json()
const edges = data.data?.Media?.characters?.edges ?? []

console.log(`=== AniListが返すキャラID (anime: ${animeAnilistId}) ===`)
for (const edge of edges) {
    console.log(`  AnilistID:${String(edge.node.id).padStart(7)}  role:${edge.role.padEnd(12)}  fav:${String(edge.node.favourites).padStart(6)}  ${edge.node.name.native ?? edge.node.name.full}`)
}

// DBのキャラと比較
console.log(`\n=== DBのキャラ (ダンダダン) ===`)
const { data: animes } = await supabase.from('animes').select('anime_id').eq('anilist_id', animeAnilistId).single()
if (animes) {
    const { data: chars } = await supabase.from('characters').select('name, anilist_id, role').eq('anime_id', (animes as any).anime_id)
    for (const c of chars ?? []) {
        const matched = edges.find((e: any) => e.node.id === c.anilist_id)
        console.log(`  DBanilist:${String(c.anilist_id ?? '-').padStart(7)}  role:${String(c.role ?? 'null').padEnd(12)}  ${c.name}  ${matched ? '✅ 一致' : '❌ 不一致'}`)
    }
}
