import { Link } from 'react-router-dom'
import type { Anime } from '../../types/anime'

type Props = {
    anime: Anime
    imageUrl: string
}

export const AnimeCard = ({ anime, imageUrl }: Props) => {
    return (
        <Link to={`/anime/${anime.anime_id}`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                {imageUrl ? (
                    <img src={imageUrl} alt={anime.title} className="w-full h-56 object-cover" />
                ) : (
                    <div className="w-full h-56 bg-gray-200 animate-pulse" />
                )}
                <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">{anime.title}</h2>
                    <p className="text-sm text-gray-500 mb-2">{anime.broadcast_season}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                        {anime.genres?.map((g) => (
                            <span key={g} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                {g}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{anime.synopsis}</p>
                </div>
            </div>
        </Link>
    )
}