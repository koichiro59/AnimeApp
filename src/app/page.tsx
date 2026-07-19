import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchAnimes, fetchCharactersPreview } from '@/lib/db'
import type { Anime } from '@/types/anime'
import type { Character } from '@/types/character'

export const metadata: Metadata = {
  title: 'アニレフ - キャラクターで選ぶアニメ情報サイト',
  description: 'キャラクターから気になるアニメを見つけよう。アニレフはキャラクター情報を中心としたアニメ情報サイトです。',
  alternates: { canonical: 'https://aniref.net/' },
}

export const revalidate = 3600

type AnimeWithChars = { anime: Anime; characters: Character[] }

const CharacterPortrait = ({ character }: { character: Character }) => (
  <Link href={`/character/${character.character_id}`} className="relative group overflow-hidden block" style={{ aspectRatio: '3/4' }}>
    {character.image_url ? (
      <img src={character.image_url} alt={character.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
    ) : (
      <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
    <div className="absolute inset-0 ring-2 ring-inset ring-white/0 group-hover:ring-pink-400/60 transition-all duration-300" />
    <div className="absolute bottom-0 left-0 right-0 p-2.5">
      <p className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow-sm">{character.name}</p>
    </div>
  </Link>
)

const AnimeShowcaseCard = ({ anime, characters }: AnimeWithChars) => {
  const slots: (Character | null)[] = [...characters.slice(0, 3)]
  while (slots.length < 3) slots.push(null)

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300">
      <div className="grid grid-cols-3">
        {slots.map((char, i) =>
          char ? (
            <CharacterPortrait key={char.character_id} character={char} />
          ) : (
            <div key={`empty-${i}`} className="bg-gray-100" style={{ aspectRatio: '3/4' }} />
          )
        )}
      </div>
      <div className="p-4">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {anime.genres?.slice(0, 2).map((g) => (
            <span key={g} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">{g}</span>
          ))}
          {anime.type && (
            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">{anime.type}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 flex-1">{anime.title}</h3>
          <Link href={`/anime/${anime.anime_id}`} className="flex-shrink-0 text-xs bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg transition-colors">
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

export default async function HomePage() {
  const { animes: allAnimes } = await fetchAnimes(1, 12)
  const charResults = await Promise.all(allAnimes.map((a) => fetchCharactersPreview(a.anime_id, 3)))
  const items: AnimeWithChars[] = allAnimes
    .map((anime, i) => ({ anime, characters: charResults[i] }))
    .filter(({ characters }) => characters.some((c) => c.image_url !== null))
    .slice(0, 6)

  return (
    <>
      <div className="bg-gradient-to-r from-pink-50 to-white border-b border-gray-100 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-snug">気になるキャラから、アニメを見つけよう</h1>
            <p className="text-xs text-gray-400 mt-1">登場キャラクターのビジュアルと詳細から、次に観るアニメが見つかるサイトです</p>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <Link href="/animes" className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap">アニメ一覧</Link>
            <Link href="/characters" className="bg-white border border-gray-200 hover:border-pink-200 text-gray-600 hover:text-pink-600 text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap">キャラ一覧</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">ピックアップ</h2>
            <p className="text-xs text-gray-400 mt-0.5">各作品の登場キャラクターをチェックしよう</p>
          </div>
          <Link href="/animes" className="text-xs text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-0.5">
            すべて見る
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map(({ anime, characters }) => (
            <AnimeShowcaseCard key={anime.anime_id} anime={anime} characters={characters} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/animes" className="inline-flex items-center gap-2 border border-gray-200 hover:border-pink-300 text-gray-500 hover:text-pink-600 text-sm px-6 py-3 rounded-full transition-all">
            すべてのアニメを見る
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  )
}
