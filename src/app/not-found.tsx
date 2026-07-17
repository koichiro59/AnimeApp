import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <p className="text-gray-500">ページが見つかりませんでした</p>
      <Link href="/" className="text-sm text-pink-500 hover:text-pink-600 transition-colors">
        ホームに戻る
      </Link>
    </div>
  )
}
