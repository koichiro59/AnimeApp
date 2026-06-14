import { useEffect, useState, useCallback } from 'react'
import { fetchCharacters } from '../lib/db'
import { fetchCharacterImages } from '../lib/anilistApi'
import { getCharacterImageCache, setCharacterImageCache } from '../lib/imageCache'
import type { Character } from '../types/character'
import { CharacterCard } from '../components/character/CharacterCard'
import { useDebounce } from '../hooks/useDebounce'

const PER_PAGE = 12

export const CharacterListPage = () => {
    const [characters, setCharacters] = useState<Character[]>([])
    const [imageMap, setImageMap] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [searchInput, setSearchInput] = useState('')

    const debouncedSearch = useDebounce(searchInput, 300)
    const totalPages = Math.ceil(total / PER_PAGE)

    const load = useCallback(async () => {
        setLoading(true)
        const { characters: data, total } = await fetchCharacters(page, PER_PAGE, debouncedSearch)
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
    }, [page, debouncedSearch])

    useEffect(() => {
        load()
    }, [load])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleClear = () => {
        setSearchInput('')
        setPage(1)
    }

    return (
        <div>
            <div className="bg-gray-50 border-b border-gray-100 py-10 px-6 text-center w-full">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">キャラクター一覧</h1>
                <p className="text-sm text-gray-400 mb-6">登場キャラクターの詳細情報をまとめて調べられる</p>

                <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                    <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="キャラクター名で検索..."
                            className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
                        />
                        {searchInput && (
                            <button onClick={handleClear} className="text-gray-300 hover:text-gray-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-700">
                        {debouncedSearch ? `「${debouncedSearch}」の検索結果` : 'キャラクター'}
                    </h2>
                    <p className="text-sm text-gray-400">{total}件</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-400">読み込み中...</p>
                    </div>
                ) : characters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <p className="text-gray-400">「{debouncedSearch}」に一致するキャラクターが見つかりませんでした</p>
                        <button onClick={handleClear} className="text-sm text-pink-500 hover:underline">
                            検索をクリア
                        </button>
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