import { useEffect, useState } from 'react'
import { fetchAnimes } from '../lib/db'
import { fetchAnimeImages } from '../lib/anilistApi'
import { setAnimeImageCache, getAnimeImageCache } from '../lib/imageCache'
import type { Anime } from '../types/anime'
import { AnimeCard } from '../components/anime/AnimeCard'

export const AnimeListPage = () => {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [imageMap, setImageMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await fetchAnimes()
      setAnimes(data)

      const cached = getAnimeImageCache()
      if (Object.keys(cached).length > 0) {
        setImageMap(cached)
      } else {
        const ids = data.map((a) => a.anilist_id).filter(Boolean) as number[]
        const images = await fetchAnimeImages(ids)
        setAnimeImageCache(images)
        setImageMap(images)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">アニメ一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animes.map((anime) => (
          <AnimeCard
            key={anime.anime_id}
            anime={anime}
            imageUrl={imageMap[anime.anilist_id ?? 0] ?? ''}
          />
        ))}
      </div>
    </div>
  )
}