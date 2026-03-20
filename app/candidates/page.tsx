'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Filter, Users, GraduationCap, Briefcase } from 'lucide-react'
import { candidates, getStageColor, getStageLabel } from '@/lib/mock-data'

type FilterType = 'all' | 'newgrad' | 'midcareer'

export default function CandidatesPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = candidates.filter((c) => {
    if (filter === 'newgrad' && c.hiringType !== 'newgrad') return false
    if (filter === 'midcareer' && c.hiringType === 'newgrad') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        c.currentTitle.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">候補者管理</h1>
          <p className="text-sm text-gray-500 mt-1">選考中の候補者一覧（{candidates.length}名）</p>
        </div>
        <Link href="/candidates/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          候補者を取り込む
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="候補者名・会社名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {/* Hiring Type Filter */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([
            { id: 'all', label: 'すべて', icon: Users },
            { id: 'newgrad', label: '新卒', icon: GraduationCap },
            { id: 'midcareer', label: '中途', icon: Briefcase },
          ] as { id: FilterType; label: string; icon: React.ElementType }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn-secondary">
          <Filter className="w-4 h-4" />
          絞り込み
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">候補者</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">応募ポジション</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">現職</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">選考ステージ</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Attract</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">流入元</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((candidate) => {
              const app = candidate.applications[0]
              const hasAttract = !!app?.attractStrategy
              const hasCard = !!app?.candidateCard
              return (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${candidate.avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-sm font-bold text-white">{candidate.avatarInitials[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900">{candidate.fullName}</p>
                          {candidate.hiringType === 'newgrad' && (
                            <span className="badge bg-pink-50 text-pink-700 text-[10px]">
                              <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                              新卒
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">{app?.jobTitle ?? '—'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">{candidate.currentTitle}</p>
                    <p className="text-xs text-gray-400">{candidate.currentCompany}</p>
                  </td>
                  <td className="px-4 py-4">
                    {app && (
                      <span className={`badge ${getStageColor(app.currentStage)}`}>
                        {getStageLabel(app.currentStage)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {hasAttract && (
                        <span className="badge bg-indigo-50 text-indigo-600">戦略あり</span>
                      )}
                      {hasCard && (
                        <span className="badge bg-emerald-50 text-emerald-600">カルテ</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-500">{candidate.source}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      詳細を見る
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length}名を表示（全{candidates.length}名）</p>
      </div>
    </div>
  )
}
