const ANILIST_URL = 'https://graphql.anilist.co'

// 複数アニメの画像をまとめて1回で取得
export const fetchAnimeImages = async (anilistIds: number[]): Promise<Record<number, string>> => {
  const query = `
    query ($ids: [Int]) {
      Page(perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          id
          coverImage {
            extraLarge
            large
          }
        }
      }
    }
  `
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { ids: anilistIds } }),
  })
  const data = await res.json()
  const result: Record<number, string> = {}
  for (const media of data.data.Page.media) {
    result[media.id] = media.coverImage.extraLarge ?? media.coverImage.large
  }
  return result
}

// 複数キャラクターの画像をまとめて1回で取得
export const fetchCharacterImages = async (anilistIds: number[]): Promise<Record<number, string>> => {
  const queries = anilistIds.map((id, i) => `
    c${i}: Character(id: ${id}) {
      id
      image { large }
    }
  `).join('\n')

  const query = `query { ${queries} }`

  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  const result: Record<number, string> = {}
  for (const key of Object.keys(data.data)) {
    const character = data.data[key]
    result[character.id] = character.image.large
  }
  return result
}