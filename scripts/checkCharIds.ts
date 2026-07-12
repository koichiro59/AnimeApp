import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)
const { data: anime } = await supabase.from('animes').select('anime_id').eq('anilist_id', 171018).single()
const { data: chars } = await supabase.from('characters').select('character_id, anilist_id, name').eq('anime_id', (anime as any).anime_id).limit(5)
chars?.forEach((c: any) => console.log(c.character_id, c.anilist_id, c.name))
