import { supabase } from './supabase'
import type { Anime } from '../types/anime'
import type { Character } from '../types/character'

// アニメ一覧をページネーション付きで取得
export const fetchAnimes = async (page: number = 1, perPage: number = 12, searchQuery: string = ''): Promise<{ animes: Anime[], total: number }> => {
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = supabase
        .from('animes')
        .select(`
      *,
      anime_genres (
        genres ( name )
      )
    `, { count: 'exact' })

    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
    }

    query = query
        .eq('is_hidden', false)
        .order('popularity', { ascending: false, nullsFirst: false })

    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    const animes = data.map((anime: any) => ({
        ...anime,
        genres: anime.anime_genres.map((ag: any) => ag.genres.name),
    }))

    return { animes, total: count ?? 0 }
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

// キャラクタープレビュー（上限付き）をアニメIDで取得
export const fetchCharactersPreview = async (animeId: string, limit: number = 3): Promise<Character[]> => {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('anime_id', animeId)
        .order('favourites', { ascending: false, nullsFirst: false })
        .order('anime_rank', { ascending: true, nullsFirst: false })
        .limit(limit)

    if (error) throw error
    return data
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

// キャラクター一覧をページネーション付きで取得
// 各アニメの上位3キャラ優先 → アニメ人気順 → キャラお気に入り数順
export const fetchCharacters = async (page: number = 1, perPage: number = 12, searchQuery: string = ''): Promise<{ characters: Character[], total: number }> => {
    const offset = (page - 1) * perPage

    const [{ data, error: rpcError }, { count, error: countError }] = await Promise.all([
        supabase.rpc('get_characters_list', {
            p_offset: offset,
            p_limit: perPage,
            p_search: searchQuery || null,
        }),
        supabase
            .from('characters')
            .select('*', { count: 'exact', head: true })
            .ilike('name', searchQuery ? `%${searchQuery}%` : '%'),
    ])

    if (rpcError) throw rpcError
    if (countError) throw countError
    return { characters: (data ?? []) as Character[], total: count ?? 0 }
}