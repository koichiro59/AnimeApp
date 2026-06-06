const ANILIST_URL = 'https://graphql.anilist.co'

// アニメ情報（画像付き）を取得
export const fetchAnimeList = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title { native }
          startDate { year }
          genres
          description(asHtml: false)
          coverImage { large }
          averageScore
        }
      }
    }
  `
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  return data.data.Page.media
}

// キャラクター情報（画像付き）をアニメIDで取得
export const fetchCharactersByAnimeId = async (animeId: number) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        characters(sort: ROLE, perPage: 10) {
          edges {
            role
            node {
              id
              name { native full }
              image { large }
              description(asHtml: false)
              age
            }
          }
        }
      }
    }
  `
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: animeId } }),
  })
  const data = await res.json()
  return data.data.Media.characters.edges
}


// キャラクター詳細をIDで取得
export const fetchCharacterDetail = async (id: number) => {
  const query = `
    query ($id: Int) {
      Character(id: $id) {
        id
        name { native full }
        image { large }
        description(asHtml: false)
        age
        media(perPage: 1) {
          nodes {
            id
            title { native }
          }
        }
      }
    }
  `
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
  })
  const data = await res.json()
  return data.data.Character
}