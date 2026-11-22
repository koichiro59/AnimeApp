import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchCharacterById, fetchAnimeById, fetchAllCharacterIds, fetchCharactersByAnimeId } from '@/lib/db'
import { buildCharacterDescription, hasRichData } from '@/lib/characterText'
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

  const description = character.description
    ? `${character.description.slice(0, 100)}…`
    : `${buildCharacterDescription(character, anime).slice(0, 110)}…`

  const isThinContent = !hasRichData(character)

  return {
    title: `${titleStr} | アニレフ`,
    description,
    alternates: { canonical: `https://aniref.net/character/${id}` },
    ...(isThinContent && { robots: { index: false, follow: true } }),
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

  // 同じ作品の他キャラへの内部リンク（クロール経路を増やしインデックスを促進）
  const siblings = character.anime_id
    ? (await fetchCharactersByAnimeId(character.anime_id))
        .filter((c) => c.character_id !== character.character_id)
        .slice(0, 12)
    : []

  // 説明文が無いキャラは既存フィールドから紹介文を生成して表示する
  const generatedText = buildCharacterDescription(character, anime)
  const description = character.description
    ? `${character.description.slice(0, 100)}…`
    : generatedText.slice(0, 110)

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
                  { label: '血液型', value: character.blood_type ? `${character.blood_type}型` : null },
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

          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">
              {character.description ?? generatedText}
            </p>
          </div>

          {anime && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">登場作品</p>
              <Link href={`/anime/${anime.anime_id}`} className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors">
                {anime.title}
              </Link>
            </div>
          )}
        </div>

        {siblings.length > 0 && anime && (
          <div className="mt-8">
            <h2 className="text-base font-bold text-gray-800 mb-3">
              「{anime.title}」の他のキャラクター
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {siblings.map((c) => (
                <Link
                  key={c.character_id}
                  href={`/character/${c.character_id}`}
                  className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 p-2 hover:border-pink-300 transition-colors"
                >
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium text-gray-700 truncate">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
