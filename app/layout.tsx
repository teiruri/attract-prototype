import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Journey - Attract Platform',
  description: '採用成功ジャーニー基盤',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-60 flex-1 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
