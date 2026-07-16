import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

let offset = 0
const PAGE = 1000
let totalEN = 0
let totalJP = 0
let samples = []

while (true) {
  const res = await fetch(
    url + '/rest/v1/characters?select=character_id,description&description=not.is.null&limit=' + PAGE + '&offset=' + offset,
    { headers: { apikey: key, Authorization: 'Bearer ' + key } }
  )
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) break

  for (const c of data) {
    const isJP = /[぀-鿿ぁ-んァ-ン]/.test(c.description || '')
    if (isJP) {
      totalJP++
    } else {
      totalEN++
      if (samples.length < 5) samples.push({ id: c.character_id, desc: (c.description || '').slice(0, 100) })
    }
  }
  if (data.length < PAGE) break
  offset += PAGE
}

console.log('日本語:', totalJP, '件')
console.log('英語(残り):', totalEN, '件')
if (samples.length > 0) {
  console.log('\n英語サンプル:')
  for (const s of samples) console.log(' ', s.id, ':', s.desc)
}
