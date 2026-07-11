import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ANILIST_URL = 'https://graphql.anilist.co'
const WIKIPEDIA_API = 'https://ja.wikipedia.org/w/api.php'
const DEEPL_API_KEY = process.env.DEEPL_API_KEY!

// コマンドライン引数から年を取得
const args = process.argv.slice(2)
const targetYear = parseInt(args[0])
if (!targetYear || isNaN(targetYear)) {
    console.error('❌ 年を指定してください。例: npx tsx scripts/fetchAndGenerateSQL.ts 2025')
    process.exit(1)
}
console.log(`📅 ${targetYear}年のアニメを取得します`)

// 日本語かどうかチェック
const isJapanese = (text: string | null | undefined): boolean => {
    if (!text) return false
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
}

const GENRE_MAP: Record<string, string> = {
    'Action': 'アクション',
    'Adventure': '冒険',
    'Comedy': 'コメディ',
    'Drama': 'ドラマ',
    'Ecchi': 'エロ',
    'Fantasy': 'ファンタジー',
    'Hentai': '成人向け',
    'Horror': 'ホラー',
    'Mahou Shoujo': '魔法少女',
    'Mecha': 'メカ',
    'Music': '音楽',
    'Mystery': 'ミステリー',
    'Psychological': '頭脳戦',
    'Romance': '恋愛',
    'Sci-Fi': 'SF',
    'Slice of Life': '日常',
    'Sports': 'スポーツ',
    'Supernatural': 'ハイファンタジー',
    'Thriller': 'スリラー',
}

