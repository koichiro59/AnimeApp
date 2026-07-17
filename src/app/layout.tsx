import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'アニレフ ～キャラから探すアニメサイト～',
  description: 'アニレフは、キャラクターからアニメを探せる情報サイトです。好きなキャラから作品を見つけよう。2024年〜2026年の最新アニメ・キャラクター情報を掲載。',
  metadataBase: new URL('https://aniref.net'),
  openGraph: {
    siteName: 'アニレフ',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
