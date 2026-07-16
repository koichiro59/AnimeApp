import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { fetchCharacters, fetchCharacterTags } from '../lib/db'
import { fetchCharacterImages } from '../lib/anilistApi'
import { getCharacterImageCache, setCharacterImageCache } from '../lib/imageCache'
import type { Character } from '../types/character'
import { CharacterCard } from '../components/character/CharacterCard'
import { useDebounce } from '../hooks/useDebounce'

const PER_PAGE = 24

const TAG_CATEGORIES: { label: string; tags: string[] }[] = [
    { label: '髪色', tags: ['金髪', '銀髪', '黒髪', '茶髪', '赤髪', 'ピンク髪', '青髪', '緑髪', '紫髪', 'ツートーン', '白髪'] },
    { label: '髪型', tags: ['ツインテール', 'ポニーテール', 'ロングヘア', 'ショートヘア', 'ボブカット', 'ツーサイドアップ'] },
    { label: '顔・目', tags: ['メガネ', '眼帯', 'オッドアイ', '赤目', '金目', 'ジト目', 'タレ目', 'つり目', '八重歯'] },
    { label: '動物・異形', tags: ['猫耳', 'うさ耳', 'きつね耳', '犬耳', '狼耳', 'しっぽ', '翼', '角', '包帯'] },
    { label: '体型', tags: ['長身', '小柄', '巨乳', '貧乳', '褐色肌', '白肌', '筋肉質', '細身', 'グラマー'] },
    { label: '年齢層', tags: ['幼女', 'ロリ', 'ショタ', 'JK・高校生', 'お姉さん', 'おじさん', '老人'] },
    { label: '服装', tags: ['制服', 'メイド服', '巫女服', '水着', 'ゴスロリ', '和服・着物', '軍服', 'ドレス', 'ミニスカ'] },
    { label: '性格', tags: ['ツンデレ', 'ヤンデレ', 'クーデレ', 'ダンデレ', 'デレデレ', 'ハジデレ', '小悪魔', '天然', '元気', 'おっとり', 'クール', '真面目', 'ドジ', 'S属性', 'M属性', '無口', 'お嬢様', 'ボーイッシュ', '中二病', 'ナルシスト', 'マイペース'] },
    { label: '役割', tags: ['主人公', 'ヒロイン', 'ライバル', '悪役', '幼馴染', '妹弟', '兄姉', '先輩', '委員長', '生徒会長', '転校生', '双子'] },
    { label: '職業・身分', tags: ['小学生', '中学生', '高校生', '大学生', '社会人', '教師', '医者', '看護師', 'アイドル', '騎士', '勇者', '王族', '姫', '執事', '巫女', 'シスター', '忍者', '探偵', '武道家', '父親', '母親'] },
    { label: '能力', tags: ['魔法使い', '剣士', '格闘家', '銃使い', '超能力', '天才', '異世界転生', 'ロボット', 'AI', '吸血鬼', 'エルフ', '人外', '妖怪', '魔王'] },
    { label: '特殊設定', tags: ['二重人格', '記憶喪失', '不死', '不老', 'ボクっ子', '不運'] },
]

export const CharacterListPage = () => {
    const [characters, setCharacters] = useState<Character[]>([])
    const [imageMap, setImageMap] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [searchInput, setSearchInput] = useState('')
    const [dbTags, setDbTags] = useState<Set<string>>(new Set())
    const [selectedTag, setSelectedTag] = useState('')

    const debouncedSearch = useDebounce(searchInput, 300)
    const totalPages = Math.ceil(total / PER_PAGE)
    const hasActiveFilters = selectedTag !== ''

    useEffect(() => {
        fetchCharacterTags()
            .then(tags => setDbTags(new Set(tags)))
            .catch(console.error)
    }, [])

    const load = useCallback(async () => {
        setLoading(true)
        const { characters: data, total } = await fetchCharacters(page, PER_PAGE, debouncedSearch, selectedTag)
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
    }, [page, debouncedSearch, selectedTag])

    useEffect(() => {
        load()
    }, [load])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, selectedTag])

    const handleClearAll = () => {
        setSearchInput('')
        setSelectedTag('')
        setPage(1)
    }

    const selectClass = (active: boolean) =>
        `text-sm border rounded-full px-4 py-1.5 outline-none cursor-pointer transition-colors appearance-none pr-8 bg-no-repeat bg-[right_0.6rem_center] ${
            active
                ? 'border-pink-300 text-pink-600 bg-pink-50 font-medium'
                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
        }`

    return (
        <div>
            <Helmet>
                <title>キャラクター一覧 | アニレフ</title>
                <meta name="description" content="アニレフのキャラクター一覧ページ。アニメに登場するキャラクターのビジュアルや詳細情報を調べられます。" />
                <link rel="canonical" href="https://aniref.net/characters" />
            </Helmet>
            <div className="bg-gradient-to-r from-pink-50 to-white border-b border-gray-100 py-5 px-6">
                <div className="max-w-6xl mx-auto flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <h1 className="text-lg font-bold text-gray-800">キャラクター一覧</h1>
                    </div>
                    <div className="flex items-center ml-auto w-72 bg-white border border-gray-200 rounded-full px-4 py-2 gap-2">
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
                            <button onClick={() => setSearchInput('')} className="text-gray-300 hover:text-gray-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-5 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {TAG_CATEGORIES.map(cat => {
                            const catTags = cat.tags.filter(t => dbTags.has(t))
                            if (catTags.length === 0) return null
                            const value = catTags.includes(selectedTag) ? selectedTag : ''
                            return (
                                <div className="relative" key={cat.label}>
                                    <select
                                        value={value}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className={selectClass(value !== '')}
                                    >
                                        <option value="">{cat.label}</option>
                                        {catTags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        {(hasActiveFilters || searchInput) && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                クリア
                            </button>
                        )}
                        <p className="text-sm text-gray-400">{total}件</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-400">読み込み中...</p>
                    </div>
                ) : characters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <p className="text-gray-400">
                            {debouncedSearch
                                ? `「${debouncedSearch}」に一致するキャラクターが見つかりませんでした`
                                : '条件に一致するキャラクターが見つかりませんでした'}
                        </p>
                        <button onClick={handleClearAll} className="text-sm text-pink-500 hover:underline">
                            条件をクリア
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
                                                className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                                                    page === p
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
