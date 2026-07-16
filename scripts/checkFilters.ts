import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const { data: animes } = await supabase.from('animes').select('broadcast_season').eq('is_hidden', false)
const seasons = [...new Set((animes ?? []).map((a: any) => a.broadcast_season).filter(Boolean))].sort().reverse()
console.log('シーズン一覧:', seasons)

const { data: genres } = await supabase.from('genres').select('name').order('name')
console.log('ジャンル一覧:', (genres ?? []).map((g: any) => g.name))
