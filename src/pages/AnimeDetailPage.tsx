import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchAnimeList, fetchCharactersByAnimeId } from '../lib/anilistApi'
import type { Anime } from '../types/anime'
import type { Character } from '../types/character'
import { CharacterCard } from '../components/character/CharacterCard'

export const AnimeDetailPage = () => {
    const { id } = useParams()
    const [anime, setAnime] = useState<Anime | null>(null)
    const [characters, setCharacters] = useState<Character[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const animes = await fetchAnimeList()
            const found = animes.find((a: Anime) => a.id === Number(id))
            setAnime(found ?? null)
            if (found) {
                const chars = await fetchCharactersByAnimeId(found.id)
                setCharacters(chars)
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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Link to="/" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
                ← 一覧に戻る
            </Link>
            <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto mb-8">
                <img
                    src={anime.coverImage.large}
                    alt={anime.title.native}
                    className="w-full h-64 object-cover"
                />
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{anime.title.native}</h1>
                    <p className="text-sm text-gray-500 mb-3">{anime.startDate.year}年</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                        {anime.genres.map((g) => (
                            <span
                                key={g}
                                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">{anime.description}</p>
                    <p className="text-yellow-500 font-semibold">★ {anime.averageScore / 10}</p>
                </div>
            </div>

            {characters.length > 0 && (
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">登場キャラクター</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {characters.map((character) => (
                            <CharacterCard key={character.node.id} character={character} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}