/**
 * generateTranslationSQL.ts
 *
 * 英語説明文のキャラクターを DeepL で翻訳し、SQL UPDATE 文を生成する。
 * Supabase には直接書き込まず、SQL ファイルを出力して手動適用する方式。
 *
 * 実行: npx tsx scripts/generateTranslationSQL.ts
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const DEEPL_API_KEY = process.env.DEEPL_API_KEY!
const OUTPUT_PATH = path.join('scripts', 'sql', 'patches', '92_translate_descriptions.sql')

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const isJapanese = (text: string): boolean =>
    /[ぁ-んァ-ン一-龯]/.test(text)

const escape = (s: string): string =>
    s.replace(/'/g, "''")

const checkDeeplUsage = async (): Promise<{ used: number; limit: number }> => {
    const res = await fetch('https://api-free.deepl.com/v2/usage', {
        headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}` },
    })
    const data = await res.json()
    return { used: data.character_count, limit: data.character_limit }
}

const fetchAllEnglish = async (): Promise<{ character_id: string; description: string }[]> => {
    const result: { character_id: string; description: string }[] = []
    let offset = 0
    const PAGE = 1000

    while (true) {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/characters?select=character_id,description&description=not.is.null&limit=${PAGE}&offset=${offset}`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        )
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) break
        for (const c of data) {
            if (c.description && !isJapanese(c.description)) {
                result.push(c)
            }
        }
        if (data.length < PAGE) break
        offset += PAGE
        await sleep(300)
    }
    return result
}

const translateWithDeepl = async (text: string): Promise<string | null> => {
    try {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: [text], target_lang: 'JA', source_lang: 'EN' }),
        })
        const data = await res.json()
        return data.translations?.[0]?.text ?? null
    } catch {
        return null
    }
}

const main = async () => {
    // DeepL 使用量確認
    const { used, limit } = await checkDeeplUsage()
    const remaining = limit - used
    console.log(`📊 DeepL 使用量: ${used.toLocaleString()} / ${limit.toLocaleString()} 文字 (${Math.round(used / limit * 100)}%)`)
    console.log(`   残り: ${remaining.toLocaleString()} 文字\n`)

    // 英語説明文を全件収集
    console.log('📥 英語説明文のキャラを収集中...')
    const targets = await fetchAllEnglish()
    const totalChars = targets.reduce((sum, c) => sum + c.description.length, 0)
    console.log(`   対象: ${targets.length}件 / 合計 ${totalChars.toLocaleString()} 文字`)

    if (remaining < totalChars) {
        const estimatedCount = Math.floor(remaining / (totalChars / targets.length))
        console.log(`   ⚠️  残量不足のため途中停止予定（約 ${estimatedCount} 件翻訳予定）\n`)
    }

    // 翻訳・SQL生成
    const lines: string[] = [
        '-- 翻訳済み説明文 UPDATE',
        `-- 生成日時: ${new Date().toISOString()}`,
        '',
    ]
    let translated = 0
    let failed = 0
    let skipped = 0
    let consumedChars = 0

    console.log('🌐 翻訳開始...\n')

    for (let i = 0; i < targets.length; i++) {
        const { character_id, description } = targets[i]

        if (consumedChars + description.length > remaining) {
            skipped = targets.length - i
            console.log(`\n⚠️  残量上限に達したため停止 (${consumedChars.toLocaleString()} 文字使用)`)
            break
        }

        const pct = Math.round(((i + 1) / targets.length) * 100)
        process.stdout.write(`  [${i + 1}/${targets.length}] (${pct}%) ${character_id} (${description.length}文字) ... `)

        const result = await translateWithDeepl(description)
        if (!result) {
            console.log('⚠️  失敗')
            failed++
        } else {
            lines.push(`UPDATE characters SET description = '${escape(result)}' WHERE character_id = '${character_id}';`)
            consumedChars += description.length
            translated++
            console.log('✅')
        }

        await sleep(350)
    }

    // SQL ファイル書き出し
    if (translated > 0) {
        fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
        fs.writeFileSync(OUTPUT_PATH, lines.join('\n') + '\n', 'utf-8')
        console.log(`\n📄 SQL 出力: ${OUTPUT_PATH} (${translated}件)`)
    }

    const final = await checkDeeplUsage()
    console.log(`\n✅ 完了: ${translated}件 翻訳 / ${failed}件 失敗 / ${skipped}件 スキップ（クォータ不足）`)
    console.log(`   DeepL 消費: ${consumedChars.toLocaleString()} 文字`)
    console.log(`   最終使用量: ${final.used.toLocaleString()} / ${final.limit.toLocaleString()} 文字 (${Math.round(final.used / final.limit * 100)}%)`)
}

main().catch(console.error)
