export type Character = {
  character_id: string
  anime_id: string
  name: string
  description: string | null
  age: number | null
  gender: string | null
  height: number | null
  weight: number | null
  anilist_id: number | null
  image_url: string | null
  birthday: string | null
  blood_type: string | null
  voice_actor: string | null
  tags: string[] | null
  popularity: number | null
  favourites: number | null
  anime_rank: number | null
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND' | null
}
