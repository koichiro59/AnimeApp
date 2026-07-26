import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchCharacterById, fetchAnimeById, fetchAllCharacterIds } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamicParams = true
export const revalidate = 86400

export async function generateStaticParams() {
  const ids = await fetchAllCharacterIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const character = await fetchCharacterById(id)
  if (!character) return { title: 'アニレフ' }

  const anime = character.anime_id ? await fetchAnimeById(character.anime_id) : null
  const titleStr = anime ? `${character.name}（${anime.title}）` : character.name

  let description: string
  if (character.description) {
    description = `${character.description.slice(0, 100)}…`
  } else {
    const parts: string[] = []
    if (anime) parts.push(`${anime.title}の登場キャラクター`)
    if (character.tags?.length) parts.push(character.tags.slice(0, 3).join('・'))
    if (character.voice_actor) parts.push(`CV：${character.voice_actor}`)
    description = `${titleStr}。${parts.join('。')}。`
  }

  return {
    title: `${titleStr} | アニレフ`,
    description,
    alternates: { canonical: `https://aniref.net/character/${id}` },
    openGraph: {
      title: `${titleStr} | アニレフ`,
      description,
      url: `https://aniref.net/character/${id}`,
      images: character.image_url ? [{ url: character.image_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: character.image_url ? [character.image_url] : [],
    },
  }
}

export default async function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const character = await fetchCharacterById(id)
  if (!character) notFound()

  const anime = character.anime_id ? await fetchAnimeById(character.anime_id) : null

  const description = character.description
    ? `${character.description.slice(0, 100)}…`
    : `${character.name}のキャラクター情報。${anime ? `登場作品：${anime.title}。` : ''}アニレフで詳細をチェック。`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: character.name,
    description,
    url: `https://aniref.net/character/${id}`,
    ...(anime && { worksFor: { '@type': 'TVSeries', name: anime.title } }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {anime && (
          <Link href={`/anime/${anime.anime_id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {anime.title} に戻る
          </Link>
        )}

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="flex">
            <div className="w-36 sm:w-52 flex-shrink-0 self-start bg-gray-50">
              {character.image_url ? (
                <img src={character.image_url} alt={character.name} className="w-full h-auto block" />
              ) : (
                <div className="w-full h-64 bg-gray-100" />
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col divide-y divide-gray-100">
              <div className="px-4 pt-4 pb-3">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">{character.name}</h1>
                {anime && <p className="text-xs text-gray-400 mt-0.5">{anime.title}</p>}
              </div>

              <div className="px-4 py-3 grid grid-cols-2 gap-2">
                {[
                  { label: '年齢', value: character.age ? `${character.age}歳` : null },
                  { label: '性別', value: character.gender },
                  { label: '誕生日', value: character.birthday },
                  { label: '身長', value: character.height ? `${character.height}cm` : null },
                  { label: '体重', value: character.weight ? `${character.weight}kg` : null },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-xs font-medium text-gray-700">{value ?? '－'}</p>
                  </div>
                ))}
                <div className="bg-gray-50 rounded-lg p-2.5 col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">声優</p>
                  <p className="text-xs font-medium text-gray-700">{character.voice_actor ?? '－'}</p>
                </div>
              </div>
            </div>
          </div>

          {character.tags && character.tags.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {character.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-pink-500 text-white">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {character.description && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{character.description}</p>
            </div>
          )}

          {anime && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">登場作品</p>
              <Link href={`/anime/${anime.anime_id}`} className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors">
                {anime.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
