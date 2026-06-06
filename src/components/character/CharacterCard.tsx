import type { Character } from '../../types/character'

type Props = {
    character: Character
}

const roleColors: Record<Character['role'], string> = {
    '主人公': 'bg-blue-100 text-blue-700',
    'ヒロイン': 'bg-pink-100 text-pink-700',
    '敵': 'bg-red-100 text-red-700',
    'サブキャラ': 'bg-gray-100 text-gray-700',
}

export const CharacterCard = ({ character }: Props) => {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-40 object-cover"
            />
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-800">{character.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[character.role]}`}>
                        {character.role}
                    </span>
                </div>
                {character.age && (
                    <p className="text-xs text-gray-400 mb-1">{character.age}歳</p>
                )}
                <p className="text-xs text-gray-600 line-clamp-2">{character.description}</p>
            </div>
        </div>
    )
}