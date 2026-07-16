import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

const res = await fetch(
  url + '/rest/v1/characters?select=character_id,description&description=not.is.null&limit=5',
  { headers: { apikey: key, Authorization: 'Bearer ' + key } }
)
console.log('Status:', res.status)
const data = await res.json()
if (Array.isArray(data)) {
  for (const c of data) {
    const isJP = /[぀-鿿]/.test(c.description || '')
    console.log(c.character_id, isJP ? '[JP]' : '[EN]', (c.description || '').slice(0, 80))
  }
} else {
  console.log(JSON.stringify(data))
}
