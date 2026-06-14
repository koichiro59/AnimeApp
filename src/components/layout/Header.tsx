import { Link, useLocation } from 'react-router-dom'

export const Header = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: '60px' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-lg">
            🌸
          </div>
          <span className="text-lg font-semibold text-pink-600 tracking-tight">
            アニレフ
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive('/')
              ? 'bg-pink-50 text-pink-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
          >
            アニメ
          </Link>
          <Link
            to="/characters"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive('/characters')
              ? 'bg-pink-50 text-pink-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
          >
            キャラクター
          </Link>
        </nav>
      </div>
    </header>
  )
}