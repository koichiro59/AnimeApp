import { supabase } from './supabase'
import type { Anime } from '../types/anime'
import type { Character } from '../types/character'

const roleRank = (role: Character['role']): number => {
    if (role === 'SUPPORTING') return 2
    if (role === 'BACKGROUND') return 3
    return 1  // MAIN および NULL (未設定=MAINの可能性が高い) を最優先
}

const sortCharacters = (characters: Character[]): Character[] =>
    [...characters].sort((a, b) => {
        const roleDiff = roleRank(a.role) - roleRank(b.role)
        if (roleDiff !== 0) return roleDiff
        const favDiff = (b.favourites ?? 0) - (a.favourites ?? 0)
        if (favDiff !== 0) return favDiff
        return a.character_id.localeCompare(b.character_id)
    })

// ジャンル一覧を取得
export const fetchGenres = async (): Promise<string[]> => {
    const { data, error } = await supabase.from('genres').select('name').order('name')
    if (error) throw error
    return (data ?? []).map((g: any) => g.name)
}

// アニメ一覧をページネーション付きで取得
export const fetchAnimes = async (
    page: number = 1,
    perPage: number = 12,
    searchQuery: string = '',
    genreFilters: string[] = [],
    yearFilter: string = '',
): Promise<{ animes: Anime[], total: number }> => {
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let filteredAnimeIds: string[] | null = null
    if (genreFilters.length > 0) {
        const { data: genreRows, error: gErr } = await supabase
            .from('genres')
            .select('genre_id')
            .in('name', genreFilters)
        if (gErr) throw gErr

        const genreIds = (genreRows ?? []).map((g: any) => g.genre_id)
        if (genreIds.length === 0) return { animes: [], total: 0 }

        const { data: agRows, error: agErr } = await supabase
            .from('anime_genres')
            .select('anime_id')
            .in('genre_id', genreIds)
        if (agErr) throw agErr

        filteredAnimeIds = [...new Set((agRows ?? []).map((ag: any) => ag.anime_id))]
        if (filteredAnimeIds.length === 0) return { animes: [], total: 0 }
    }

    let query = supabase
        .from('animes')
        .select('*, anime_genres(genres(name))', { count: 'exact' })
        .eq('is_hidden', false)
        .order('popularity', { ascending: false, nullsFirst: false })

    if (searchQuery) query = query.ilike('title', `%${searchQuery}%`)
    if (yearFilter) query = query.ilike('broadcast_season', `${yearFilter}%`)
    if (filteredAnimeIds !== null) query = query.in('anime_id', filteredAnimeIds)

    const { data, error, count } = await query.range(from, to)
    if (error) throw error

    const animes = (data ?? []).map((anime: any) => ({
        ...anime,
        genres: (anime.anime_genres ?? []).map((ag: any) => ag.genres?.name).filter(Boolean),
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

    if (error) throw error
    return sortCharacters(data).slice(0, limit)
}

// キャラクター一覧をアニメIDで取得
export const fetchCharactersByAnimeId = async (animeId: string): Promise<Character[]> => {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('anime_id', animeId)

    if (error) throw error
    return sortCharacters(data)
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

// キャラクタータグ一覧を取得
export const fetchCharacterTags = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('characters')
        .select('tags')
        .not('tags', 'is', null)
    if (error) throw error
    const all = (data ?? []).flatMap((c: any) => c.tags ?? [])
    return [...new Set(all)].sort()
}

// キャラクター一覧をページネーション付きで取得
// 各アニメの上位3キャラ優先 → アニメ人気順 → キャラお気に入り数順
// タグ指定時は直接クエリに切り替え（お気に入り数順）
export const fetchCharacters = async (
    page: number = 1,
    perPage: number = 12,
    searchQuery: string = '',
    tagFilter: string = '',
): Promise<{ characters: Character[], total: number }> => {
    const offset = (page - 1) * perPage

    if (tagFilter) {
        let query = supabase
            .from('characters')
            .select('*', { count: 'exact' })
            .contains('tags', [tagFilter])
        if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
        query = query
            .order('favourites', { ascending: false, nullsFirst: false })
            .range(offset, offset + perPage - 1)
        const { data, error, count } = await query
        if (error) throw error
        return { characters: (data ?? []) as Character[], total: count ?? 0 }
    }

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