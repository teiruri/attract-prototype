'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Sparkles,
  Zap,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { getSupabase } from '@/lib/supabase'

const navItems = [
  { label: 'ダッシュボード', href: '/', icon: LayoutDashboard },
  { label: '候補者管理', href: '/candidates', icon: Users },
  { label: '求人管理', href: '/jobs', icon: Briefcase },
  { label: '企業魅力設定', href: '/settings/attraction-profile', icon: Sparkles },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } catch {
      // ignore errors
    }
    window.location.href = '/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">HR FARM</p>
          <p className="text-[10px] text-gray-400 leading-tight">by カケハシスカイ</p>
        </div>
      </div>

      {/* Tenant */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">テナント</p>
            <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">マイ企業</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
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
