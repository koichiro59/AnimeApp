/**
 * add_image_urls.sql を Supabase SQL Editor で実行できるサイズに分割するスクリプト
 *
 * 使い方: npx tsx scripts/splitSQL.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const INPUT = 'scripts/sql/add_image_urls.sql'
const OUTPUT_DIR = 'scripts/sql/split'
const CHUNK_SIZE = 1000 // 1ファイルあたりの UPDATE 件数

const content = fs.readFileSync(INPUT, 'utf-8')
const lines = content.split('\n')

const alterLines: string[] = []
const animeLines: string[] = []
const charLines: string[] = []

let section: 'alter' | 'anime' | 'char' = 'alter'

for (const line of lines) {
  if (line.startsWith('-- キャラクター')) {
    section = 'char'
    continue
  }
  if (line.startsWith('-- アニメ')) {
    section = 'anime'
    continue
  }
  if (line.trim() === '' || line.startsWith('--')) continue

  if (section === 'alter') alterLines.push(line)
  else if (section === 'anime') animeLines.push(line)
  else charLines.push(line)
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// ファイル番号管理
let fileIndex = 1

function writeChunk(label: string, sqlLines: string[], header: string) {
  for (let i = 0; i < sqlLines.length; i += CHUNK_SIZE) {
    const chunk = sqlLines.slice(i, i + CHUNK_SIZE)
    const from = i + 1
    const to = Math.min(i + CHUNK_SIZE, sqlLines.length)
    const filename = path.join(OUTPUT_DIR, `part${String(fileIndex).padStart(2, '0')}_${label}_${from}-${to}.sql`)
    fs.writeFileSync(filename, `-- ${header} (${from}〜${to}件目)\n` + chunk.join('\n') + '\n', 'utf-8')
    console.log(`✅ ${path.basename(filename)} (${chunk.length}件)`)
    fileIndex++
  }
}

// Part 01: ALTER TABLE + アニメ UPDATE
const part01 = [
  '-- Step 1: animes テーブルに image_url カラムを追加',
  ...alterLines,
  '',
  `-- Step 2: アニメ画像URL 更新 (${animeLines.length}件)`,
  ...animeLines,
].join('\n') + '\n'

const part01Path = path.join(OUTPUT_DIR, 'part01_alter_and_animes.sql')
fs.writeFileSync(part01Path, part01, 'utf-8')
console.log(`✅ part01_alter_and_animes.sql (ALTER 1件 + アニメ ${animeLines.length}件)`)
fileIndex++

// Part 02〜: キャラクター UPDATE を CHUNK_SIZE ずつ分割
writeChunk('characters', charLines, 'キャラクター画像URL 更新')

console.log(`\n📁 出力先: ${OUTPUT_DIR}/`)
console.log(`📋 合計ファイル数: ${fileIndex - 1} ファイル`)
console.log('\n実行順序:')
for (let i = 1; i < fileIndex; i++) {
  const files = fs.readdirSync(OUTPUT_DIR).sort()
  if (files[i - 1]) console.log(`  ${i}. ${files[i - 1]}`)
}
