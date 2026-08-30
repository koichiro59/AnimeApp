import type { MetadataRoute } from 'next'
import { fetchAllAnimeIds, fetchIndexableCharacterIds } from '@/lib/db'

export const revalidate = 86400

const BASE_URL = 'https://aniref.net'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [animeIds, characterIds] = await Promise.all([
    fetchAllAnimeIds(),
    fetchIndexableCharacterIds(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/animes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/characters`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const animeRoutes: MetadataRoute.Sitemap = animeIds.map((id) => ({
    url: `${BASE_URL}/anime/${id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const characterRoutes: MetadataRoute.Sitemap = characterIds.map((id) => ({
    url: `${BASE_URL}/character/${id}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...animeRoutes, ...characterRoutes]
}
