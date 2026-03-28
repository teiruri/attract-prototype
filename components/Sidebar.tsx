'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Command,
  Users,
  BarChart3,
  Briefcase,
  Sparkles,
  Activity,
  FileText,
  Database,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { getSupabase } from '@/lib/supabase'

const navGroups = [
  {
    label: '意思決定',
    items: [
      { label: 'コマンドセンター', href: '/', icon: Command, badge: 'urgent' as const },
      { label: '候補者ジャーニー', href: '/candidates', icon: Users, badge: 'count' as const },
      { label: '選考ダッシュボード', href: '/selection', icon: BarChart3 },
    ],
  },
  {
    label: '設計',
    items: [
      { label: '求人設計', href: '/jobs', icon: Briefcase },
      { label: '企業の魅力', href: '/settings/attraction-profile', icon: Sparkles },
      { label: 'REVP診断', href: '/settings/revp-report', icon: Activity },
    ],
  },
  {
    label: 'インサイト',
    items: [
      { label: '採用サマリー', href: '/recruitment-summary', icon: FileText },
      { label: 'タレントプール', href: '/talent-pool/candidates', icon: Database },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [candidateCount, setCandidateCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCandidateCount() {
      try {
        const res = await fetch('/api/candidates')
        if (res.ok) {
          const data = await res.json()
          setCandidateCount(Array.isArray(data) ? data.length : 0)
        }
      } catch {
        // silently fail
      }
    }
    fetchCandidateCount()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } catch {
      // ignore errors
    }
    window.location.href = '/login'
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Header */}
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          HR FARM
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Candidate Decision Engine
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-0.5 h-3.5 bg-indigo-500 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                {group.label}
              </span>
            </div>

            {/* Group items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors relative',
                      active
                        ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-700 border-l-[3px] border-indigo-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>

                    {/* Urgent red dot for コマンドセンター */}
                    {'badge' in item && item.badge === 'urgent' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    )}

                    {/* Candidate count badge */}
                    {'badge' in item &&
                      item.badge === 'count' &&
                      candidateCount !== null &&
                      candidateCount > 0 && (
                        <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {candidateCount}
                        </span>
                      )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="ログアウト"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