// 制作会社英語→日本語変換マップ
const PRODUCTION_MAP: Record<string, string> = {
    'A-1 Pictures': 'A-1 Pictures',
    'Kyoto Animation': '京都アニメーション',
    'Toei Animation': '東映アニメーション',
    'Shin-Ei Animation': 'シンエイ動画',
    'Tatsunoko Production': 'タツノコプロ',
    'Tezuka Productions': '手塚プロダクション',
    'Nippon Animation': '日本アニメーション',
    'Telecom Animation Film': 'テレコム・アニメーションフィルム',
    'Production I.G': 'プロダクション・アイジー',
    'Studio Pierrot': 'スタジオぴえろ',
    'PIERROT FILMS': 'ぴえろフィルムズ',
    'Sunrise': 'サンライズ',
    'Shaft': 'シャフト',
    'MADHOUSE': 'マッドハウス',
    'bones': 'ボンズ',
    'bones film': 'ボンズフィルム',
    'ufotable': 'ufotable',
    'MAPPA': 'MAPPA',
    'CloverWorks': 'CloverWorks',
    'WIT STUDIO': 'WIT STUDIO',
    'Science SARU': 'サイエンスSARU',
    'Doga Kobo': '動画工房',
    'J.C.STAFF': 'J.C.STAFF',
    'david production': 'david production',
    'Studio DEEN': 'スタジオディーン',
    'Brain\'s Base': 'ブレインズ・ベース',
    'feel.': 'feel.',
    'SILVER LINK.': 'SILVER LINK.',
    'Satelight': 'サテライト',
    'OLM': 'オー・エル・エム',
    'TRIGGER': 'TRIGGER',
    'LIDENFILMS': 'LIDENFILMS',
    'Lerche': 'Lerche',
    'GONZO': 'GONZO',
    'Kinema Citrus': 'キネマシトラス',
    'P.A.WORKS': 'P.A.WORKS',
    'GoHands': 'GoHands',
    'Passione': 'Passione',
    'TMS Entertainment': 'トムス・エンタテインメント',
    'WHITE FOX': 'WHITE FOX',
    'Seven Arcs': 'セブン・アークス',
    'Studio Gokumi': 'スタジオごくみ',
    'Asahi Production': '旭プロダクション',
    'Studio KAI': 'Studio KAI',
    'Zero-G': 'Zero-G',
    'EMT Squared': 'EMT Squared',
    'Quad': 'Quad',
    'ENGI': 'ENGI',
    'SANZIGEN': 'SANZIGEN',
    'Studio Bind': 'Studio Bind',
    'CygamesPictures': 'Cygames Pictures',
    'Yostar Pictures': 'Yostar Pictures',
    'Bibury Animation Studios': 'Bibury Animation Studios',
    'BAKKEN RECORD': 'BAKKEN RECORD',
    'Marvy Jack': 'Marvy Jack',
    'Studio Comet': 'スタジオコメット',
    'Studio Gallop': 'スタジオギャロップ',
    'Studio Hibari': 'スタジオひばり',
    'Geno Studio': 'Geno Studio',
    'Millepensee': 'Millepensee',
    'TOHO animation STUDIO': 'TOHOアニメーションスタジオ',
    'Orange': 'オレンジ',
    'POLYGON PICTURES': 'ポリゴン・ピクチュアズ',
    'Lay-duce': 'Lay-duce',
    'Okuruto Noboru': 'オクルトノボル',
    'SynergySP': 'シナジーSP',
    'Bandai Namco Pictures': 'バンダイナムコピクチャーズ',
    'Studio Khara': 'スタジオカラー',
    'Felix Film': 'フェリックスフィルム',
    'Nexus': 'Nexus',
    'Platinum Vision': 'プラチナビジョン',
    'Bridge': 'ブリッジ',
    'Gaina': 'ガイナ',
    'project No.9': 'プロジェクトナンバーナイン',
    'Ajiado': '亜細亜堂',
    'Jumondou': '寿門堂',
    'Yokohama Animation Lab': '横浜アニメーションラボ',
    'Tsumugi Akita Anime Lab': '紬ぎ秋田アニメラボ',
    'Sotsu': 'ソツ',
    'Shogakukan Music & Digital Entertainment': '小学館ミュージック&デジタル エンタテイメント',
    'Hayabusa Film': 'ハヤブサフィルム',
    'DLE': 'DLE',
    'Yumeta Company': '夢太カンパニー',
    'Studio VOLN': 'Studio VOLN',
    'TYPHOON GRAPHICS': 'TYPHOON GRAPHICS',
    'studio A-CAT': 'studio A-CAT',
    'Makaria': 'Makaria',
    'Arvo Animation': 'Arvo Animation',
    'Teddy': 'Teddy',
    'Soigne': 'Soigne',
    'Kachigarasu': 'Kachigarasu',
    'Lapin Track': 'Lapin Track',
    'The Answer Studio': 'The Answer Studio',
    '100studio': '100studio',
    'LinQ': 'LinQ',
    'A-Real': 'A-Real',
    'studio MOTHER': 'studio MOTHER',
    'Maho Film': 'Maho Film',
    'Staple Entertainment': 'Staple Entertainment',
    'Lesprit': 'Lesprit',
    'LandQ studios': 'LandQ studios',
    'Atelier Pontdarc': 'Atelier Pontdarc',
    'domerica': 'domerica',
    'PRA': 'PRA',
    'Ziine Studio': 'Ziine Studio',
    'Drive': 'Drive',
    'Studio Lings': 'Studio Lings',
    'Gekkou': 'Gekkou',
    'Studio elle': 'Studio elle',
    'STUDIO POLON': 'STUDIO POLON',
    'Voil': 'Voil',
    'Studio Flad': 'Studio Flad',
    'East Fish Studio': 'East Fish Studio',
    'BLADE': 'BLADE',
    'Nomad': 'ノーマッド',
    'Shuka': '朱夏',
    'A.C.G.T.': 'A.C.G.T',
    'BELLNOX FILMS': 'ベルノックスフィルムズ',
    'GA-CREW': 'GA-CREW',
    'Ashi Productions': '葦プロダクション',
    'HORNETS': 'HORNETS',
    'Qzil.la': 'Qzil.la',
    'TROYCA': 'トロイカ',
    'Asread': 'アスリード',
    'Ascension': 'Ascension',
    'PINE JAM': 'PINE JAM',
    'diomedéa': 'ディオメディア',
    'Seven': 'セブン',
    'Gift-o’-Animation': 'Gift-o’-Animation',
    'Toon Harbor Works': 'Toon Harbor Works',
    '8-bit': 'エイトビット',
    'Actas': 'アクタス',
    'CONNECT': 'CONNECT',
    'ZEXCS': 'ゼクシズ',
    'CUE': 'CUE',
    'BENTEN Film': 'BENTEN Film',
    'JUVENAGE': 'JUVENAGE',
    'AXsiZ': 'AXsiZ',
    'Signal.MD': 'シグナル・エムディ',
    'Daily Plan.net': 'Daily Plan.net',
    'NUT': 'NUT',
    'ROLL2': 'ROLL2',
    'Aura Studio': 'Aura Studio',
    'Cypic': 'Cypic',
    'animation studio42': 'animation studio42',
    'Colored Pencil Animation Japan': 'Colored Pencil Animation Japan',
    'Magic Bus': 'マジックバス',
    'NEWON': 'NEWON',
    'studio CANDY BOX': 'studio CANDY BOX',
    'NICHICALINE': 'NICHICALINE',
    'C-Station': 'C-Station',
    'Studio Houkiboshi': 'スタジオほうき星',
    'CHOCOLATE': 'CHOCOLATE',
    'C2C': 'C2C',
    'Electric Circus': 'エレクトリックサーカス',
    'E&H Production': 'E&H production',
    'KONAMI animation': 'KONAMI animation',
    'Children\'s Playground Entertainment': '童園創意股份有限公司',
    'Studio Massket': 'Studio Massket',
    'Studio PuYUKAI': 'スタジオぷYUKAI',
    'CLOUDHEARTS': 'CLOUDHEARTS',
    'Liber': 'Liber',
    'GEEKTOYS': 'GEEKTOYS',
    'Studio Blanc': 'スタジオブラン',
    'Dongwoo Animation': 'Dongwoo Animation',
    'TNK': 'ティー・エヌ・ケー',
    'Imagica Infos': 'IMAGICA Infos',
    'ILCASHIPS': 'ILCA SHIPS',
    'Akatsuki': 'アカツキ',
    'TriF studio': 'TriFスタジオ',
    'Studio Signpost': 'スタジオサインポスト',
    'UNEND': 'UNEND',
    'M.S.C': 'エム・エス・シー',
    'Pili International Multimedia': '霹靂國際多媒體股份有限公司',
    'STUDIO SOTA': 'STUDIO SOTA'
}

