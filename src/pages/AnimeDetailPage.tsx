import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchAnimeById, fetchCharactersByAnimeId } from '../lib/db'
import { fetchCharacterImages } from '../lib/anilistApi'
import { getAnimeImageCache, getCharacterImageCache, setCharacterImageCache } from '../lib/imageCache'
import type { Anime } from '../types/anime'
import type { Character } from '../types/character'
import { CharacterCard } from '../components/character/CharacterCard'

export const AnimeDetailPage = () => {
  const { id } = useParams()
  const [anime, setAnime] = useState<Anime | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [charImageMap, setCharImageMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const animeData = await fetchAnimeById(id!)
      setAnime(animeData)

      const charData = await fetchCharactersByAnimeId(id!)
      setCharacters(charData)

      const cached = getCharacterImageCache()
      const uncachedIds = charData
        .map((c) => c.anilist_id)
        .filter((id): id is number => id !== null && !cached[id])

      if (uncachedIds.length > 0) {
        const images = await fetchCharacterImages(uncachedIds)
        setCharacterImageCache(images)
        setCharImageMap({ ...cached, ...images })
      } else {
        setCharImageMap({ ...cached })
      }

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">アニメが見つかりませんでした。</p>
      </div>
    )
  }

  const animeImageUrl = getAnimeImageCache()[anime.anilist_id ?? 0] ?? ''

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
        ← 一覧に戻る
      </Link>
      <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto mb-8">
        {animeImageUrl ? (
          <img src={animeImageUrl} alt={anime.title} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-64 bg-gray-200 animate-pulse" />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{anime.title}</h1>
          <p className="text-sm text-gray-500 mb-3">{anime.broadcast_season}</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {anime.genres?.map((g) => (
              <span key={g} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">{anime.synopsis}</p>
          <div className="text-sm text-gray-500 space-y-1">
            {anime.author && <p>原作：{anime.author}</p>}
            {anime.type && <p>種別：{anime.type}</p>}
            {anime.episodes && <p>話数：{anime.episodes}話</p>}
          </div>
        </div>
      </div>

      {characters.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">登場キャラクター</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {characters.map((character) => (
              <CharacterCard
                key={character.character_id}
                character={character}
                imageUrl={charImageMap[character.anilist_id ?? 0] ?? ''}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}