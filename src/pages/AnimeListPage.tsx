import { useEffect, useState } from 'react'
import { fetchAnimes } from '../lib/db'
import { fetchAnimeImages } from '../lib/anilistApi'
import { setAnimeImageCache, getAnimeImageCache } from '../lib/imageCache'
import type { Anime } from '../types/anime'
import { AnimeCard } from '../components/anime/AnimeCard'

const PER_PAGE = 12

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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / PER_PAGE)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { animes: data, total } = await fetchAnimes(page, PER_PAGE)
      setAnimes(data)
      setTotal(total)

      const cached = getAnimeImageCache()
      const uncachedIds = data
        .map((a) => a.anilist_id)
        .filter((id): id is number => id !== null && !cached[id])

      if (uncachedIds.length > 0) {
        const images = await fetchAnimeImages(uncachedIds)
        setAnimeImageCache({ ...cached, ...images })
        setImageMap({ ...cached, ...images })
      } else {
        setImageMap({ ...cached })
      }
      setLoading(false)
    }
    load()
  }, [page])

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
            <span key={tag.label} className={`text-xs px-3 py-1 rounded-full border ${tag.color}`}>
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-700">アニメ一覧</h2>
          <p className="text-sm text-gray-400">{total}件</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400">読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {animes.map((anime) => (
                <AnimeCard
                  key={anime.anime_id}
                  anime={anime}
                  imageUrl={imageMap[anime.anilist_id ?? 0] ?? ''}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  前へ
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-9 h-9 text-sm rounded-lg border transition-colors ${page === p
                            ? 'bg-pink-50 border-pink-200 text-pink-600 font-medium'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}