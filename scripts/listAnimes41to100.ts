import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const { data, error } = await supabase
  .from('animes')
  .select('anime_id, title, broadcast_season, popularity')
  .eq('is_hidden', false)
  .order('popularity', { ascending: false, nullsFirst: false })
  .range(40, 99)

if (error) { console.error(error); process.exit(1) }
console.log(JSON.stringify(data, null, 2))
