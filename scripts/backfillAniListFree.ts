/**
 * backfillAniListFree.ts
 * AniList(無料GraphQL)から blood_type / birthday / gender を再取得し SQL を生成する。
 * 有料APIは一切使わない。DBへは直接書き込まず SQL ファイルを出力（手動適用）。
 *
 * 使い方:
 *   npx tsx scripts/backfillAniListFree.ts 10          # テスト: 10 anilist_id だけ処理
 *   npx tsx scripts/backfillAniListFree.ts 99999       # 本番: 対象全件
 *
 * 対象: blood_type も birthday も空 で anilist_id を持つキャラ（人気順）。
 */
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)
const ANILIST_URL = 'https://graphql.anilist.co'
const LIMIT = parseInt(process.argv[2] ?? '10')
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const VALID_BLOOD = new Set(['A', 'B', 'O', 'AB'])
const sqlEsc = (s: string) => s.replace(/'/g, "''")

type Target = { anilist_id: number; name: string }

const QUERY = `query($id:Int){Character(id:$id){bloodType gender dateOfBirth{month day}}}`

async function fetchAniList(id: number) {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { id } }),
  })
  if (res.status === 429) {
    const retry = parseInt(res.headers.get('Retry-After') ?? '60')
    console.log(`  rate limited, wait ${retry}s`)
    await sleep((retry + 1) * 1000)
    return fetchAniList(id)
  }
  const json = await res.json()
  return json.data?.Character ?? null
}

async function main() {
  // blood_type も birthday も無い、anilist_id 付きキャラを人気順で収集（anilist_id重複排除）
  const seen = new Set<number>()
  const targets: Target[] = []
  let from = 0
  while (targets.length < LIMIT) {
    const { data, error } = await supabase
      .from('characters')
      .select('anilist_id, name, favourites')
      .is('blood_type', null)
      .is('birthday', null)
      .not('anilist_id', 'is', null)
      .order('favourites', { ascending: false, nullsFirst: false })
      .range(from, from + 499)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const r of data) {
      if (!seen.has(r.anilist_id)) {
        seen.add(r.anilist_id)
        targets.push({ anilist_id: r.anilist_id, name: r.name })
        if (targets.length >= LIMIT) break
      }
    }
    if (data.length < 500) break
    from += 500
  }

  console.log(`対象 anilist_id: ${targets.length} 件（テスト=${LIMIT}）\n`)

  const updates: string[] = []
  let hit = 0
  for (const t of targets) {
    const ch = await fetchAniList(t.anilist_id)
    await sleep(750) // AniList: ~90req/min 以内
    if (!ch) {
      console.log(`- ${t.name} (id ${t.anilist_id}): 取得失敗`)
      continue
    }
    // 既存値は COALESCE で絶対に上書きしない（空の列だけ埋める）
    const sets: string[] = []
    const blood = ch.bloodType && VALID_BLOOD.has(String(ch.bloodType).toUpperCase())
      ? String(ch.bloodType).toUpperCase() : null
    if (blood) sets.push(`blood_type = COALESCE(blood_type, '${blood}')`)
    const dob = ch.dateOfBirth
    const birthday = dob && dob.month && dob.day ? `${dob.month}月${dob.day}日` : null
    if (birthday) sets.push(`birthday = COALESCE(birthday, '${sqlEsc(birthday)}')`)
    const gender = ch.gender === 'Male' ? '男性' : ch.gender === 'Female' ? '女性' : null
    if (gender) sets.push(`gender = COALESCE(gender, '${gender}')`)

    const parts = [blood && `血液型=${blood}`, birthday && `誕生日=${birthday}`, gender && `性別=${gender}`].filter(Boolean)
    console.log(`${parts.length ? '●' : '-'} ${t.name} (id ${t.anilist_id}): ${parts.join(' / ') || '新規データなし'}`)

    if (sets.length) {
      hit++
      // 同一 anilist_id の全行（作品違いの同一キャラ）をまとめて更新
      updates.push(`UPDATE characters SET ${sets.join(', ')} WHERE anilist_id = ${t.anilist_id};`)
    }
  }

  const outPath = `scripts/sql/patches/16_backfill_anilist_free${LIMIT <= 50 ? '_TEST' : ''}.sql`
  const header = `-- AniList無料バックフィル(blood_type/birthday/gender) 生成:${new Date().toISOString()}\n` +
    `-- 対象:${targets.length} 新規データあり:${hit}\n\n`
  fs.writeFileSync(outPath, header + updates.join('\n') + '\n')
  console.log(`\n新規データ: ${hit}/${targets.length} 件`)
  console.log(`SQL出力: ${outPath}（${updates.length} 文）`)
}

main().catch((e) => { console.error(e); process.exit(1) })