// ジャンル変換（変換表にないものはnullを返す）
const translateGenre = (genre: string): string | null => {
    if (GENRE_MAP[genre] !== undefined) return GENRE_MAP[genre]
    console.log(`  ⚠️  ジャンル変換表なし: ${genre}`)
    return null
}

// 制作会社名変換（変換表にないものはnullを返す）
const translateProduction = (name: string): string | null => {
    if (PRODUCTION_MAP[name] !== undefined) return PRODUCTION_MAP[name]
    console.log(`  ⚠️  制作会社変換表なし: ${name}`)
    return null
}

// ===== アニメ一覧を取得（キャラクターは含まない） =====
const fetchAnimes = async (year: number, season: string) => {
    let allMedia: any[] = []
    let page = 1
    let hasNextPage = true

    while (hasNextPage) {
        const query = `
      query ($year: Int, $season: MediaSeason, $page: Int) {
        Page(page: $page, perPage: 50) {
          pageInfo { hasNextPage }
          media(
            type: ANIME
            season: $season
            seasonYear: $year
            sort: POPULARITY_DESC
            format: TV
            countryOfOrigin: JP
          ) {
            id
            title { native romaji english }
            startDate { year month }
            episodes
            genres
            coverImage { extraLarge }
            studios(isMain: true) { nodes { name } }
          }
        }
      }
    `
        const res = await fetch(ANILIST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { year, season, page } }),
        })
        const data = await res.json()
        const pageData = data?.data?.Page
        if (!pageData) break

        allMedia = allMedia.concat(pageData.media ?? [])
        hasNextPage = pageData.pageInfo?.hasNextPage ?? false
        page++

        await new Promise((r) => setTimeout(r, 1000))
    }

    return allMedia
}

