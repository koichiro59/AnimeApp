import { useEffect, useState } from 'react'
import { fetchAnimes } from '../lib/db'
import { fetchAnimeImages } from '../lib/anilistApi'
import { setAnimeImageCache, getAnimeImageCache } from '../lib/imageCache'
import type { Anime } from '../types/anime'
import { AnimeCard } from '../components/anime/AnimeCard'

const genreTags = [
  { label: 'アクション', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: 'ファンタジー', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'コメディ', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { label: '和風', color: 'bg-amber-50 text-amber-700 border-amber-200' },
]

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

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100 py-10 px-6 text-center w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          アニメ・キャラクター情報サイト
        </h1>
        <p className="text-sm text-gray-400 mb-5">
          作品情報からキャラクター詳細まで、まとめて調べられる
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {genreTags.map((tag) => (
            <span
              key={tag.label}
              className={`text-xs px-3 py-1 rounded-full border ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400">読み込み中...</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-5">アニメ一覧</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {animes.map((anime) => (
                <AnimeCard
                  key={anime.anime_id}
                  anime={anime}
                  imageUrl={imageMap[anime.anilist_id ?? 0] ?? ''}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}