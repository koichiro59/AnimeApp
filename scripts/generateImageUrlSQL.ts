/**
 * AniList API から画像URLを取得し、Supabase更新用SQLを生成するスクリプト
 *
 * 使い方:
 *   npx tsx scripts/generateImageUrlSQL.ts --dry-run  → 対象件数・API疎通確認のみ
 *   npx tsx scripts/generateImageUrlSQL.ts            → scripts/sql/add_image_urls.sql を生成
 */
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'
const OUTPUT_PATH = 'scripts/sql/add_image_urls.sql'
const BATCH_SIZE = 50
const SLEEP_MS = 1500  // AniList は 90req/min が上限
const RETRY_WAIT_MS = 65000 // 429 時に待機する時間（1分強）
const MAX_RETRIES = 3

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const isDryRun = process.argv.includes('--dry-run')
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ---- AniList API ----

async function anilistRequest(body: object): Promise<any> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 429) {
      console.log(`\n   ⏳ レート制限(429)。${RETRY_WAIT_MS / 1000}秒待機後にリトライ (${attempt}/${MAX_RETRIES})...`)
      await sleep(RETRY_WAIT_MS)
      continue
    }
    if (!res.ok) throw new Error(`AniList HTTP ${res.status}: ${await res.text()}`)
    const json = await res.json()
    if (json.errors) throw new Error(`AniList error: ${JSON.stringify(json.errors)}`)
    return json
  }
  throw new Error(`AniList: ${MAX_RETRIES}回リトライしても失敗しました`)
}

async function fetchAnimeImages(ids: number[]): Promise<Record<number, string>> {
  const json = await anilistRequest({
    query: `
      query ($ids: [Int]) {
        Page(perPage: 50) {
          media(id_in: $ids, type: ANIME) {
            id
            coverImage { extraLarge large }
          }
        }
      }
    `,
    variables: { ids },
  })
  const result: Record<number, string> = {}
  for (const m of json.data?.Page?.media ?? []) {
    const url = m.coverImage?.extraLarge ?? m.coverImage?.large
    if (url) result[m.id] = url
  }
  return result
}

async function fetchCharacterImages(ids: number[]): Promise<Record<number, string>> {
  const json = await anilistRequest({
    query: `
      query ($ids: [Int]) {
        Page(perPage: 50) {
          characters(id_in: $ids) {
            id
            image { large }
          }
        }
      }
    `,
    variables: { ids },
  })
  const result: Record<number, string> = {}
  for (const c of json.data?.Page?.characters ?? []) {
    if (c.image?.large) result[c.id] = c.image.large
  }
  return result
}

// ---- Supabase からデータ取得 ----

async function fetchAllAnimes(): Promise<{ anime_id: string; anilist_id: number }[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('anime_id, anilist_id')
    .not('anilist_id', 'is', null)
  if (error) throw new Error(`animes取得失敗: ${error.message}`)
  return data as { anime_id: string; anilist_id: number }[]
}

async function fetchCharactersWithoutImage(): Promise<{ character_id: string; anilist_id: number }[]> {
  const results: { character_id: string; anilist_id: number }[] = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('characters')
      .select('character_id, anilist_id')
      .not('anilist_id', 'is', null)
      .is('image_url', null)
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`characters取得失敗: ${error.message}`)
    results.push(...(data as { character_id: string; anilist_id: number }[]))
    if (data.length < PAGE) break
    from += PAGE
  }
  return results
}

// ---- SQL 生成ヘルパー ----

