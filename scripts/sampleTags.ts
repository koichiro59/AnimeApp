import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)
const { data } = await supabase
    .from('characters')
    .select('name, tags')
    .not('tags', 'is', null)
    .limit(100)

const withTags = data!.filter((c: any) => c.tags?.length > 0).slice(0, 15)
withTags.forEach((c: any) => console.log(`【${c.name}】${c.tags.join(' / ')}`))
