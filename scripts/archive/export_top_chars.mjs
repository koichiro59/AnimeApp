import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const supabase = createClient(
  'https://vnfcgzmvzowqowqtfuav.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZmNnem12em93cW93cXRmdWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTMwNTAsImV4cCI6MjA5NjM4OTA1MH0.vkR3TCu6zG1kU8A2HcJFwlCi5fMXJuhFVlZn2lcwZCk'
)

const roleRank = (role) => {
  if (role === 'SUPPORTING') return 2
  if (role === 'BACKGROUND') return 3
  return 1
}

const sortCharacters = (chars) =>
  [...chars].sort((a, b) => {
    const rd = roleRank(a.role) - roleRank(b.role)
    if (rd !== 0) return rd
    const fd = (b.favourites ?? 0) - (a.favourites ?? 0)
    if (fd !== 0) return fd
    return a.character_id.localeCompare(b.character_id)
  })

// アニメ40件取得（人気順、is_hidden=false）
const { data: animes, error: animeErr } = await supabase
  .from('animes')
  .select('anime_id, title')
  .eq('is_hidden', false)
  .order('popularity', { ascending: false, nullsFirst: false })
  .range(0, 39)

if (animeErr) { console.error(animeErr); process.exit(1) }

const lines = [`# アニメ上位40件 × 先頭キャラ10人\n\n生成日: ${new Date().toLocaleDateString('ja-JP')}\n`]

for (let i = 0; i < animes.length; i++) {
  const anime = animes[i]
  lines.push(`## ${i + 1}. ${anime.title}`)

  const { data: chars, error: charErr } = await supabase
    .from('characters')
    .select('character_id, name, role, favourites')
    .eq('anime_id', anime.anime_id)

  if (charErr) {
    lines.push('（キャラ取得エラー）\n')
    continue
  }

  const sorted = sortCharacters(chars).slice(0, 10)
  if (sorted.length === 0) {
    lines.push('（キャラなし）\n')
    continue
  }

  sorted.forEach((c, idx) => {
    const role = c.role ?? 'MAIN'
    const fav = c.favourites != null ? `fav:${c.favourites}` : ''
    lines.push(`${idx + 1}. ${c.name}（${role}${fav ? ' / ' + fav : ''}）`)
  })
  lines.push('')
}

const md = lines.join('\n')
writeFileSync('docs/top_chars_memo.md', md, 'utf-8')
console.log('書き出し完了: docs/top_chars_memo.md')
