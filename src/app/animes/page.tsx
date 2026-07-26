import type { Metadata } from 'next'
import { fetchAnimes, fetchGenres } from '@/lib/db'
import AnimesClient from './AnimesClient'

export const metadata: Metadata = {
  title: 'アニメ一覧 | アニレフ',
  description: 'キャラクターで選べるアニメ一覧。ジャンルや制作年でフィルタリングして気になるアニメを見つけよう。',
  alternates: { canonical: 'https://aniref.net/animes' },
}

export const revalidate = 3600

export default async function AnimeListPage() {
  const [{ animes: initialAnimes, total: initialTotal }, availableGenres] = await Promise.all([
    fetchAnimes(1, 20),
    fetchGenres(),
  ])

  return (
    <AnimesClient
      initialAnimes={initialAnimes}
      initialTotal={initialTotal}
      availableGenres={availableGenres}
    />
  )
}
