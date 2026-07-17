import { supabase } from './supabase'
import type { Anime } from '@/types/anime'
import type { Character } from '@/types/character'

const roleRank = (role: Character['role']): number => {
  if (role === 'SUPPORTING') return 2
  if (role === 'BACKGROUND') return 3
  return 1
}

const sortCharacters = (characters: Character[]): Character[] =>
  [...characters].sort((a, b) => {
    const roleDiff = roleRank(a.role) - roleRank(b.role)
    if (roleDiff !== 0) return roleDiff
    const favDiff = (b.favourites ?? 0) - (a.favourites ?? 0)
    if (favDiff !== 0) return favDiff
    return a.character_id.localeCompare(b.character_id)
  })

export const fetchGenres = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('genres').select('name').order('name')
  if (error) throw error
  return (data ?? []).map((g: { name: string }) => g.name)
}

export const fetchAnimes = async (
  page: number = 1,
  perPage: number = 20,
  searchQuery: string = '',
  genreFilters: string[] = [],
  yearFilter: string = '',
): Promise<{ animes: Anime[]; total: number }> => {
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let filteredAnimeIds: string[] | null = null
  if (genreFilters.length > 0) {
    const { data: genreRows, error: gErr } = await supabase
      .from('genres').select('genre_id').in('name', genreFilters)
    if (gErr) throw gErr
    const genreIds = (genreRows ?? []).map((g: { genre_id: number }) => g.genre_id)
    if (genreIds.length === 0) return { animes: [], total: 0 }

    const { data: agRows, error: agErr } = await supabase
      .from('anime_genres').select('anime_id').in('genre_id', genreIds)
    if (agErr) throw agErr
    filteredAnimeIds = [...new Set((agRows ?? []).map((ag: { anime_id: string }) => ag.anime_id))]
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

  const animes = (data ?? []).map((anime: Record<string, unknown>) => ({
    ...anime,
    genres: ((anime.anime_genres as { genres?: { name: string } }[]) ?? [])
      .map((ag) => ag.genres?.name)
      .filter(Boolean),
  }))

  return { animes: animes as Anime[], total: count ?? 0 }
}

export const fetchAnimeById = async (animeId: string): Promise<Anime | null> => {
  const { data, error } = await supabase
    .from('animes')
    .select('*, anime_genres(genres(name))')
    .eq('anime_id', animeId)
    .single()
  if (error) return null

  return {
    ...data,
    genres: data.anime_genres.map((ag: { genres: { name: string } }) => ag.genres.name),
  } as Anime
}

export const fetchAllAnimeIds = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('animes').select('anime_id').eq('is_hidden', false)
  if (error) throw error
  return (data ?? []).map((a: { anime_id: string }) => a.anime_id)
}

export const fetchCharactersPreview = async (animeId: string, limit: number = 3): Promise<Character[]> => {
  const { data, error } = await supabase
    .from('characters').select('*').eq('anime_id', animeId)
  if (error) throw error
  return sortCharacters(data as Character[]).slice(0, limit)
}

export const fetchCharactersByAnimeId = async (animeId: string): Promise<Character[]> => {
  const { data, error } = await supabase
    .from('characters').select('*').eq('anime_id', animeId)
  if (error) throw error
  return sortCharacters(data as Character[])
}

export const fetchCharacterById = async (characterId: string): Promise<Character | null> => {
  const { data, error } = await supabase
    .from('characters').select('*').eq('character_id', characterId).single()
  if (error) return null
  return data as Character
}

export const fetchAllCharacterIds = async (): Promise<string[]> => {
  const results: string[] = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('characters').select('character_id').range(from, from + PAGE - 1)
    if (error) throw error
    results.push(...(data ?? []).map((c: { character_id: string }) => c.character_id))
    if ((data ?? []).length < PAGE) break
    from += PAGE
  }
  return results
}

export const fetchCharacterTags = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('characters').select('tags').not('tags', 'is', null)
  if (error) throw error
  const all = (data ?? []).flatMap((c: { tags: string[] }) => c.tags ?? [])
  return [...new Set(all)].sort()
}

export const fetchCharacters = async (
  page: number = 1,
  perPage: number = 24,
  searchQuery: string = '',
  tagFilter: string = '',
): Promise<{ characters: Character[]; total: number }> => {
  const offset = (page - 1) * perPage

  if (tagFilter) {
    let query = supabase
      .from('characters').select('*', { count: 'exact' }).contains('tags', [tagFilter])
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
    query = query.order('favourites', { ascending: false, nullsFirst: false }).range(offset, offset + perPage - 1)
    const { data, error, count } = await query
    if (error) throw error
    return { characters: (data ?? []) as Character[], total: count ?? 0 }
  }

  const [{ data, error: rpcError }, { count, error: countError }] = await Promise.all([
    supabase.rpc('get_characters_list', {
      p_offset: offset, p_limit: perPage, p_search: searchQuery || null,
    }),
    supabase.from('characters').select('*', { count: 'exact', head: true })
      .ilike('name', searchQuery ? `%${searchQuery}%` : '%'),
  ])

  if (rpcError) throw rpcError
  if (countError) throw countError
  return { characters: (data ?? []) as Character[], total: count ?? 0 }
}
