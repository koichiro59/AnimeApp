import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const { data, error } = await supabase.rpc('get_characters_list', {
    p_offset: 0,
    p_limit: 24,
    p_search: null,
})

if (error) { console.error('エラー:', error); process.exit(1) }

// アニメごとの表示カウントを集計
const animeCount: Record<string, { count: number, name: string }> = {}
for (const c of data as any[]) {
    if (!animeCount[c.anime_id]) animeCount[c.anime_id] = { count: 0, name: '' }
    animeCount[c.anime_id].count++
}

console.log('=== 先頭24件の内訳 ===')
;(data as any[]).forEach((c, i) => {
    console.log(`[${i + 1}] rank:${c.anime_rank ?? '-'} fav:${String(c.favourites ?? 0).padStart(6)}  ${c.name}`)
})
console.log('\n=== アニメ別表示数（24件中）===')
Object.values(animeCount).sort((a, b) => b.count - a.count).forEach(a => {
    console.log(`  ${a.count}人  anime_id:${Object.keys(animeCount).find(k => animeCount[k] === a)}`)
})
