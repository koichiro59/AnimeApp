import type { Metadata } from 'next'
import Script from 'next/script'
import { Header } from '@/components/layout/Header'
import './globals.css'

const GA_ID = 'G-ERFFMZ1K04'

export const metadata: Metadata = {
  title: 'アニレフ ～キャラから探すアニメサイト～',
  description: 'アニレフは、キャラクターからアニメを探せる情報サイトです。好きなキャラから作品を見つけよう。2024年〜2026年の最新アニメ・キャラクター情報を掲載。',
  metadataBase: new URL('https://aniref.net'),
  icons: {
    icon: '/aniref.svg',
    shortcut: '/aniref.svg',
  },
  openGraph: {
    siteName: 'アニレフ',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9130538629818089"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
