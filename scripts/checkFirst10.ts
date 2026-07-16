import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const { data: animes } = await supabase.from('animes').select('anime_id,title,anilist_id').eq('is_hidden', false).order('popularity', { ascending: false, nullsFirst: false }).range(0, 0)
const anime = animes![0]
const { data: chars } = await supabase.from('characters').select('character_id,name,gender,age,height,role,favourites,description,tags,voice_actor,blood_type,birthday,anilist_id').eq('anime_id', anime.anime_id)
const sorted = chars!.sort((a: any, b: any) => {
    const roleRank = (r: string | null) => r === 'SUPPORTING' ? 2 : r === 'BACKGROUND' ? 3 : 1
    const rd = roleRank(a.role) - roleRank(b.role)
    if (rd !== 0) return rd
    return (b.favourites ?? 0) - (a.favourites ?? 0)
}).slice(0, 10)

console.log(`\n📺 ${anime.title}\n`)
for (const c of sorted) {
    console.log(`──── ${c.name} (${c.role}) ────`)
    console.log(`  性別:${c.gender ?? '-'} 年齢:${c.age ?? '-'} 身長:${c.height ?? '-'} 血液型:${c.blood_type ?? '-'}`)
    console.log(`  声優: ${c.voice_actor ?? '-'}`)
    console.log(`  タグ: ${c.tags?.join(' / ') ?? 'なし'}`)
    console.log(`  説明: ${c.description ? c.description.slice(0, 120) + '...' : 'なし'}`)
    console.log()
}
