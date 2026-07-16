import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)

const esc = (str: string | null | undefined): string => {
    if (str == null) return 'NULL'
    return `'${str.replace(/'/g, "''")}'`
}

const roleRank = (role: string | null): number => {
    if (role === 'SUPPORTING') return 2
    if (role === 'BACKGROUND') return 3
    return 1
}

async function main() {
    // 上位40アニメ取得
    const { data: animes, error: animeErr } = await supabase
        .from('animes')
        .select('anime_id, anilist_id')
        .eq('is_hidden', false)
        .order('popularity', { ascending: false, nullsFirst: false })
        .range(0, 39)

    if (animeErr) throw animeErr

    // 各アニメのキャラをソートして上位10人を収集
    const targetIds: string[] = []

    for (const anime of animes) {
        const { data: chars, error } = await supabase
            .from('characters')
            .select('character_id, role, favourites')
            .eq('anime_id', anime.anime_id)

        if (error || !chars) continue

        const sorted = [...chars].sort((a, b) => {
            const rd = roleRank(a.role) - roleRank(b.role)
            if (rd !== 0) return rd
            const fd = (b.favourites ?? 0) - (a.favourites ?? 0)
            if (fd !== 0) return fd
            return a.character_id.localeCompare(b.character_id)
        })

        sorted.slice(0, 10).forEach(c => targetIds.push(c.character_id))
    }

    console.log(`対象: ${targetIds.length}件`)

    // 現在のdescription・tagsをSupabaseから取得
    const { data: chars, error: charErr } = await supabase
        .from('characters')
        .select('character_id, description, tags')
        .in('character_id', targetIds)

    if (charErr) throw charErr

    // SQL生成
    const lines = [
        `-- enrichTopChars.ts による翻訳・タグ抽出結果`,
        `-- 生成日: ${new Date().toLocaleDateString('ja-JP')}`,
        `-- 対象: ${chars?.length ?? 0}件`,
        '',
    ]

    for (const c of chars ?? []) {
        const tagsVal = c.tags?.length ? `'{${c.tags.map((t: string) => `"${t.replace(/"/g, '\\"')}"`).join(',')}}'` : 'NULL'
        lines.push(
            `UPDATE characters SET description = ${esc(c.description)}, tags = ${tagsVal} WHERE character_id = '${c.character_id}';`
        )
    }

    const outPath = 'scripts/sql/patches/13_enrich_top_chars.sql'
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
    console.log(`✅ ${chars?.length ?? 0}件 → ${outPath}`)
}

main().catch(console.error)