// ===== 指定アニメの全キャラクターをページング取得 =====
const fetchCharacters = async (animeId: number): Promise<any[]> => {
    let page = 1
    let hasNextPage = true
    const characters: any[] = []

    while (hasNextPage) {
        const query = `
      query ($id: Int, $page: Int) {
        Media(id: $id) {
          characters(page: $page, perPage: 50, sort: ROLE) {
            pageInfo { hasNextPage }
            edges {
              role
              voiceActors(language: JAPANESE) {
                name { native }
              }
              node {
                id
                name { native full }
                image { large }
                age
                gender
                bloodType
                dateOfBirth { year month day }
                description(asHtml: false)
              }
            }
          }
        }
      }
    `

        let retries = 0
        let success = false
        let data: any = null

        // AniListの429（レート制限）対策のリトライ処理
        while (!success && retries < 3) {
            const res = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables: { id: animeId, page } }),
            })

            if (res.status === 429) {
                console.log(`    ⏳ レート制限。5秒待機してリトライ...`)
                await new Promise((r) => setTimeout(r, 5000))
                retries++
                continue
            }

            data = await res.json()
            success = true
        }

        const charData = data?.data?.Media?.characters
        if (!charData) break

        characters.push(...(charData.edges ?? []))
        hasNextPage = charData.pageInfo?.hasNextPage ?? false
        page++

        await new Promise((r) => setTimeout(r, 600))
    }

    return characters
}

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
        return extract.slice(0, 200).replace(/\n/g, ' ').trim()
    } catch {
        return ''
    }
}

// Wikipediaからキャラクターの日本語説明を取得
const fetchWikiCharacterDescription = async (characterName: string, animeTitle: string): Promise<string> => {
    try {
        const params = new URLSearchParams({
            action: 'query',
            titles: `${characterName}`,
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
        if (!isJapanese(extract)) return ''
        return extract.slice(0, 200).replace(/\n/g, ' ').trim()
    } catch {
        return ''
    }
}

const seasonLabel = (season: string, year: number): string => {
    const map: Record<string, string> = {
        WINTER: '冬', SPRING: '春', SUMMER: '夏', FALL: '秋',
    }
    return `${year}年${map[season] ?? ''}`
}

const esc = (str: string | null | undefined): string => {
    if (!str) return 'NULL'
    return `'${str.replace(/'/g, "''")}'`
}

const parseAge = (age: string | null | undefined): string => {
    if (!age) return 'NULL'
    const match = age.match(/\d+/)
    return match ? match[0] : 'NULL'
}

// genderを日本語に正規化
const normalizeGender = (gender: string | null | undefined): string | null => {
    if (!gender) return null
    const lower = gender.toLowerCase()
    if (lower.includes('female')) return '女性'
    if (lower.includes('male')) return '男性'
    if (lower.includes('agender') || lower.includes('non-binary')) return 'なし'
    if (isJapanese(gender)) return gender.slice(0, 10)
    return null
}

const normalizeRomaji = (text: string): string =>
    text.replace(/ou/gi, 'o').replace(/uu/gi, 'u').replace(/oo/gi, 'o')

const parseHeight = (description: string | null | undefined): number | null => {
    if (!description) return null
    const match = description.match(/(?:Height|身長)[^0-9]*(\d+)\s*cm/i)
    return match ? parseInt(match[1]) : null
}

const formatBirthday = (dateOfBirth: { year: number | null, month: number | null, day: number | null } | null): string | null => {
    if (!dateOfBirth) return null
    const { month, day } = dateOfBirth
    if (month && day) return `${month}月${day}日`
    if (month) return `${month}月`
    return null
}

const prepareDescription = (text: string | null | undefined): string => {
    if (!text) return ''
    return text
        .replace(/~![\s\S]*?!~/g, '')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/^(?:Height|身長|Weight|体重)[^\n]*\n?/gim, '')
        .replace(/\n/g, ' ')
        .trim()
        .slice(0, 500)
}

const translateWithDeepl = async (text: string, nameMap: Record<string, string>): Promise<string> => {
    if (!text) return ''
    let preprocessed = normalizeRomaji(text)
    for (const [en, ja] of Object.entries(nameMap)) {
        preprocessed = preprocessed.replaceAll(en, ja)
    }
    try {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: [preprocessed], target_lang: 'JA', source_lang: 'EN' }),
        })
        const data = await res.json()
        return data.translations?.[0]?.text ?? ''
    } catch {
        return ''
    }
}

