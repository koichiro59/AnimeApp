import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchAnimes, fetchCharactersPreview } from '../lib/db'
import { fetchAnimeImages, fetchCharacterImages } from '../lib/anilistApi'
import {
  getAnimeImageCache,
  setAnimeImageCache,
  getCharacterImageCache,
  setCharacterImageCache,
} from '../lib/imageCache'
import type { Anime } from '../types/anime'
import type { Character } from '../types/character'

type AnimeWithChars = {
  anime: Anime
  characters: Character[]
}

const CharacterPortrait = ({ character, imageUrl }: { character: Character; imageUrl: string }) => (
  <Link
    to={`/character/${character.character_id}`}
    className="relative group overflow-hidden block"
    style={{ aspectRatio: '3/4' }}
  >
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={character.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 animate-pulse" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
    <div className="absolute inset-0 ring-2 ring-inset ring-white/0 group-hover:ring-pink-400/60 transition-all duration-300" />
    <div className="absolute bottom-0 left-0 right-0 p-2.5">
      <p className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow-sm">
        {character.name}
      </p>
    </div>
  </Link>
)

const AnimeShowcaseCard = ({
  anime,
  characters,
  charImageMap,
}: {
  anime: Anime
  characters: Character[]
  charImageMap: Record<number, string>
}) => {
  const slots: (Character | null)[] = [...characters.slice(0, 3)]
  while (slots.length < 3) slots.push(null)

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300">
      <div className="grid grid-cols-3">
        {slots.map((char, i) =>
          char ? (
            <CharacterPortrait
              key={char.character_id}
              character={char}
              imageUrl={charImageMap[char.anilist_id ?? 0] ?? ''}
            />
          ) : (
            <div
              key={`empty-${i}`}
              className="bg-gray-100"
              style={{ aspectRatio: '3/4' }}
            />
          )
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {anime.genres?.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100"
            >
              {g}
            </span>
          ))}
          {anime.type && (
            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">
              {anime.type}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 flex-1">{anime.title}</h3>
          <Link
            to={`/anime/${anime.anime_id}`}
            className="flex-shrink-0 text-xs bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            詳細を見る
          </Link>
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          {anime.broadcast_season && <span>{anime.broadcast_season}</span>}
          {anime.episodes && <span>全{anime.episodes}話</span>}
        </div>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-3">
          {[1, 2, 3].map((j) => (
            <div key={j} className="bg-gray-100 animate-pulse" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
        <div className="p-4 space-y-2">
          <div className="h-3 bg-gray-100 rounded-full w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

export const HomePage = () => {
  const [items, setItems] = useState<AnimeWithChars[]>([])
  const [charImageMap, setCharImageMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { animes: allAnimes } = await fetchAnimes(1, 12)

      const charResults = await Promise.all(
        allAnimes.map((a) => fetchCharactersPreview(a.anime_id, 3))
      )

      const paired = allAnimes
        .map((anime, i) => ({ anime, characters: charResults[i] }))
        .filter(({ characters }) => characters.some((c) => c.anilist_id !== null))
        .slice(0, 6)

      const animes = paired.map(({ anime }) => anime)
      setItems(paired)

      const animeCache = getAnimeImageCache()
      const uncachedAnimeIds = animes
        .map((a) => a.anilist_id)
        .filter((id): id is number => id !== null && !(id in animeCache))
      if (uncachedAnimeIds.length > 0) {
        const imgs = await fetchAnimeImages(uncachedAnimeIds)
        setAnimeImageCache(imgs)
      }

      const charCache = getCharacterImageCache()
      const allChars = charResults.flat()
      const uncachedCharIds = allChars
        .map((c) => c.anilist_id)
        .filter((id): id is number => id !== null && !(id in charCache))

      let newCharImages: Record<number, string> = {}
      if (uncachedCharIds.length > 0) {
        newCharImages = await fetchCharacterImages(uncachedCharIds)
        setCharacterImageCache(newCharImages)
      }
      setCharImageMap({ ...charCache, ...newCharImages })

      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Helmet>
        <title>アニレフ - キャラクターで選ぶアニメ情報サイト</title>
        <meta
          name="description"
          content="キャラクターから気になるアニメを見つけよう。アニレフはキャラクター情報を中心としたアニメ情報サイトです。"
        />
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-50 to-white border-b border-gray-100 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-800 leading-snug">
              気になるキャラから、アニメを見つけよう
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              登場キャラクターのビジュアルと詳細から、次に観るアニメが見つかるサイトです
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/animes"
              className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap"
            >
              アニメ一覧
            </Link>
            <Link
              to="/characters"
              className="bg-white border border-gray-200 hover:border-pink-200 text-gray-600 hover:text-pink-600 text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap"
            >
              キャラ一覧
            </Link>
          </div>
        </div>
      </div>

      {/* Pickup section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">ピックアップ</h2>
            <p className="text-xs text-gray-400 mt-0.5">各作品の登場キャラクターをチェックしよう</p>
          </div>
          <Link
            to="/animes"
            className="text-xs text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-0.5"
          >
            すべて見る
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {items.map(({ anime, characters }) => (
              <AnimeShowcaseCard
                key={anime.anime_id}
                anime={anime}
                characters={characters}
                charImageMap={charImageMap}
              />
            ))}
          </div>
        )}

        {!loading && (
          <div className="text-center mt-12">
            <Link
              to="/animes"
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-pink-300 text-gray-500 hover:text-pink-600 text-sm px-6 py-3 rounded-full transition-all"
            >
              すべてのアニメを見る
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
