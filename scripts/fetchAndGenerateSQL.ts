import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'
const WIKIPEDIA_API = 'https://ja.wikipedia.org/w/api.php'

// AniListから2024〜2026年の人気アニメを取得
const fetchAnimes = async (year: number, season: string) => {
    const query = `
    query ($year: Int, $season: MediaSeason) {
      Page(perPage: 10) {
        media(
          type: ANIME
          season: $season
          seasonYear: $year
          sort: POPULARITY_DESC
          format: TV
        ) {
          id
          title { native romaji }
          startDate { year month }
          episodes
          genres
          coverImage { large }
          studios(isMain: true) { nodes { name } }
          characters(sort: ROLE, perPage: 5) {
            edges {
              role
              node {
                id
                name { native full }
                image { large }
                age
                gender
                description(asHtml: false)
              }
            }
          }
        }
      }
    }
  `
    const res = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { year, season } }),
    })
    const data = await res.json()
    return data?.data?.Page?.media ?? []
}

// WikipediaからあらすじをJSONで取得
const fetchWikiSynopsis = async (title: string): Promise<string> => {
    try {
        const params = new URLSearchParams({
            action: 'query',
            titles: title,
            prop: 'extracts',
            exintro: '1',
            explaintext: '1',
            format: 'json',
            origin: '*',
        })
        const res = await fetch(`${WIKIPEDIA_API}?${params}`)
        const data = await res.json()
        const pages = data.query.pages
        const page = Object.values(pages)[0] as any
        if (!page || page.missing) return ''
        const extract: string = page.extract ?? ''
        // 最初の200文字だけ取得
        return extract.slice(0, 200).replace(/\n/g, ' ').trim()
    } catch {
        return ''
    }
}

// 放送時期を日本語に変換
const seasonLabel = (season: string, year: number): string => {
    const map: Record<string, string> = {
        WINTER: '冬',
        SPRING: '春',
        SUMMER: '夏',
        FALL: '秋',
    }
    return `${year}年${map[season] ?? ''}`
}

// SQLエスケープ
const esc = (str: string | null | undefined): string => {
    if (!str) return 'NULL'
    return `'${str.replace(/'/g, "''")}'`
}

// 年齢を整数に変換（"23-24"のような範囲は最初の数字を使用）
const parseAge = (age: string | null | undefined): string => {
    if (!age) return 'NULL'
    const match = age.match(/\d+/)
    if (!match) return 'NULL'
    return match[0]
}

// descriptionからMarkdownリンクや特殊文字を除去
const cleanDescription = (text: string | null | undefined): string => {
    if (!text) return ''
    return text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Markdownリンクをテキストのみに
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')   // 画像リンクを除去
        .replace(/__([^_]+)__/g, '$1')            // __bold__ を除去
        .replace(/~~([^~]+)~~/g, '$1')            // ~~取り消し線~~ を除去
        .replace(/\n/g, ' ')
        .trim()
        .slice(0, 200)
}

const main = async () => {
    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
    const years = [2024, 2025, 2026]

    let animeInserts: string[] = []
    let characterInserts: string[] = []
    let genreInserts: string[] = []
    let animeGenreInserts: string[] = []
    let productionInserts: string[] = []

    const genreMap = new Map<string, number>()
    const productionMap = new Map<string, string>()
    let genreId = 100 // 既存データと被らないよう100から
    let animeCounter = 100
    let characterCounter = 100

    for (const year of years) {
        for (const season of seasons) {
            console.log(`取得中: ${year}年 ${season}...`)

            const animes = await fetchAnimes(year, season)

            // データが空の場合はスキップ
            if (!animes || animes.length === 0) {
                console.log(`  スキップ（データなし）`)
                continue
            }

            for (const anime of animes) {
                const title: string = anime.title.native ?? anime.title.romaji
                const animeId = `AN${String(animeCounter).padStart(4, '0')}`
                animeCounter++

                // Wikipedia からあらすじ取得
                const synopsis = await fetchWikiSynopsis(title)
                console.log(`  📺 ${title} → あらすじ: ${synopsis ? '取得OK' : '取得なし'}`)

                // 制作会社
                const studioName: string = anime.studios?.nodes?.[0]?.name ?? null
                let productionId: string | null = null
                if (studioName) {
                    if (!productionMap.has(studioName)) {
                        const pid = `PR${String(productionMap.size + 1).padStart(4, '0')}`
                        productionMap.set(studioName, pid)
                        productionInserts.push(
                            `INSERT INTO productions (production_id, name, country) VALUES (${esc(pid)}, ${esc(studioName)}, '日本') ON CONFLICT DO NOTHING;`
                        )
                    }
                    productionId = productionMap.get(studioName)!
                }

                // アニメINSERT
                animeInserts.push(
                    `INSERT INTO animes (anime_id, title, broadcast_season, production_id, type, episodes, synopsis, anilist_id) VALUES (${esc(animeId)}, ${esc(title)}, ${esc(seasonLabel(season, year))}, ${esc(productionId)}, 'TVシリーズ', ${anime.episodes ?? 'NULL'}, ${esc(synopsis)}, ${anime.id}) ON CONFLICT DO NOTHING;`
                )

                // ジャンル
                for (const genre of (anime.genres ?? [])) {
                    if (!genreMap.has(genre)) {
                        genreMap.set(genre, genreId)
                        genreInserts.push(
                            `INSERT INTO genres (genre_id, name) VALUES (${genreId}, ${esc(genre)}) ON CONFLICT DO NOTHING;`
                        )
                        genreId++
                    }
                    const gid = genreMap.get(genre)!
                    animeGenreInserts.push(
                        `INSERT INTO anime_genres (anime_id, genre_id) VALUES (${esc(animeId)}, ${gid}) ON CONFLICT DO NOTHING;`
                    )
                }

                // キャラクター
                for (const edge of (anime.characters?.edges ?? [])) {
                    const char = edge.node
                    const charName: string = char.name.native ?? char.name.full
                    const characterId = `CH${String(characterCounter).padStart(6, '0')}`
                    characterCounter++

                    characterInserts.push(
                        `INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES (${esc(characterId)}, ${esc(animeId)}, ${esc(charName)}, ${esc(cleanDescription(char.description))}, ${parseAge(char.age)}, ${esc(char.gender)}, ${char.id}) ON CONFLICT DO NOTHING;`
                    )
                }

                // レート制限対策
                await new Promise((r) => setTimeout(r, 500))
            }
        }
    }

    const sql = [
        '-- 制作会社',
        ...productionInserts,
        '',
        '-- ジャンル',
        ...genreInserts,
        '',
        '-- アニメ',
        ...animeInserts,
        '',
        '-- アニメ×ジャンル',
        ...animeGenreInserts,
        '',
        '-- キャラクター',
        ...characterInserts,
    ].join('\n')

    fs.writeFileSync('scripts/output.sql', sql, 'utf8')
    console.log('\n✅ scripts/output.sql を生成しました！')
}

main().catch(console.error)