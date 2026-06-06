import { Link } from 'react-router-dom'
import type { Character } from '../../types/character'

type Props = {
    character: Character
}

const roleColors: Record<string, string> = {
    'MAIN': 'bg-blue-100 text-blue-700',
    'SUPPORTING': 'bg-gray-100 text-gray-700',
    'BACKGROUND': 'bg-yellow-100 text-yellow-700',
}

const roleLabels: Record<string, string> = {
    'MAIN': '主人公',
    'SUPPORTING': 'サブキャラ',
    'BACKGROUND': 'その他',
}

export const CharacterCard = ({ character }: Props) => {
    return (
        <Link to={`/character/${character.node.id}`}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer">
                <img
                    src={character.node.image.large}
                    alt={character.node.name.native}
                    className="w-full h-40 object-cover"
                />
                <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-800">{character.node.name.native}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[character.role] ?? 'bg-gray-100 text-gray-700'}`}>
                            {roleLabels[character.role] ?? character.role}
                        </span>
                    </div>
                    {character.node.age && (
                        <p className="text-xs text-gray-400 mb-1">{character.node.age}歳</p>
                    )}
                </div>
            </div>
        </Link>
    )
}