function escape(s: string): string {
  return s.replace(/'/g, "''")
}

// ---- Main ----

async function main() {
  console.log(`\n🔍 モード: ${isDryRun ? 'ドライラン（確認のみ）' : 'SQL生成'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 1. Supabase からデータ取得
  console.log('📡 Supabase からデータ取得中...')
  const [animes, characters] = await Promise.all([
    fetchAllAnimes(),
    fetchCharactersWithoutImage(),
  ])

  console.log(`\n📊 対象件数:`)
  console.log(`   アニメ  : ${animes.length} 件（anilist_id あり、全件更新対象）`)
  console.log(`   キャラ  : ${characters.length} 件（image_url が null のもの）`)

  const estimatedBatches = Math.ceil(animes.length / BATCH_SIZE) + Math.ceil(characters.length / BATCH_SIZE)
  const estimatedSec = Math.ceil(estimatedBatches * SLEEP_MS / 1000)
  console.log(`\n⏱️  推定実行時間: 約 ${estimatedSec} 秒（AniList API レート制限を考慮）`)

  // 2. API 疎通テスト（アニメ1件 + キャラ1件）
  console.log('\n🔌 AniList API 疎通テスト中...')
  const sampleAnime = animes.find(a => a.anilist_id)
  const sampleChar = characters.find(c => c.anilist_id)

  if (sampleAnime) {
    const testAnime = await fetchAnimeImages([sampleAnime.anilist_id])
    const url = testAnime[sampleAnime.anilist_id]
    if (url) {
      console.log(`   ✅ アニメ画像取得OK: anime_id=${sampleAnime.anime_id} → ${url.slice(0, 60)}...`)
    } else {
      console.warn(`   ⚠️  アニメ ${sampleAnime.anime_id} の画像URLが空`)
    }
  }

  if (sampleChar) {
    await sleep(500)
    const testChar = await fetchCharacterImages([sampleChar.anilist_id])
    const url = testChar[sampleChar.anilist_id]
    if (url) {
      console.log(`   ✅ キャラ画像取得OK: character_id=${sampleChar.character_id} → ${url.slice(0, 60)}...`)
    } else {
      console.warn(`   ⚠️  キャラ ${sampleChar.character_id} の画像URLが空`)
    }
  }

  if (isDryRun) {
    console.log('\n✅ ドライラン完了。問題なければ --dry-run を外して実行してください。')
    console.log('   npx tsx scripts/generateImageUrlSQL.ts\n')
    return
  }

  // 3. アニメ画像を一括取得してSQL生成
  console.log('\n🎬 アニメ画像URL 取得開始...')
  const animeSqlLines: string[] = []
  let animeHit = 0, animeMiss = 0

  for (let i = 0; i < animes.length; i += BATCH_SIZE) {
    const batch = animes.slice(i, i + BATCH_SIZE)
    const ids = batch.map(a => a.anilist_id)
    process.stdout.write(`   ${i + 1}〜${Math.min(i + BATCH_SIZE, animes.length)} 件目... `)

    const imageMap = await fetchAnimeImages(ids)
    for (const anime of batch) {
      const url = imageMap[anime.anilist_id]
      if (url) {
        animeSqlLines.push(`UPDATE animes SET image_url = '${escape(url)}' WHERE anime_id = '${anime.anime_id}';`)
        animeHit++
      } else {
        animeMiss++
      }
    }
    console.log(`✅ (ヒット: ${animeHit}, 未取得: ${animeMiss})`)
    if (i + BATCH_SIZE < animes.length) await sleep(SLEEP_MS)
  }

  // 4. キャラ画像を一括取得してSQL生成
  console.log('\n⏳ セクション間の待機中 (3秒)...')
  await sleep(3000)
  console.log('\n👤 キャラクター画像URL 取得開始...')
  const charSqlLines: string[] = []
  let charHit = 0, charMiss = 0

  for (let i = 0; i < characters.length; i += BATCH_SIZE) {
    const batch = characters.slice(i, i + BATCH_SIZE)
    const ids = batch.map(c => c.anilist_id)
    process.stdout.write(`   ${i + 1}〜${Math.min(i + BATCH_SIZE, characters.length)} 件目... `)

    const imageMap = await fetchCharacterImages(ids)
    for (const char of batch) {
      const url = imageMap[char.anilist_id]
      if (url) {
        charSqlLines.push(`UPDATE characters SET image_url = '${escape(url)}' WHERE character_id = '${char.character_id}';`)
        charHit++
      } else {
        charMiss++
      }
    }
    console.log(`✅ (ヒット: ${charHit}, 未取得: ${charMiss})`)
    if (i + BATCH_SIZE < characters.length) await sleep(SLEEP_MS)
  }

  // 5. SQLファイル書き出し
  const sql = [
    '-- animes テーブルに image_url カラムを追加（既存の場合はスキップ）',
    'ALTER TABLE animes ADD COLUMN IF NOT EXISTS image_url TEXT;',
    '',
    `-- アニメ画像URL 更新 (${animeSqlLines.length}件)`,
    ...animeSqlLines,
    '',
    `-- キャラクター画像URL 更新 (${charSqlLines.length}件)`,
    ...charSqlLines,
    '',
  ].join('\n')

  fs.writeFileSync(OUTPUT_PATH, sql, 'utf-8')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ SQL生成完了: ${OUTPUT_PATH}`)
  console.log(`   ALTER TABLE  : 1件`)
  console.log(`   アニメ UPDATE: ${animeSqlLines.length}件 / ${animes.length}件中`)
  console.log(`   キャラ UPDATE: ${charSqlLines.length}件 / ${characters.length}件中`)
  if (animeMiss + charMiss > 0) {
    console.log(`\n⚠️  画像URLが取得できなかった件数: アニメ ${animeMiss}件、キャラ ${charMiss}件`)
    console.log('   （AniList 上で削除済み・非公開の可能性があります）')
  }
  console.log('\n次のステップ: Supabase の SQL Editor で add_image_urls.sql を実行してください。')
}

main().catch(e => {
  console.error('❌ エラー:', e.message)
  process.exit(1)
})
