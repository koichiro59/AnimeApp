import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

const isJapanese = (t: string) => /[ぁ-んァ-ン一-龯]/.test(t)

// 文豪ストレイドッグスを検索
const res = await fetch(
    `${SUPABASE_URL}/rest/v1/animes?select=anime_id,title,broadcast_season&title=like.*文豪*&limit=20`,
    { headers }
)
const animes: { anime_id: string; title: string; broadcast_season: string }[] = await res.json()
console.log('該当アニメ:')
for (const a of animes) console.log(`  ${a.anime_id} | ${a.title} | ${a.broadcast_season}`)

console.log()
for (const anime of animes) {
    const r = await fetch(
        `${SUPABASE_URL}/rest/v1/characters?select=character_id,name,description&anime_id=eq.${anime.anime_id}&description=not.is.null&limit=500`,
        { headers }
    )
    const chars: { character_id: string; name: string; description: string }[] = await r.json()
    const eng = chars.filter(c => c.description && !isJapanese(c.description))
    console.log(`【${anime.title}】英語残り: ${eng.length}件 / 全${chars.length}件`)
    for (const c of eng) {
        console.log(`  ${c.character_id} | ${c.name}`)
        console.log(`  ${c.description.slice(0, 80)}...`)
    }
}
