import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const BASE_URL = 'https://aniref.net'
const today = new Date().toISOString().split('T')[0]

function buildUrl(loc: string, priority: string, changefreq: string = 'weekly'): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function generate() {
  console.log('📡 Supabaseからデータ取得中...')

  const { data: animes, error: animeError } = await supabase
    .from('animes')
    .select('anime_id')
    .order('anime_id')

  if (animeError) {
    console.error('❌ アニメ取得エラー:', animeError.message)
    process.exit(1)
  }

  const characters: { character_id: string }[] = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error: charError } = await supabase
      .from('characters')
      .select('character_id')
      .order('character_id')
      .range(from, from + PAGE - 1)
    if (charError) {
      console.error('❌ キャラクター取得エラー:', charError.message)
      process.exit(1)
    }
    characters.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }

  console.log(`✅ アニメ: ${animes.length}件, キャラクター: ${characters.length}件`)

  const urls: string[] = [
    buildUrl(`${BASE_URL}/`, '1.0', 'weekly'),
    buildUrl(`${BASE_URL}/animes`, '0.9', 'weekly'),
    buildUrl(`${BASE_URL}/characters`, '0.8', 'weekly'),
    ...animes.map((a) => buildUrl(`${BASE_URL}/anime/${a.anime_id}`, '0.8', 'monthly')),
    ...characters.map((c) => buildUrl(`${BASE_URL}/character/${c.character_id}`, '0.7', 'monthly')),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  fs.writeFileSync('public/sitemap.xml', xml, 'utf-8')

  const total = 3 + animes.length + characters.length
  console.log(`✅ sitemap.xml を生成しました（合計 ${total} ページ）`)
  console.log(`   - 静的ページ: 3`)
  console.log(`   - アニメページ: ${animes.length}`)
  console.log(`   - キャラクターページ: ${characters.length}`)
}

generate()
