/**
 * SQLファイルをUTF-8（BOMなし）のまま分割するスクリプト
 *
 * 使い方:
 *   npx tsx scripts/splitSQL.ts <sqlファイルパス> [分割数]
 *
 * 例:
 *   npx tsx scripts/splitSQL.ts scripts/sql/data/output_2021.sql 4
 *
 * 動作:
 *   - "-- キャラクター" より前をPart1（メタデータ）として出力
 *   - キャラクター行を残りの (分割数-1) 等分に分割
 *   - 出力: output_2021_part1.sql, output_2021_part2.sql, ...
 */

import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
if (args.length < 1) {
    console.error('使い方: npx tsx scripts/splitSQL.ts <sqlファイルパス> [分割数]')
    process.exit(1)
}

const inputPath = args[0]
const numParts = parseInt(args[1] ?? '4', 10)

if (!fs.existsSync(inputPath)) {
    console.error(`ファイルが見つかりません: ${inputPath}`)
    process.exit(1)
}

if (numParts < 2 || numParts > 20) {
    console.error('分割数は2〜20の範囲で指定してください')
    process.exit(1)
}

// BOMなしUTF-8で読み込む（BOMが混入していても除去）
const rawBuf = fs.readFileSync(inputPath)
const hasBomInput = rawBuf[0] === 0xEF && rawBuf[1] === 0xBB && rawBuf[2] === 0xBF
const content = hasBomInput ? rawBuf.slice(3).toString('utf8') : rawBuf.toString('utf8')
if (hasBomInput) console.warn('⚠️  入力ファイルのBOMを検出・除去しました')

const lines = content.split('\n')

// "-- キャラクター" の最後の出現行を境界にする
// （テスト実行分と本番実行分で複数セクションがある場合、最後のものを使う）
const charSectionIndex = lines.reduce((last, l, i) => l.trim() === '-- キャラクター' ? i : last, -1)

let metaLines: string[]
let charLines: string[]

if (charSectionIndex === -1) {
    console.log('ℹ️  キャラクターセクションが見つからないため均等分割します')
    metaLines = []
    charLines = lines
} else {
    metaLines = lines.slice(0, charSectionIndex)
    charLines = lines.slice(charSectionIndex)
    console.log(`📋 メタデータ: ${metaLines.length}行`)
    console.log(`👥 キャラクター: ${charLines.length}行`)
}

const dir = path.dirname(inputPath)
const base = path.basename(inputPath, '.sql')
const outputFiles: string[] = []

// BOMなしUTF-8で書き込むヘルパー
function writeUtf8(filePath: string, text: string) {
    fs.writeFileSync(filePath, Buffer.from(text, 'utf8'))
}

function verifyNoBom(filePath: string): boolean {
    const buf = fs.readFileSync(filePath)
    return !(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF)
}

if (metaLines.length > 0) {
    // Part1 = メタデータ
    const part1Path = path.join(dir, `${base}_part1.sql`)
    writeUtf8(part1Path, metaLines.join('\n'))
    outputFiles.push(part1Path)

    // 残りをキャラクター (numParts-1) 等分
    const charParts = numParts - 1
    const chunkSize = Math.ceil(charLines.length / charParts)
    for (let i = 0; i < charParts; i++) {
        const chunk = charLines.slice(i * chunkSize, Math.min((i + 1) * chunkSize, charLines.length))
        const partPath = path.join(dir, `${base}_part${i + 2}.sql`)
        writeUtf8(partPath, chunk.join('\n'))
        outputFiles.push(partPath)
    }
} else {
    // メタデータなし: 均等分割
    const chunkSize = Math.ceil(charLines.length / numParts)
    for (let i = 0; i < numParts; i++) {
        const chunk = charLines.slice(i * chunkSize, Math.min((i + 1) * chunkSize, charLines.length))
        const partPath = path.join(dir, `${base}_part${i + 1}.sql`)
        writeUtf8(partPath, chunk.join('\n'))
        outputFiles.push(partPath)
    }
}

// 結果表示
console.log('\n=== 出力結果 ===')
for (const [i, f] of outputFiles.entries()) {
    const lineCount = fs.readFileSync(f, 'utf8').split('\n').length
    const bomOk = verifyNoBom(f)
    console.log(`  Part${i + 1}: ${path.basename(f)} (${lineCount}行) ${bomOk ? '✅ BOMなし' : '❌ BOM付き'}`)
}
console.log('\n🎉 完了!')
