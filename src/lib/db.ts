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

// canonical選定・noindex判定で参照する最小フィールド
type CanonRow = {
  character_id: string
  favourites: number | null
  description: string | null
  voice_actor: string | null
  age: number | null
  height: number | null
  birthday: string | null
  tags: string[] | null
}
const CANON_COLS = 'character_id, anilist_id, favourites, description, voice_actor, age, height, birthday, tags'

// ページ側 hasRichData と同条件（インデックス対象=情報量のあるページ）
const rowIsRich = (c: CanonRow): boolean =>
  !!c.description || !!c.voice_actor || c.age != null || c.height != null || !!c.birthday || (c.tags?.length ?? 0) >= 1

// 重複キャラ群から正規ページを決める。インデックス対象(rich)を最優先し、
// その中で人気(favourites)降順→id昇順。canonicalがnoindexページを指す矛盾を防ぐ。
const pickCanonical = (rows: CanonRow[]): string =>
  [...rows].sort((a, b) => {
    const r = Number(rowIsRich(b)) - Number(rowIsRich(a))
    if (r !== 0) return r
    const f = (b.favourites ?? 0) - (a.favourites ?? 0)
    if (f !== 0) return f
    return a.character_id.localeCompare(b.character_id)
  })[0].character_id

// 同じ anilist_id を持つ重複キャラ（作品違いの同一キャラ）の正規ページを返す。
export const fetchCanonicalCharacterId = async (anilistId: number): Promise<string | null> => {
  const { data, error } = await supabase.from('characters').select(CANON_COLS).eq('anilist_id', anilistId)
  if (error || !data || data.length === 0) return null
  return pickCanonical(data as CanonRow[])
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

// サイトマップに載せるキャラID。ページ側の noindex 判定・canonical と完全に揃える:
//  - 情報量のある(rich)キャラのみ（image_url は全件埋まりで指標にならない）
//  - 重複キャラ(同anilist_id)は正規ページ1件に集約
export const fetchIndexableCharacterIds = async (): Promise<string[]> => {
  const rows: (CanonRow & { anilist_id: number | null })[] = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase.from('characters').select(CANON_COLS).range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...((data ?? []) as (CanonRow & { anilist_id: number | null })[]))
    if ((data ?? []).length < PAGE) break
    from += PAGE
  }

  // anilist_id ごとにグループ化し、rich な行が1つでもあれば正規ページを採用
  const groups = new Map<number, (CanonRow & { anilist_id: number | null })[]>()
  for (const r of rows) {
    if (r.anilist_id == null) continue
    const g = groups.get(r.anilist_id)
    if (g) g.push(r)
    else groups.set(r.anilist_id, [r])
  }

  const ids: string[] = []
  for (const g of groups.values()) {
    if (g.some(rowIsRich)) ids.push(pickCanonical(g))
  }
  return ids
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
