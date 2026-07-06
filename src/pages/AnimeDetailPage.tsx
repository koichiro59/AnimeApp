import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchAnimeById, fetchCharactersByAnimeId } from '../lib/db'
import { fetchAnimeImages, fetchCharacterImages } from '../lib/anilistApi'
import { getAnimeImageCache, setAnimeImageCache, getCharacterImageCache, setCharacterImageCache } from '../lib/imageCache'
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

      // アニメ画像がキャッシュにない場合は取得
      if (animeData?.anilist_id && !getAnimeImageCache()[animeData.anilist_id]) {
        const images = await fetchAnimeImages([animeData.anilist_id])
        setAnimeImageCache(images)
      }

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

  useEffect(() => {
    if (!anime) return
    const description = anime.synopsis
      ? `${anime.synopsis.slice(0, 100)}…`
      : `${anime.title}の登場キャラクターやあらすじ情報をチェック。`

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": anime.title,
      "description": description,
      "url": `https://aniref.net/anime/${id}`,
      ...(anime.broadcast_season && { "startDate": anime.broadcast_season }),
      ...(anime.episodes && { "numberOfEpisodes": anime.episodes }),
    })
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [anime, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">アニメが見つかりませんでした。</p>
      </div>
    )
  }

  const animeImageUrl = getAnimeImageCache()[anime.anilist_id ?? 0] ?? ''
  const description = anime.synopsis
    ? `${anime.synopsis.slice(0, 100)}…`
    : `${anime.title}の登場キャラクターやあらすじ情報をチェック。`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": anime.title,
    "description": description,
    "url": `https://aniref.net/anime/${id}`,
    ...(anime.broadcast_season && { "startDate": anime.broadcast_season }),
    ...(anime.episodes && { "numberOfEpisodes": anime.episodes }),
  }

  return (
    <>
      <Helmet>
        <title>{anime.title} | アニレフ</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${anime.title} | アニレフ`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://aniref.net/anime/${id}`} />
        {animeImageUrl && <meta property="og:image" content={animeImageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        {animeImageUrl && <meta name="twitter:image" content={animeImageUrl} />}
        <link rel="canonical" href={`https://aniref.net/anime/${id}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/animes" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          一覧に戻る
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-8">
          <div className="md:flex">
            <div className="md:w-64 flex-shrink-0">
              {animeImageUrl ? (
                <img src={animeImageUrl} alt={anime.title} className="w-full h-80 md:h-full object-cover" />
              ) : (
                <div className="w-full h-80 bg-gray-100 animate-pulse" />
              )}
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-xl font-semibold text-gray-800">{anime.title}</h1>
                {anime.type && (
                  <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full border border-pink-100 ml-3 flex-shrink-0">
                    {anime.type}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {anime.genres?.map((g) => (
                  <span key={g} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
                    {g}
                  </span>
                ))}
              </div>

              {anime.synopsis && (
                <p className="text-sm text-gray-600 leading-relaxed" style={{ marginBottom: '28px' }}>{anime.synopsis}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {anime.broadcast_season && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">放送時期</p>
                    <p className="text-sm font-medium text-gray-700">{anime.broadcast_season}</p>
                  </div>
                )}
                {anime.author && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">原作者</p>
                    <p className="text-sm font-medium text-gray-700">{anime.author}</p>
                  </div>
                )}
                {anime.episodes && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">話数</p>
                    <p className="text-sm font-medium text-gray-700">{anime.episodes}話</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {characters.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">登場キャラクター</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
    </>
  )
}