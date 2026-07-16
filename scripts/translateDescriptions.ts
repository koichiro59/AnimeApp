/**
 * translateDescriptions.ts
 *
 * 英語説明文のキャラクターを DeepL で日本語に翻訳して Supabase を直接更新する。
 * DeepL 残量の 90% に達したら自動停止。
 *
 * 実行: npx tsx scripts/translateDescriptions.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const DEEPL_API_KEY = process.env.DEEPL_API_KEY!
const STOP_AT_USAGE_RATE = 0.90  // 残量90%到達で停止

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const isJapanese = (text: string): boolean =>
    /[぀-ゟ゠-ヿ一-龯]/.test(text)

const checkDeeplUsage = async (): Promise<{ used: number; limit: number }> => {
    const res = await fetch('https://api-free.deepl.com/v2/usage', {
        headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}` },
    })
    const data = await res.json()
    return { used: data.character_count, limit: data.character_limit }
}

const fetchPage = async (offset: number, limit: number): Promise<{ character_id: string; description: string }[]> => {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/characters?select=character_id,description&description=not.is.null&limit=${limit}&offset=${offset}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    return res.json()
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

const updateDescription = async (characterId: string, description: string): Promise<void> => {
    await fetch(
        `${SUPABASE_URL}/rest/v1/characters?character_id=eq.${characterId}`,
        {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({ description }),
        }
    )
}

const main = async () => {
    // DeepL 使用量確認
    const { used, limit } = await checkDeeplUsage()
    const remaining = limit - used
    console.log(`📊 DeepL 使用量: ${used.toLocaleString()} / ${limit.toLocaleString()} 文字 (${Math.round(used / limit * 100)}%)`)
    console.log(`   残り: ${remaining.toLocaleString()} 文字`)

    const usableChars = Math.floor(remaining * STOP_AT_USAGE_RATE)
    console.log(`   今回使用上限: ${usableChars.toLocaleString()} 文字 (残量の${Math.round(STOP_AT_USAGE_RATE * 100)}%)\n`)

    // 英語説明文のキャラを全件収集
    console.log('📥 英語説明文のキャラを収集中...')
    const targets: { character_id: string; description: string }[] = []
    let offset = 0
    const PAGE = 1000

    while (true) {
        const batch = await fetchPage(offset, PAGE)
        if (!batch || batch.length === 0) break
        for (const c of batch) {
            if (c.description && !isJapanese(c.description)) {
                targets.push(c)
            }
        }
        if (batch.length < PAGE) break
        offset += PAGE
        await sleep(300)
    }

    const totalChars = targets.reduce((sum, c) => sum + c.description.length, 0)
    console.log(`   対象: ${targets.length}件 / 合計 ${totalChars.toLocaleString()} 文字`)

    if (usableChars < totalChars) {
        console.log(`   ⚠️  残量不足のため途中で停止します（約 ${Math.floor(usableChars / (totalChars / targets.length))} 件翻訳予定）`)
    }

    // 翻訳・更新
    let translated = 0
    let failed = 0
    let consumedChars = 0

    console.log('\n🌐 翻訳開始...\n')

    for (let i = 0; i < targets.length; i++) {
        const { character_id, description } = targets[i]

        if (consumedChars + description.length > usableChars) {
            console.log(`\n⚠️  使用上限に達したため停止 (${consumedChars.toLocaleString()} 文字使用)`)
            break
        }

        const pct = Math.round(((i + 1) / targets.length) * 100)
        process.stdout.write(`  [${i + 1}/${targets.length}] (${pct}%) ${character_id} (${description.length}文字) ... `)

        const result = await translateWithDeepl(description)
        if (!result) {
            console.log('⚠️  失敗')
            failed++
        } else {
            await updateDescription(character_id, result)
            consumedChars += description.length
            translated++
            console.log('✅')
        }

        await sleep(350)
    }

    // 最終集計
    const final = await checkDeeplUsage()
    console.log(`\n✅ 完了: ${translated}件 翻訳 / ${failed}件 失敗`)
    console.log(`   DeepL 消費: ${consumedChars.toLocaleString()} 文字`)
    console.log(`   最終使用量: ${final.used.toLocaleString()} / ${final.limit.toLocaleString()} 文字 (${Math.round(final.used / final.limit * 100)}%)`)
}

main().catch(console.error)
