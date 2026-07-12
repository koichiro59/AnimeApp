import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchCharacterById, fetchAnimeById } from '../lib/db'
import { fetchCharacterImages } from '../lib/anilistApi'
import { getCharacterImageCache, setCharacterImageCache } from '../lib/imageCache'
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

      // キャラ画像がキャッシュにない場合は取得
      if (charData?.anilist_id && !getCharacterImageCache()[charData.anilist_id]) {
        const images = await fetchCharacterImages([charData.anilist_id])
        setCharacterImageCache(images)
      }

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
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        <link rel="canonical" href={`https://aniref.net/character/${id}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {anime && (
          <Link
            to={`/anime/${anime.anime_id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {anime.title} に戻る
          </Link>
        )}

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

          {/* 上段：2カラム（画像 ＋ 名前・タグ・基本情報） */}
          <div className="flex">

            {/* 画像：左カラム */}
            <div className="w-36 sm:w-52 flex-shrink-0 self-start bg-gray-50">
              {imageUrl ? (
                <img src={imageUrl} alt={character.name} className="w-full h-auto block" />
              ) : (
                <div className="w-full h-64 bg-gray-100" />
              )}
            </div>

            {/* 右カラム：名前・基本情報 */}
            <div className="flex-1 min-w-0 flex flex-col divide-y divide-gray-100">

              {/* キャラ名 */}
              <div className="px-4 pt-4 pb-3">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">{character.name}</h1>
                {anime && (
                  <p className="text-xs text-gray-400 mt-0.5">{anime.title}</p>
                )}
              </div>

              {/* 基本情報 */}
              <div className="px-4 py-3 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400 mb-0.5">年齢</p>
                  <p className="text-xs font-medium text-gray-700">{character.age ? `${character.age}歳` : '－'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400 mb-0.5">性別</p>
                  <p className="text-xs font-medium text-gray-700">{character.gender ?? '－'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400 mb-0.5">誕生日</p>
                  <p className="text-xs font-medium text-gray-700">{character.birthday ?? '－'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400 mb-0.5">身長</p>
                  <p className="text-xs font-medium text-gray-700">{character.height ? `${character.height}cm` : '－'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">声優</p>
                  <p className="text-xs font-medium text-gray-700">{character.voice_actor ?? '－'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 属性タグ：フル幅・ソリッドバッジ */}
          {character.tags && character.tags.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {character.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-pink-500 text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 説明 */}
          {character.description && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{character.description}</p>
            </div>
          )}

          {anime && (
            <div className="px-5 py-3 border-t border-gray-100">
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