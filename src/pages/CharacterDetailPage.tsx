import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchCharacterById, fetchAnimeById } from '../lib/db'
import { getCharacterImageCache } from '../lib/imageCache'
import type { Character } from '../types/character'
import type { Anime } from '../types/anime'

export const CharacterDetailPage = () => {
  const { id } = useParams()
  const [character, setCharacter] = useState<Character | null>(null)
  const [anime, setAnime] = useState<Anime | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const charData = await fetchCharacterById(id!)
      setCharacter(charData)
      if (charData?.anime_id) {
        const animeData = await fetchAnimeById(charData.anime_id)
        setAnime(animeData)
      }
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!character) return
    const description = character.description
      ? `${character.description.slice(0, 100)}…`
      : `${character.name}のキャラクター情報。${anime ? `登場作品：${anime.title}。` : ''}アニレフで詳細をチェック。`

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": character.name,
      "description": description,
      "url": `https://aniref.net/character/${id}`,
      ...(anime && { "worksFor": { "@type": "TVSeries", "name": anime.title } }),
    })
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [character, anime, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400">キャラクターが見つかりませんでした。</p>
      </div>
    )
  }

  const imageUrl = getCharacterImageCache()[character.anilist_id ?? 0] ?? ''
  const description = character.description
    ? `${character.description.slice(0, 100)}…`
    : `${character.name}のキャラクター情報。${anime ? `登場作品：${anime.title}。` : ''}アニレフで詳細をチェック。`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": character.name,
    "description": description,
    "url": `https://aniref.net/character/${id}`,
    ...(anime && { "worksFor": { "@type": "TVSeries", "name": anime.title } }),
  }

  return (
    <>
      <Helmet>
        <title>{character.name} | アニレフ</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${character.name} | アニレフ`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://aniref.net/character/${id}`} />
        <link rel="canonical" href={`https://aniref.net/character/${id}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {anime && (
          <Link
            to={`/anime/${anime.anime_id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {anime.title} に戻る
          </Link>
        )}

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="sm:flex">
            <div className="sm:w-48 flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={character.name} className="w-full h-64 sm:h-full object-cover" />
              ) : (
                <div className="w-full h-64 bg-gray-100 animate-pulse" />
              )}
            </div>
            <div className="p-6 flex-1">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">{character.name}</h1>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {character.age && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">年齢</p>
                    <p className="text-sm font-medium text-gray-700">{character.age}歳</p>
                  </div>
                )}
                {character.gender && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">性別</p>
                    <p className="text-sm font-medium text-gray-700">{character.gender}</p>
                  </div>
                )}
                {character.height && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">身長</p>
                    <p className="text-sm font-medium text-gray-700">{character.height}cm</p>
                  </div>
                )}
                {character.weight && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">体重</p>
                    <p className="text-sm font-medium text-gray-700">{character.weight}kg</p>
                  </div>
                )}
              </div>

              {character.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{character.description}</p>
              )}
            </div>
          </div>

          {anime && (
            <div className="border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-400 mb-1">登場作品</p>
              <Link
                to={`/anime/${anime.anime_id}`}
                className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
              >
                {anime.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}