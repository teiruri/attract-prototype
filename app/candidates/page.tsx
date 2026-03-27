'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Filter, Users, GraduationCap, Briefcase } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

type FilterType = 'all' | 'newgrad' | 'midcareer'

interface Candidate {
  id: string
  full_name: string
  email: string
  hiring_type: string
  status: string
  source: string
  job_id: string
  current_company?: string
  current_title?: string
  university?: string
  faculty?: string
  created_at: string
  candidate_documents?: Array<{ id: string }>
  interviews?: Array<{ id: string; stage: string; result: string }>
}

interface Job {
  id: string
  title: string
  hiring_type: string
}

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    casual: 'カジュアル面談',
    interview_1: '一次面接',
    interview_2: '二次面接',
    final: '最終面接',
    offer: 'オファー',
    hired: '内定承諾',
    briefing: '説明会',
    es: 'ES選考',
    aptitude: '適性検査',
    gd: 'GD',
    active: '選考中',
  }
  return labels[stage] || stage || '選考中'
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    casual: 'bg-gray-100 text-gray-600',
    interview_1: 'bg-blue-50 text-blue-600',
    interview_2: 'bg-indigo-50 text-indigo-600',
    final: 'bg-purple-50 text-purple-600',
    offer: 'bg-amber-50 text-amber-600',
    hired: 'bg-emerald-50 text-emerald-600',
    active: 'bg-indigo-50 text-indigo-600',
  }
  return colors[stage] || 'bg-gray-100 text-gray-600'
}

export default function CandidatesPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [candRes, jobsRes] = await Promise.all([
          fetch(`/api/candidates?tenant_id=${TENANT_ID}`),
          fetch(`/api/jobs?tenant_id=${TENANT_ID}`),
        ])
        const candData = await candRes.json()
        const jobsData = await jobsRes.json()
        setCandidates(candData.candidates || [])
        setJobs(jobsData.jobs || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    return job?.title || '—'
  }

  const filtered = candidates.filter((c) => {
    if (filter === 'newgrad' && c.hiring_type !== 'new_graduate' && c.hiring_type !== 'newgrad') return false
    if (filter === 'midcareer' && c.hiring_type !== 'mid_career' && c.hiring_type !== 'midcareer') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        (c.full_name || '').toLowerCase().includes(q) ||
        (c.current_company || '').toLowerCase().includes(q) ||
        (c.current_title || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">候補者管理</h1>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

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

      {/* Empty State */}
      {candidates.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">候補者がいません</h2>
          <p className="text-sm text-gray-500 mb-6">候補者を追加して採用活動を始めましょう</p>
          <Link href="/candidates/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" />
            候補者を追加
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">候補者</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">応募ポジション</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">現職</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ステータス</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">流入元</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((candidate) => {
                  // Find latest interview stage
                  const latestInterview = candidate.interviews?.length
                    ? candidate.interviews[candidate.interviews.length - 1]
                    : null
                  const currentStage = latestInterview?.stage || candidate.status

                  return (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-700">{(candidate.full_name || '?')[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-900">{candidate.full_name}</p>
                              {(candidate.hiring_type === 'new_graduate' || candidate.hiring_type === 'newgrad') && (
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
                        <p className="text-sm text-gray-700">{getJobTitle(candidate.job_id)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{candidate.current_title || '—'}</p>
                        <p className="text-xs text-gray-400">{candidate.current_company || ''}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`badge ${getStageColor(currentStage)}`}>
                          {getStageLabel(currentStage)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-500">{candidate.source || '—'}</p>
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
        </>
      )}
    </div>
  )
}
