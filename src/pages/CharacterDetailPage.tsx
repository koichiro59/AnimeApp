import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchCharacterById, fetchAnimeById } from '../lib/db'
import { getCharacterImageCache } from '../lib/imageCache'
import type { Character } from '../types/character'
import type { Anime } from '../types/anime'

const roleColors: Record<string, string> = {
  '主人公': 'bg-blue-100 text-blue-700',
  'ヒロイン': 'bg-pink-100 text-pink-700',
  '敵': 'bg-red-100 text-red-700',
  'サブキャラ': 'bg-gray-100 text-gray-700',
}

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">キャラクターが見つかりませんでした。</p>
      </div>
    )
  }

  const imageUrl = getCharacterImageCache()[character.anilist_id ?? 0] ?? ''

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {anime && (
        <Link to={`/anime/${anime.anime_id}`} className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
          ← {anime.title} に戻る
        </Link>
      )}
      <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
        {imageUrl ? (
          <img src={imageUrl} alt={character.name} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-64 bg-gray-200 animate-pulse" />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{character.name}</h1>
          {character.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{character.description}</p>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            {character.age && <p>年齢：{character.age}歳</p>}
            {character.gender && <p>性別：{character.gender}</p>}
            {character.height && <p>身長：{character.height}cm</p>}
            {character.weight && <p>体重：{character.weight}kg</p>}
          </div>
        </div>
      </div>
    </div>
  )
}