import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

export const metadata: Metadata = {
  title: 'HR FARM — 応募者の志望度を耕し、採用確率を高める仕組み | by カケハシスカイ',
  description: '1to1 AI Recruitment Platform — 応募者の志望度を耕し、採用確率を高める仕組み',
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
