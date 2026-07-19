'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Header = () => {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: '60px' }}>
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <img src="/aniref.svg" alt="aniref" className="w-8 h-8 rounded-lg flex-shrink-0" />
          <span className="text-base sm:text-lg font-semibold text-pink-600 tracking-tight truncate">
            アニレフ<span className="hidden sm:inline">　～キャラから探すアニメサイト～</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
          {[
            { href: '/', label: 'ホーム' },
            { href: '/animes', label: 'アニメ' },
            { href: '/characters', label: 'キャラ' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isActive(href)
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
