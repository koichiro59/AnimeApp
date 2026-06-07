import { Link } from 'react-router-dom'
import type { Character } from '../../types/character'

type Props = {
  character: Character
  imageUrl: string
}

export const CharacterCard = ({ character, imageUrl }: Props) => {
  return (
    <Link to={`/character/${character.character_id}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer">
        {imageUrl ? (
          <img src={imageUrl} alt={character.name} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-200 animate-pulse" />
        )}
        <div className="p-3">
          <h3 className="text-sm font-bold text-gray-800 mb-1">{character.name}</h3>
          {character.age && (
            <p className="text-xs text-gray-400 mb-1">{character.age}歳</p>
          )}
          <p className="text-xs text-gray-600 line-clamp-2">{character.description}</p>
        </div>
      </div>
    </Link>
  )
}