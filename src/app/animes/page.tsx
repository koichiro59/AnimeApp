'use client'
import { useEffect, useState, useCallback } from 'react'
import { fetchAnimes, fetchGenres } from '@/lib/db'
import type { Anime } from '@/types/anime'
import { AnimeCard } from '@/components/anime/AnimeCard'
import { useDebounce } from '@/hooks/useDebounce'

const PER_PAGE = 20
const START_YEAR = 2022
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - START_YEAR + 2 }, (_, i) => String(START_YEAR + i))

const selectClass = (active: boolean) =>
  `text-sm border rounded-full px-4 py-1.5 outline-none cursor-pointer transition-colors appearance-none pr-8 bg-no-repeat bg-[right_0.6rem_center] ${
    active
      ? 'border-pink-300 text-pink-600 bg-pink-50 font-medium'
      : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
  }`

export default function AnimeListPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)
  const totalPages = Math.ceil(total / PER_PAGE)
  const hasActiveFilters = selectedGenre !== '' || selectedYear !== ''

  useEffect(() => {
    fetchGenres().then(setAvailableGenres).catch(console.error)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const genreFilters = selectedGenre ? [selectedGenre] : []
    const { animes: data, total } = await fetchAnimes(page, PER_PAGE, debouncedSearch, genreFilters, selectedYear)
    setAnimes(data)
    setTotal(total)
    setLoading(false)
  }, [page, debouncedSearch, selectedGenre, selectedYear])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch, selectedGenre, selectedYear])

  const handleClearAll = () => {
    setSearchInput('')
    setSelectedGenre('')
    setSelectedYear('')
    setPage(1)
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-pink-50 to-white border-b border-gray-100 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <h1 className="text-lg font-bold text-gray-800 flex-shrink-0">アニメ一覧</h1>
          <div className="flex items-center sm:ml-auto w-full sm:w-72 bg-white border border-gray-200 rounded-full px-4 py-2 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="アニメタイトルで検索..."
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={selectClass(selectedYear !== '')}>
                <option value="">製作年 すべて</option>
                {YEARS.map((year) => <option key={year} value={year}>{year}年</option>)}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="relative">
              <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className={selectClass(selectedGenre !== '')}>
                <option value="">ジャンル すべて</option>
                {availableGenres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            {(hasActiveFilters || searchInput) && (
              <button onClick={handleClearAll} className="text-xs text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-1">
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
        ) : animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-gray-400">{debouncedSearch ? `「${debouncedSearch}」に一致するアニメが見つかりませんでした` : '条件に一致するアニメが見つかりませんでした'}</p>
            <button onClick={handleClearAll} className="text-sm text-pink-500 hover:underline">条件をクリア</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {animes.map((anime) => <AnimeCard key={anime.anime_id} anime={anime} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">前へ</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`e-${idx}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)} className={`w-9 h-9 text-sm rounded-lg border transition-colors ${page === p ? 'bg-pink-50 border-pink-200 text-pink-600 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
                    )
                  )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">次へ</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
