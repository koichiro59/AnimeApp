import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

const targets = ['ダンダダン', '俺だけレベルアップな件']

for (const title of targets) {
    const { data: animes } = await supabase
        .from('animes')
        .select('anime_id, title, popularity, anilist_id')
        .ilike('title', `%${title}%`)
        .limit(3)

    for (const anime of animes ?? []) {
        console.log(`\n【${anime.title}】 popularity:${anime.popularity}  anilist_id:${anime.anilist_id}`)

        const { data: chars } = await supabase
            .from('characters')
            .select('name, anilist_id, favourites, anime_rank, role')
            .eq('anime_id', anime.anime_id)
            .order('anime_rank', { ascending: true, nullsFirst: false })
            .limit(10)

        chars?.forEach(c =>
            console.log(`  rank:${String(c.anime_rank ?? '-').padStart(3)}  role:${String(c.role ?? 'null').padEnd(12)}  fav:${String(c.favourites ?? 'null').padStart(6)}  ${c.name}`)
        )
    }
}
