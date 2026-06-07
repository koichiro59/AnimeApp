import { supabase } from './supabase'
import type { Anime } from '../types/anime'
import type { Character } from '../types/character'

// アニメ一覧をジャンル付きで取得
export const fetchAnimes = async (): Promise<Anime[]> => {
    const { data, error } = await supabase
        .from('animes')
        .select(`
      *,
      anime_genres (
        genres ( name )
      )
    `)

    if (error) throw error

    return data.map((anime: any) => ({
        ...anime,
        genres: anime.anime_genres.map((ag: any) => ag.genres.name),
    }))
}

// アニメ詳細を1件取得
export const fetchAnimeById = async (animeId: string): Promise<Anime | null> => {
    const { data, error } = await supabase
        .from('animes')
        .select(`
      *,
      anime_genres (
        genres ( name )
      )
    `)
        .eq('anime_id', animeId)
        .single()

    if (error) throw error

    return {
        ...data,
        genres: data.anime_genres.map((ag: any) => ag.genres.name),
    }
}

// キャラクター一覧をアニメIDで取得
export const fetchCharactersByAnimeId = async (animeId: string): Promise<Character[]> => {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('anime_id', animeId)

    if (error) throw error
    return data
}

// キャラクター詳細を1件取得
export const fetchCharacterById = async (characterId: string): Promise<Character | null> => {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('character_id', characterId)
        .single()

    if (error) throw error
    return data
}