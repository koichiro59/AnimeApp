import { Link } from 'react-router-dom'
import type { Anime } from '../../types/anime'

type Props = {
    anime: Anime
}

export const AnimeCard = ({ anime }: Props) => {
    return (
        <Link to={`/anime/${anime.id}`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <img
                    src={anime.coverImage.large}
                    alt={anime.title.native}
                    className="w-full h-56 object-cover"
                />
                <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">{anime.title.native}</h2>
                    <p className="text-sm text-gray-500 mb-2">{anime.startDate.year}年</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                        {anime.genres.slice(0, 3).map((g) => (
                            <span
                                key={g}
                                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-yellow-500 font-semibold">★ {anime.averageScore / 10}</p>
                </div>
            </div>
        </Link>
    )
}