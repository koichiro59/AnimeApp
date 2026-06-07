import { Link } from 'react-router-dom'
import type { Anime } from '../../types/anime'

type Props = {
    anime: Anime
    imageUrl: string
}

export const AnimeCard = ({ anime, imageUrl }: Props) => {
    return (
        <Link to={`/anime/${anime.anime_id}`}>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="relative overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={anime.title}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-56 bg-gray-100 animate-pulse" />
                    )}
                    {anime.type && (
                        <span className="absolute top-2 left-2 text-xs bg-white/90 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                            {anime.type}
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <h2 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">{anime.title}</h2>
                    <p className="text-xs text-gray-400" style={{ marginBottom: '16px' }}>{anime.broadcast_season}</p>
                    <div className="flex flex-wrap gap-1">
                        {anime.genres?.slice(0, 2).map((g) => (
                            <span key={g} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">
                                {g}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}