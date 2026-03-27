'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Briefcase,
  ChevronDown,
  GraduationCap,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

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
  created_at: string
  interviews?: Array<{ id: string; stage: string; status: string; result: string }>
}

interface Job {
  id: string
  title: string
  hiring_type: string
  is_active: boolean
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
  }
  return labels[stage] || stage
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    casual: 'bg-gray-100 text-gray-600',
    interview_1: 'bg-blue-50 text-blue-600',
    interview_2: 'bg-indigo-50 text-indigo-600',
    final: 'bg-purple-50 text-purple-600',
    offer: 'bg-amber-50 text-amber-600',
    hired: 'bg-emerald-50 text-emerald-600',
  }
  return colors[stage] || 'bg-gray-100 text-gray-600'
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false)
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
        const fetchedJobs = jobsData.jobs || []
        setJobs(fetchedJobs)
        if (fetchedJobs.length > 0) {
          setSelectedJobId(fetchedJobs[0].id)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const selectedJob = jobs.find(j => j.id === selectedJobId)

  // Filter candidates by selected job
  const jobCandidates = selectedJobId
    ? candidates.filter(c => c.job_id === selectedJobId && c.status === 'active')
    : candidates.filter(c => c.status === 'active')

  const totalActive = jobCandidates.length
  const newgradCount = jobCandidates.filter(c => c.hiring_type === 'new_graduate' || c.hiring_type === 'newgrad').length
  const midcareerCount = totalActive - newgradCount

  // Today's date
  const today = new Date()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()]
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${dayOfWeek}）`

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header + Job Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
          </div>
          {/* Job Selector */}
          {jobs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedJob?.hiring_type === 'new_graduate' ? 'bg-pink-50' : 'bg-indigo-50'}`}>
                  <Briefcase className={`w-4 h-4 ${selectedJob?.hiring_type === 'new_graduate' ? 'text-pink-600' : 'text-indigo-600'}`} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">表示中の求人</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedJob?.title || '全体'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${jobDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {jobDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                  {jobs.map(job => {
                    const jobCandCount = candidates.filter(c => c.job_id === job.id && c.status === 'active').length
                    return (
                      <button
                        key={job.id}
                        onClick={() => { setSelectedJobId(job.id); setJobDropdownOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedJobId === job.id ? 'bg-indigo-50' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${job.hiring_type === 'new_graduate' ? 'bg-pink-50' : 'bg-indigo-50'}`}>
                          <Briefcase className={`w-3.5 h-3.5 ${job.hiring_type === 'new_graduate' ? 'text-pink-600' : 'text-indigo-600'}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{job.title}</p>
                          <p className="text-[10px] text-gray-400">選考中 {jobCandCount}名</p>
                        </div>
                        {selectedJobId === job.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 選考中 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">選考中</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-gray-900">{totalActive}</p>
            <span className="text-sm text-gray-400">人</span>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">新卒 {newgradCount}名</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">中途 {midcareerCount}名</span>
          </div>
        </div>

        {/* 求人数 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">募集中の求人</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-gray-900">{jobs.filter(j => j.is_active).length}</p>
            <span className="text-sm text-gray-400">件</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">全{jobs.length}件中</p>
        </div>

        {/* 全候補者 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">総候補者数</span>
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
            <span className="text-sm text-gray-400">人</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">全求人合計</p>
        </div>
      </div>

      {/* Efficiency Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">HR FARM — AI採用プラットフォーム</p>
          <p className="text-xs text-indigo-200">候補者の惹きつけ、シグナル分析、フィードバックレター生成をAIが支援します</p>
        </div>
      </div>

      {candidates.length === 0 && jobs.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">まだデータがありません</h2>
          <p className="text-sm text-gray-500 mb-6">求人を登録し、候補者を追加してHR FARMを始めましょう</p>
          <div className="flex justify-center gap-3">
            <Link href="/jobs" className="btn-primary">
              <Briefcase className="w-4 h-4" />
              求人を登録
            </Link>
            <Link href="/candidates/new" className="btn-secondary">
              <Users className="w-4 h-4" />
              候補者を追加
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Candidate List */}
          <div className="col-span-2">
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                  {selectedJob ? `${selectedJob.title} の候補者` : '候補者一覧'}
                </h2>
                <span className="badge bg-indigo-50 text-indigo-600">{jobCandidates.length}名</span>
              </div>
              {jobCandidates.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">この求人にはまだ候補者がいません</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {jobCandidates.slice(0, 10).map((c) => (
                    <Link
                      key={c.id}
                      href={`/candidates/${c.id}`}
                      className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors block"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-700">
                          {(c.full_name || '?')[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{c.full_name}</p>
                          {(c.hiring_type === 'new_graduate' || c.hiring_type === 'newgrad') && (
                            <span className="badge bg-pink-50 text-pink-700 text-[10px]">
                              <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                              新卒
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{c.current_title || c.email}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
              {jobCandidates.length > 10 && (
                <div className="px-5 py-3 border-t border-gray-100 text-center">
                  <Link href="/candidates" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    すべての候補者を見る ({jobCandidates.length}名)
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Jobs */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">求人一覧</h2>
                <Link href="/jobs" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  すべて見る
                </Link>
              </div>
              {jobs.length === 0 ? (
                <p className="text-xs text-gray-400">求人がありません</p>
              ) : (
                <div className="space-y-2.5">
                  {jobs.slice(0, 5).map((job) => {
                    const count = candidates.filter(c => c.job_id === job.id && c.status === 'active').length
                    return (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedJobId === job.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Briefcase className={`w-4 h-4 flex-shrink-0 ${selectedJobId === job.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{job.title}</p>
                          <p className="text-[10px] text-gray-400">{count}名選考中</p>
                        </div>
                        {job.is_active ? (
                          <span className="badge bg-emerald-50 text-emerald-600 text-[10px]">募集中</span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-400 text-[10px]">停止</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Candidates */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">最近の候補者</h2>
                <Link href="/candidates" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  すべて見る
                </Link>
              </div>
              <div className="space-y-3">
                {candidates.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/candidates/${c.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-700">{(c.full_name || '?')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{c.full_name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{c.current_title || c.email}</p>
                    </div>
                  </Link>
                ))}
                {candidates.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">候補者がいません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
