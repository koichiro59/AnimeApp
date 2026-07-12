import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const { data } = await supabase
    .from('animes')
    .select('title, popularity, broadcast_season')
    .not('popularity', 'is', null)
    .order('popularity', { ascending: false })
    .limit(20)

console.log('=== 人気スコア上位20件 ===')
data!.forEach((a: any) => console.log(`${String(a.popularity).padStart(7)}  ${a.broadcast_season ?? '不明'}  ${a.title}`))
