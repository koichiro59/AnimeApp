import { useEffect, useState } from 'react'
import { fetchCharacters } from '../lib/db'
import { fetchCharacterImages } from '../lib/anilistApi'
import { getCharacterImageCache, setCharacterImageCache } from '../lib/imageCache'
import type { Character } from '../types/character'
import { CharacterCard } from '../components/character/CharacterCard'

const PER_PAGE = 12

export const CharacterListPage = () => {
    const [characters, setCharacters] = useState<Character[]>([])
    const [imageMap, setImageMap] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)

    const totalPages = Math.ceil(total / PER_PAGE)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const { characters: data, total } = await fetchCharacters(page, PER_PAGE)
            setCharacters(data)
            setTotal(total)

            const cached = getCharacterImageCache()
            const uncachedIds = data
                .map((c) => c.anilist_id)
                .filter((id): id is number => id !== null && !cached[id])

            if (uncachedIds.length > 0) {
                const images = await fetchCharacterImages(uncachedIds)
                setCharacterImageCache({ ...cached, ...images })
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
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">キャラクター一覧</h1>
                <p className="text-sm text-gray-400">登場キャラクターの詳細情報をまとめて調べられる</p>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-700">キャラクター</h2>
                    <p className="text-sm text-gray-400">{total}件</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-400">読み込み中...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {characters.map((character) => (
                                <CharacterCard
                                    key={character.character_id}
                                    character={character}
                                    imageUrl={imageMap[character.anilist_id ?? 0] ?? ''}
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