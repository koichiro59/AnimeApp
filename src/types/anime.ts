export type Anime = {
  anime_id: string
  title: string
  broadcast_season: string | null
  production_id: string | null
  type: string | null
  episodes: number | null
  author: string | null
  synopsis: string | null
  anilist_id: number | null
  image_url: string | null
  genres?: string[]
}