const main = async () => {
    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']

    let animeInserts: string[] = []
    let characterInserts: string[] = []
    let genreInserts: string[] = []
    let animeGenreInserts: string[] = []
    let productionInserts: string[] = []

    const genreMap = new Map<string, number>()
    const productionMap = new Map<string, string>()
    const unmatchedGenres = new Set<string>()
    const unmatchedProductions = new Set<string>()
    const seenAnimeAnilistIds = new Set<number>()
    const seenCharacterAnilistIds = new Set<number>()

    // カウンターファイルから読み込む
    const counterFile = 'scripts/counter.json'
    let animeCounter = 100
    let characterCounter = 100
    let genreId = 100

    if (fs.existsSync(counterFile)) {
        const counter = JSON.parse(fs.readFileSync(counterFile, 'utf8'))
        animeCounter = counter.animeCounter ?? 100
        characterCounter = counter.characterCounter ?? 100
        genreId = counter.genreId ?? 100
        console.log(`📊 カウンター読み込み: animeCounter=${animeCounter}, characterCounter=${characterCounter}, genreId=${genreId}`)
    } else {
        console.log(`📊 カウンターファイルなし。100から開始します`)
    }

    // 全年分のSQLファイルからanilist_idと制作会社を読み込む（重複チェック用）
    const allSqlFiles = fs.readdirSync('scripts')
        .filter((f: string) => f.match(/^output_\d{4}\.sql$/))
        .sort()

    if (allSqlFiles.length > 0) {
        console.log(`📂 既存SQLファイルを読み込み中: ${allSqlFiles.join(', ')}`)
        for (const file of allSqlFiles) {
            const content = fs.readFileSync(`scripts/${file}`, 'utf8')

            for (const match of content.matchAll(/INSERT INTO animes .+, (\d+)\) ON CONFLICT/g)) {
                seenAnimeAnilistIds.add(Number(match[1]))
            }
            for (const match of content.matchAll(/INSERT INTO characters .+, (\d+)\) ON CONFLICT/g)) {
                seenCharacterAnilistIds.add(Number(match[1]))
            }
            for (const match of content.matchAll(/INSERT INTO productions \(production_id[^)]+\) VALUES \('(PR\d+)', '([^']+)'/g)) {
                const pid = match[1]
                const pname = match[2]
                const engName = Object.entries(PRODUCTION_MAP).find(([, v]) => v === pname)?.[0]
                if (engName && !productionMap.has(engName)) {
                    productionMap.set(engName, pid)
                }
            }
            for (const match of content.matchAll(/INSERT INTO genres \(genre_id, name\) VALUES \((\d+), '([^']+)'\)/g)) {
                const gid = Number(match[1])
                const gname = match[2]
                const engName = Object.entries(GENRE_MAP).find(([, v]) => v === gname)?.[0]
                if (engName && !genreMap.has(engName)) {
                    genreMap.set(engName, gid)
                }
            }
        }
        console.log(`  既存アニメ: ${seenAnimeAnilistIds.size}件`)
        console.log(`  既存キャラ: ${seenCharacterAnilistIds.size}件`)
    }

    const outputFile = `scripts/output_${targetYear}.sql`

    for (const season of seasons) {
        console.log(`\n取得中: ${targetYear}年 ${season}...`)

        const animes = await fetchAnimes(targetYear, season)

        if (!animes || animes.length === 0) {
            console.log(`  スキップ（データなし）`)
            continue
        }

        console.log(`  ${animes.length}件取得`)

        for (const anime of animes) {
            const title: string = anime.title.native ?? anime.title.romaji

            // アニメの重複スキップ
            if (seenAnimeAnilistIds.has(anime.id)) {
                console.log(`  ⏭️  重複スキップ: ${title}`)
                continue
            }
            seenAnimeAnilistIds.add(anime.id)

            const animeId = `AN${String(animeCounter).padStart(4, '0')}`
            animeCounter++

            const synopsis = await fetchWikiSynopsis(title)
            console.log(`  📺 ${title} → あらすじ: ${synopsis ? '取得OK' : '取得なし'}`)

            // 制作会社（日本語名のみ）
            const studioName: string | null = anime.studios?.nodes?.[0]?.name ?? null
            let productionId: string | null = null
            if (studioName) {
                const translatedName = translateProduction(studioName)
                if (translatedName !== null) {
                    if (!productionMap.has(studioName)) {
                        const pid = `PR${String(productionMap.size + 1).padStart(4, '0')}`
                        productionMap.set(studioName, pid)
                        productionInserts.push(
                            `INSERT INTO productions (production_id, name, country) VALUES (${esc(pid)}, ${esc(translatedName)}, '日本') ON CONFLICT DO NOTHING;`
                        )
                    }
                    productionId = productionMap.get(studioName)!
                } else {
                    unmatchedProductions.add(studioName)
                }
            }

            animeInserts.push(
                `INSERT INTO animes (anime_id, title, broadcast_season, production_id, type, episodes, synopsis, anilist_id) VALUES (${esc(animeId)}, ${esc(title)}, ${esc(seasonLabel(season, targetYear))}, ${esc(productionId)}, 'TVシリーズ', ${anime.episodes ?? 'NULL'}, ${esc(synopsis)}, ${anime.id}) ON CONFLICT DO NOTHING;`
            )

            for (const genre of (anime.genres ?? [])) {
                const translatedGenre = translateGenre(genre)
                if (translatedGenre === null) {
                    unmatchedGenres.add(genre)
                    continue
                }
                if (!genreMap.has(genre)) {
                    genreMap.set(genre, genreId)
                    genreInserts.push(
                        `INSERT INTO genres (genre_id, name) VALUES (${genreId}, ${esc(translatedGenre)}) ON CONFLICT DO NOTHING;`
                    )
                    genreId++
                }
                const gid = genreMap.get(genre)!
                animeGenreInserts.push(
                    `INSERT INTO anime_genres (anime_id, genre_id) VALUES (${esc(animeId)}, ${gid}) ON CONFLICT DO NOTHING;`
                )
            }

            // ===== キャラクターを全件ページング取得 =====
            const characterEdges = await fetchCharacters(anime.id)
            console.log(`    👥 ${title} → キャラ${characterEdges.length}件取得`)

            // 名前マップ構築（英語名→日本語名、翻訳前置換用）
            const nameMap: Record<string, string> = {}
            // アニメタイトルを追加（正規化キーで登録）
            const nativeTitle = anime.title.native
            if (nativeTitle) {
                if (anime.title.english && anime.title.english !== nativeTitle) nameMap[normalizeRomaji(anime.title.english)] = nativeTitle
                if (anime.title.romaji && anime.title.romaji !== nativeTitle) nameMap[normalizeRomaji(anime.title.romaji)] = nativeTitle
            }
            // キャラクター名を追加（正規化キーで登録）
            for (const edge of characterEdges) {
                const { full, native } = edge.node.name
                if (full && native && isJapanese(native)) nameMap[normalizeRomaji(full)] = native
            }

            for (const edge of characterEdges) {
                // BACKGROUND（背景キャラ）はスキップ
                if (edge.role === 'BACKGROUND') continue

                const char = edge.node
                // 日本語名があればそれを使用、なければ英語名にフォールバック（韓中キャラ対応）
                const charName = (char.name.native && isJapanese(char.name.native))
                    ? char.name.native
                    : (char.name.full ?? null)
                if (!charName) continue

                // キャラクターの重複スキップ
                if (seenCharacterAnilistIds.has(char.id)) {
                    console.log(`    ⏭️  キャラ重複スキップ: ${charName}`)
                    continue
                }
                seenCharacterAnilistIds.add(char.id)

                const characterId = `CH${String(characterCounter).padStart(6, '0')}`
                characterCounter++

                const imageUrl = char.image?.large ?? null
                const birthday = formatBirthday(char.dateOfBirth)
                const bloodType = char.bloodType ?? null
                const voiceActor = edge.voiceActors?.[0]?.name?.native ?? null
                const height = parseHeight(char.description)

                // DeepLで日本語に翻訳
                let description = ''
                const cleaned = prepareDescription(char.description)
                if (cleaned && !isJapanese(cleaned)) {
                    description = await translateWithDeepl(cleaned, nameMap)
                    console.log(`      🌐 翻訳: ${charName}`)
                    await new Promise(r => setTimeout(r, 300))
                } else if (cleaned) {
                    description = cleaned
                }

                characterInserts.push(
                    `INSERT INTO characters (character_id, anime_id, name, description, age, gender, image_url, birthday, blood_type, voice_actor, height, anilist_id) VALUES (${esc(characterId)}, ${esc(animeId)}, ${esc(charName)}, ${esc(description)}, ${parseAge(char.age)}, ${esc(normalizeGender(char.gender))}, ${esc(imageUrl)}, ${esc(birthday)}, ${esc(bloodType)}, ${esc(voiceActor)}, ${height ?? 'NULL'}, ${char.id}) ON CONFLICT DO NOTHING;`
                )
            }

            await new Promise((r) => setTimeout(r, 800))
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

    // 未マッチ一覧をCSVに出力
    const unmatchedRows = [
        'type,name',
        ...[...unmatchedGenres].map(g => `genre,${g}`),
        ...[...unmatchedProductions].map(p => `production,${p}`),
    ]
    const unmatchedFile = `scripts/unmatched_${targetYear}.csv`
    fs.writeFileSync(unmatchedFile, unmatchedRows.join('\n'), 'utf8')
    console.log(`\n📋 未マッチ一覧: ${unmatchedFile}`)
    console.log(`  ジャンル未マッチ: ${unmatchedGenres.size}件`)
    console.log(`  制作会社未マッチ: ${unmatchedProductions.size}件`)
    if (unmatchedGenres.size > 0) console.log('  ジャンル:', [...unmatchedGenres].join(', '))
    if (unmatchedProductions.size > 0) console.log('  制作会社:', [...unmatchedProductions].join(', '))

    let finalSql = sql

    if (fs.existsSync(outputFile)) {
        const existingSql = fs.readFileSync(outputFile, 'utf8')

        finalSql =
            existingSql +
            '\n\n-- ==============================\n' +
            `-- 追加取得分 ${new Date().toISOString()}\n` +
            '-- ==============================\n\n' +
            sql
    }

    // カウンターを保存
    fs.writeFileSync(counterFile, JSON.stringify({
        animeCounter,
        characterCounter,
        genreId,
        updatedAt: new Date().toISOString(),
    }, null, 2), 'utf8')
    console.log(`\n💾 カウンターを保存しました: ${counterFile}`)

    fs.writeFileSync(outputFile, finalSql, 'utf8')

    console.log(`\n✅ ${outputFile} を更新しました！`)
}

main().catch(console.error)