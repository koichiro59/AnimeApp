/**
 * backfillAniListFree.ts
 * AniList(無料GraphQL)から blood_type / birthday / gender を再取得し SQL を生成する。
 * 有料APIは一切使わない。DBへは直接書き込まず SQL ファイルを出力（手動適用）。
 *
 * 使い方:
 *   npx tsx scripts/backfillAniListFree.ts 10          # テスト: 先頭10 anilist_id
 *   npx tsx scripts/backfillAniListFree.ts all         # 本番: 薄ページ優先で全件
 *
 * 対象: blood_type か birthday が空の anilist_id。薄(noindex)キャラを優先的に処理。
 * birthday は hasRichData を満たすため薄ページの index 化レバーになる。
 */
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)
const ANILIST_URL = 'https://graphql.anilist.co'
const arg = process.argv[2] ?? '10'
const ALL = arg === 'all'
const LIMIT = ALL ? Infinity : parseInt(arg)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const VALID_BLOOD = new Set(['A', 'B', 'O', 'AB'])
const sqlEsc = (s: string) => s.replace(/'/g, "''")

type Row = {
  character_id: string
  anilist_id: number | null
  favourites: number | null
  description: string | null
  voice_actor: string | null
  age: number | null
  height: number | null
  birthday: string | null
  blood_type: string | null
  tags: string[] | null
}
const COLS = 'character_id, anilist_id, favourites, description, voice_actor, age, height, birthday, blood_type, tags'
const rich = (c: Row) =>
  !!c.description || !!c.voice_actor || c.age != null || c.height != null || !!c.birthday || (c.tags?.length ?? 0) >= 1

type Target = { anilist_id: number; name: string; thin: boolean; fav: number }

const QUERY = `query($id:Int){Character(id:$id){name{full} bloodType gender dateOfBirth{month day}}}`

async function fetchAniList(id: number): Promise<any> {
  try {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { id } }),
    })
    if (res.status === 429) {
      const retry = parseInt(res.headers.get('Retry-After') ?? '60')
      console.log(`  [429] wait ${retry}s`)
      await sleep((retry + 1) * 1000)
      return fetchAniList(id)
    }
    const json = await res.json()
    return json.data?.Character ?? null
  } catch (e) {
    console.log(`  fetch error id=${id}: ${(e as Error).message}`)
    await sleep(3000)
    return null
  }
}

async function collectTargets(): Promise<Target[]> {
  const rows: Row[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase.from('characters').select(COLS).range(from, from + 999)
    if (error) throw error
    rows.push(...((data ?? []) as Row[]))
    if ((data ?? []).length < 1000) break
    from += 1000
  }
  // anilist_id でグループ化
  const groups = new Map<number, Row[]>()
  for (const r of rows) {
    if (r.anilist_id == null) continue
    const g = groups.get(r.anilist_id)
    if (g) g.push(r)
    else groups.set(r.anilist_id, [r])
  }
  const targets: Target[] = []
  for (const [anilist_id, g] of groups) {
    const missingBirthday = g.every((r) => !r.birthday)
    const missingBlood = g.every((r) => !r.blood_type)
    if (!missingBirthday && !missingBlood) continue // 両方埋まっていれば対象外
    const thin = !g.some(rich) // グループ内に rich 行が無ければ薄(noindex)
    const fav = Math.max(...g.map((r) => r.favourites ?? 0))
    targets.push({ anilist_id, name: g[0].character_id, thin, fav })
  }
  // 薄ページ優先 → 人気降順
  targets.sort((a, b) => Number(b.thin) - Number(a.thin) || b.fav - a.fav)
  return targets
}

async function main() {
  const all = await collectTargets()
  const targets = ALL ? all : all.slice(0, LIMIT)
  const thinCount = targets.filter((t) => t.thin).length

  const outPath = `scripts/sql/patches/16_backfill_anilist_free${ALL ? '' : '_TEST'}.sql`

  // レジューム: 既存SQLに書かれた anilist_id はスキップして追記する
  const done = new Set<number>()
  const exists = fs.existsSync(outPath)
  if (exists) {
    const prev = fs.readFileSync(outPath, 'utf-8')
    for (const m of prev.matchAll(/WHERE anilist_id = (\d+);/g)) done.add(parseInt(m[1]))
  }
  console.log(
    `対象 anilist_id: ${targets.length}（うち薄ページ ${thinCount}）  モード:${ALL ? '本番/全件' : `テスト${LIMIT}`}` +
      `${exists ? ` / レジューム:既存${done.size}件スキップ` : ''}\n`,
  )

  const out = fs.createWriteStream(outPath, { flags: exists ? 'a' : 'w' })
  if (!exists) {
    out.write(`-- AniList無料バックフィル(blood_type/birthday/gender) 生成:${new Date().toISOString()}\n`)
    out.write(`-- 対象:${targets.length} 薄ページ優先\n\n`)
  } else {
    out.write(`-- resume ${new Date().toISOString()}\n`)
  }

  let hit = 0,
    birthdayHit = 0,
    i = 0
  for (const t of targets) {
    i++
    if (done.has(t.anilist_id)) continue // レジューム: 取得済みはスキップ
    const ch = await fetchAniList(t.anilist_id)
    await sleep(750)
    if (!ch) continue
    const sets: string[] = []
    const blood =
      ch.bloodType && VALID_BLOOD.has(String(ch.bloodType).toUpperCase()) ? String(ch.bloodType).toUpperCase() : null
    if (blood) sets.push(`blood_type = COALESCE(blood_type, '${blood}')`)
    const dob = ch.dateOfBirth
    const birthday = dob && dob.month && dob.day ? `${dob.month}月${dob.day}日` : null
    if (birthday) {
      sets.push(`birthday = COALESCE(birthday, '${sqlEsc(birthday)}')`)
      if (t.thin) birthdayHit++
    }
    const gender = ch.gender === 'Male' ? '男性' : ch.gender === 'Female' ? '女性' : null
    if (gender) sets.push(`gender = COALESCE(gender, '${gender}')`)

    if (sets.length) {
      hit++
      out.write(`UPDATE characters SET ${sets.join(', ')} WHERE anilist_id = ${t.anilist_id};\n`)
    }
    if (i % 100 === 0) console.log(`  ${i}/${targets.length} 処理 / 新規${hit} / 薄→誕生日付与${birthdayHit}`)
  }
  out.end()
  console.log(`\n完了: ${hit}/${targets.length} に新規データ / 薄ページへ誕生日付与 ${birthdayHit}`)
  console.log(`SQL出力: ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
