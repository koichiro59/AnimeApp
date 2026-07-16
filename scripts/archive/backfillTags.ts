import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const TAG_CATEGORIES: Record<string, string[]> = {
    '髪色': ['金髪', '銀髪', '白髪', '黒髪', '茶髪', '赤髪', 'ピンク髪', '青髪', '緑髪', '紫髪', 'グレー髪', 'オレンジ髪', 'ツートーン'],
    '髪型': ['ツインテール', 'ポニーテール', 'ツーサイドアップ', 'ロングヘア', 'ショートヘア', 'ボブカット', 'お団子ヘア', 'アホ毛', '三つ編み', 'おさげ', '縦ロール', 'ウェーブヘア', 'メカクレ'],
    '顔・目': ['メガネ', '眼帯', 'オッドアイ', '赤目', '金目', 'ジト目', 'タレ目', 'つり目', '八重歯'],
    '動物・異形': ['猫耳', 'うさ耳', 'きつね耳', '犬耳', '狼耳', '獣耳(その他)', 'しっぽ', '翼', '角', '包帯'],
    '体型': ['長身', '小柄', '巨乳', '貧乳', '褐色肌', '白肌', '筋肉質', '細身', 'グラマー'],
    '年齢層': ['幼女', 'ロリ', 'ショタ', 'JK/高校生', 'お姉さん', 'おじさん', '老人'],
    '服装・萌え要素': ['制服', 'メイド服', '巫女服', '水着', 'ゴスロリ', '和服/着物', 'チャイナドレス', '軍服', 'ドレス', 'ミニスカ', 'ニーソ', 'へそ出し', 'パーカー', 'カチューシャ', 'リボン', 'チョーカー', '男の娘'],
    '性格・デレ系': ['ツンデレ', 'ヤンデレ', 'クーデレ', 'ダンデレ', 'デレデレ', 'カミデレ', 'ハジデレ', '小悪魔'],
    '性格・一般': ['天然', '元気', 'おっとり', 'クール', '真面目', 'ドジ', 'S属性', 'M属性', '無口', 'お嬢様', 'ボーイッシュ', '中二病', 'ナルシスト', 'マイペース'],
    '役割': ['主人公', 'ヒロイン', 'ライバル', '悪役', '幼馴染', '妹/弟', '兄/姉', '先輩', '委員長', '生徒会長', '転校生', '双子'],
    '家族系': ['父親', '母親', 'シングルファーザー', 'シングルマザー'],
    '職業・身分': ['高校生', '中学生', '大学生', '社会人', '教師', '医者/看護師', 'アイドル', '騎士', '勇者', '王族/お姫様', '執事', '巫女', 'シスター', '忍者', '探偵', '武道家'],
    '能力・設定': ['魔法使い', '剣士', '格闘家', '銃使い', '超能力', '天才', '異世界転生', 'ロボット/アンドロイド', '吸血鬼', 'エルフ', '人外', '妖怪', '魔王'],
    '特殊設定': ['二重人格', '記憶喪失', '不死/不老', 'ボクっ子', 'TS', '不運'],
}

const ALL_TAGS = new Set(Object.values(TAG_CATEGORIES).flat())

const TAG_CATEGORY_LIST = Object.entries(TAG_CATEGORIES)
    .map(([cat, tags]) => `【${cat}】${tags.join('、')}`)
    .join('\n')

async function detectTags(character: {
    name: string
    gender: string | null
    age: number | null
    height: number | null
    description: string | null
}): Promise<string[]> {
    const charInfo = [
        `名前: ${character.name}`,
        character.gender ? `性別: ${character.gender}` : null,
        character.age != null ? `年齢: ${character.age}歳` : null,
        character.height != null ? `身長: ${character.height}cm` : null,
        character.description ? `説明文:\n${character.description}` : null,
    ].filter(Boolean).join('\n')

    const prompt = `以下のアニメキャラクターの情報を分析して、該当する属性タグをJSON配列で返してください。

【キャラクター情報】
${charInfo}

【属性タグ一覧（カテゴリ別）】
${TAG_CATEGORY_LIST}

【ルール】
- 説明文や性別・年齢・身長から確実に判断できるタグのみを選ぶ
- 推測・憶測でのタグ付けは避ける
- 該当するタグが複数あれば全て選択
- 返答はJSONの文字列配列のみ（例: ["金髪", "ツンデレ", "高校生"]）`

    const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    try {
        const codeBlockMatches = [...text.matchAll(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/g)]
        let jsonStr: string | null = null

        if (codeBlockMatches.length > 0) {
            jsonStr = codeBlockMatches[codeBlockMatches.length - 1][1]
        } else {
            const lastStart = text.lastIndexOf('[')
            const lastEnd = text.lastIndexOf(']')
            if (lastStart !== -1 && lastEnd > lastStart) {
                jsonStr = text.slice(lastStart, lastEnd + 1)
            }
        }

        if (!jsonStr) return []
        const parsed = JSON.parse(jsonStr) as string[]
        return parsed.filter(tag => ALL_TAGS.has(tag))
    } catch {
        return []
    }
}

const BATCH_SIZE = 10
const DELAY_MS = 300

async function main() {
    console.log('📥 タグ未設定のキャラを取得中...')

    const { data: characters, error } = await supabase
        .from('characters')
        .select('character_id, name, gender, age, height, description')
        .is('tags', null)
        .not('description', 'is', null)

    if (error) throw error

    const total = characters?.length ?? 0
    if (total === 0) {
        console.log('対象キャラが見つかりません（全件処理済み）')
        return
    }

    console.log(`対象: ${total}件\n`)

    const sqlLines: string[] = []
    let failed = 0

    for (let i = 0; i < characters!.length; i++) {
        const char = characters![i]

        try {
            const tags = await detectTags(char)

            // PostgreSQL配列リテラルに変換: ARRAY['tag1','tag2']
            const pgArray = tags.length > 0
                ? `ARRAY[${tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]`
                : `'{}'::TEXT[]`

            sqlLines.push(`UPDATE characters SET tags = ${pgArray} WHERE character_id = '${char.character_id}';`)

            const tagStr = tags.length > 0 ? tags.join(', ') : '（なし）'
            console.log(`[${i + 1}/${total}] ${char.name}: ${tagStr}`)
        } catch (e) {
            failed++
            console.log(`[${i + 1}/${total}] ⚠️  失敗: ${char.name} - ${e}`)
        }

        if (DELAY_MS > 0) await new Promise(r => setTimeout(r, DELAY_MS))

        if ((i + 1) % BATCH_SIZE === 0) {
            console.log(`── 進捗: ${i + 1}/${total}件 (失敗:${failed}) ──`)
        }
    }

    const outputFile = 'scripts/backfill_tags.sql'
    fs.writeFileSync(outputFile, sqlLines.join('\n'), 'utf8')
    console.log(`\n✅ ${sqlLines.length}件のUPDATE文を生成 → ${outputFile}`)
    console.log('📋 Supabase SQL Editorで実行してください')
}

main().catch(console.error)
