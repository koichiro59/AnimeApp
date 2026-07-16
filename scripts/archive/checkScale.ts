import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const { count: animeCount } = await supabase.from('animes').select('*', { count: 'exact', head: true })
const { count: charCount } = await supabase.from('characters').select('*', { count: 'exact', head: true })
const { count: withDesc } = await supabase.from('characters').select('*', { count: 'exact', head: true }).not('description', 'is', null)
const { count: withTags } = await supabase.from('characters').select('*', { count: 'exact', head: true }).not('tags', 'is', null).neq('tags', '{}')

// キャラ数が多いアニメ上位10件
const { data: animes } = await supabase.from('animes').select('anime_id, title')
const charPerAnime: { title: string, count: number }[] = []
for (const a of animes ?? []) {
    const { count } = await supabase.from('characters').select('*', { count: 'exact', head: true }).eq('anime_id', a.anime_id)
    charPerAnime.push({ title: a.title, count: count ?? 0 })
}
charPerAnime.sort((a, b) => b.count - a.count)

console.log(`アニメ数: ${animeCount}`)
console.log(`キャラ総数: ${charCount}`)
console.log(`説明文あり: ${withDesc}`)
console.log(`タグあり: ${withTags}`)
console.log(`\nキャラ数 上位10アニメ:`)
charPerAnime.slice(0, 10).forEach(a => console.log(`  ${a.count}人  ${a.title}`))
console.log(`\nキャラ数 下位10アニメ:`)
charPerAnime.slice(-10).forEach(a => console.log(`  ${a.count}人  ${a.title}`))
