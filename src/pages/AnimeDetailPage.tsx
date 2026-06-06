import { useParams, Link } from 'react-router-dom'
import { sampleAnimes, sampleCharacters } from '../lib/sampleData'
import { CharacterCard } from '../components/character/CharacterCard'

export const AnimeDetailPage = () => {
    const { id } = useParams()
    const anime = sampleAnimes.find((a) => a.id === Number(id))
    const characters = sampleCharacters.filter((c) => c.animeId === Number(id))

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
                    src={anime.imageUrl}
                    alt={anime.title}
                    className="w-full h-64 object-cover"
                />
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{anime.title}</h1>
                    <p className="text-sm text-gray-500 mb-3">{anime.year}年</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                        {anime.genre.map((g) => (
                            <span
                                key={g}
                                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">{anime.synopsis}</p>
                    <p className="text-yellow-500 font-semibold">★ {anime.rating}</p>
                </div>
            </div>

            {characters.length > 0 && (
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">登場キャラクター</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {characters.map((character) => (
                            <CharacterCard key={character.id} character={character} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}