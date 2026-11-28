import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchAnimeById, fetchCharactersByAnimeId, fetchAllAnimeIds } from '@/lib/db'
import { CharacterCard } from '@/components/character/CharacterCard'
import { notFound } from 'next/navigation'

export const dynamicParams = true
export const revalidate = 86400

export async function generateStaticParams() {
  const ids = await fetchAllAnimeIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const anime = await fetchAnimeById(id)
  if (!anime) return { title: 'アニレフ' }

  const seasonStr = anime.broadcast_season ? `（${anime.broadcast_season}）` : ''
  const genreStr = anime.genres?.slice(0, 3).join('・')
  const titleStr = `${anime.title}${seasonStr}`

  const description = anime.synopsis
    ? `${titleStr}${anime.synopsis.slice(0, 90)}…`
    : `${titleStr}の登場キャラクター一覧。${genreStr ? `ジャンル：${genreStr}。` : ''}アニレフで詳細をチェック。`

  return {
    title: `${titleStr} | アニレフ`,
    description,
    alternates: { canonical: `https://aniref.net/anime/${id}` },
    openGraph: {
      title: `${titleStr} | アニレフ`,
      description,
      url: `https://aniref.net/anime/${id}`,
      images: anime.image_url ? [{ url: anime.image_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: anime.image_url ? [anime.image_url] : [],
    },
  }
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [anime, characters] = await Promise.all([
    fetchAnimeById(id),
    fetchCharactersByAnimeId(id),
  ])

  if (!anime) notFound()

  const description = anime.synopsis
    ? `${anime.synopsis.slice(0, 100)}…`
    : `${anime.title}の登場キャラクターやあらすじ情報をチェック。`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: anime.title,
    description,
    url: `https://aniref.net/anime/${id}`,
    ...(anime.image_url && { image: anime.image_url }),
    ...(anime.genres?.length && { genre: anime.genres }),
    ...(anime.broadcast_season && { startDate: anime.broadcast_season }),
    ...(anime.episodes && { numberOfEpisodes: anime.episodes }),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://aniref.net' },
      { '@type': 'ListItem', position: 2, name: 'アニメ作品', item: 'https://aniref.net/animes' },
      { '@type': 'ListItem', position: 3, name: anime.title, item: `https://aniref.net/anime/${id}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav aria-label="パンくず" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
            <li><Link href="/" className="hover:text-pink-500">ホーム</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/animes" className="hover:text-pink-500">アニメ作品</Link></li>
            <li aria-hidden>/</li>
            <li className="text-gray-600 truncate max-w-[14rem]">{anime.title}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-8">
          <div className="md:flex">
            <div className="md:w-64 flex-shrink-0">
              {anime.image_url ? (
                <img src={anime.image_url} alt={anime.title} className="w-full h-80 md:h-full object-cover" />
              ) : (
                <div className="w-full h-80 bg-gray-100" />
              )}
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-xl font-semibold text-gray-800">{anime.title}</h1>
                {anime.type && (
                  <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full border border-pink-100 ml-3 flex-shrink-0">
                    {anime.type}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {anime.genres?.map((g) => (
                  <span key={g} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">{g}</span>
                ))}
              </div>
              {anime.synopsis && (
                <p className="text-sm text-gray-600 leading-relaxed mb-7">{anime.synopsis}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {anime.broadcast_season && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">放送時期</p>
                    <p className="text-sm font-medium text-gray-700">{anime.broadcast_season}</p>
                  </div>
                )}
                {anime.author && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">原作者</p>
                    <p className="text-sm font-medium text-gray-700">{anime.author}</p>
                  </div>
                )}
                {anime.episodes && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">話数</p>
                    <p className="text-sm font-medium text-gray-700">{anime.episodes}話</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {characters.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">登場キャラクター</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {characters.map((character) => (
                <CharacterCard key={character.character_id} character={character} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
