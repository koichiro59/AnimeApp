import type { Metadata } from 'next'
import { fetchCharacters, fetchCharacterTags } from '@/lib/db'
import CharactersClient from './CharactersClient'

export const metadata: Metadata = {
  title: 'キャラクター一覧 | アニレフ',
  description: 'アニメキャラクターをタグや名前で検索。髪色・性格・服装など様々な条件でお気に入りのキャラクターを探そう。',
  alternates: { canonical: 'https://aniref.net/characters' },
}

export const revalidate = 3600

export default async function CharacterListPage() {
  const [{ characters: initialCharacters, total: initialTotal }, availableTags] = await Promise.all([
    fetchCharacters(1, 24),
    fetchCharacterTags(),
  ])

  return (
    <CharactersClient
      initialCharacters={initialCharacters}
      initialTotal={initialTotal}
      availableTags={availableTags}
    />
  )
}
