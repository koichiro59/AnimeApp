import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchCharacterDetail } from '../lib/anilistApi'

const roleColors: Record<string, string> = {
    'MAIN': 'bg-blue-100 text-blue-700',
    'SUPPORTING': 'bg-gray-100 text-gray-700',
    'BACKGROUND': 'bg-yellow-100 text-yellow-700',
}

const roleLabels: Record<string, string> = {
    'MAIN': '主人公',
    'SUPPORTING': 'サブキャラ',
    'BACKGROUND': 'その他',
}

export const CharacterDetailPage = () => {
    const { id } = useParams()
    const [character, setCharacter] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCharacterDetail(Number(id)).then((data) => {
            setCharacter(data)
            setLoading(false)
        })
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

    const anime = character.media?.nodes?.[0]

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {anime && (
                <Link
                    to={`/anime/${anime.id}`}
                    className="text-indigo-600 hover:underline text-sm mb-6 inline-block"
                >
                    ← {anime.title.native} に戻る
                </Link>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
                <img
                    src={character.image.large}
                    alt={character.name.native}
                    className="w-full h-64 object-cover"
                />
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">{character.name.native}</h1>
                        {character.role && (
                            <span className={`text-sm px-3 py-0.5 rounded-full font-medium ${roleColors[character.role] ?? 'bg-gray-100 text-gray-700'}`}>
                                {roleLabels[character.role] ?? character.role}
                            </span>
                        )}
                    </div>

                    {character.age && (
                        <p className="text-sm text-gray-500 mb-4">年齢：{character.age}歳</p>
                    )}

                    {character.description && (
                        <p className="text-gray-600 leading-relaxed mb-6">{character.description}</p>
                    )}
                </div>
            </div>
        </div>
    )
}