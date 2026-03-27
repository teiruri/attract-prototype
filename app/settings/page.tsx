'use client'

import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'

const settingsItems = [
  {
    icon: Sparkles,
    title: '企業魅力・採用コンセプト',
    description: 'AIのAttract生成の土台となる企業魅力を設定します',
    href: '/settings/attraction-profile',
    badge: '重要',
    badgeColor: 'bg-indigo-100 text-indigo-600',
  },
]

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">システム・テナントの設定</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {settingsItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card p-5 flex items-center gap-4 hover:border-indigo-200 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  {item.badge && (
                    <span className={`badge ${item.badgeColor}`}>{item.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
