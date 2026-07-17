import Link from 'next/link'
import type { Character } from '@/types/character'

type Props = {
  character: Character
}

export const CharacterCard = ({ character }: Props) => (
  <Link href={`/character/${character.character_id}`}>
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
      <div className="overflow-hidden">
        {character.image_url ? (
          <img
            src={character.image_url}
            alt={character.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-44 bg-gray-100" />
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{character.name}</h3>
        {character.age && <p className="text-xs text-gray-400 mt-0.5">{character.age}歳</p>}
        {character.description && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{character.description}</p>
        )}
      </div>
    </div>
  </Link>
)
