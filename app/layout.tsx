import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

export const metadata: Metadata = {
  title: 'ATTRACT — AI採用ストーリー設計プラットフォーム | by カケハシスカイ',
  description: '1to1 AI Recruitment Attraction Orchestration Platform — 候補者シグナルに基づくパーソナライズされた採用コミュニケーションを実現',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  )
}
