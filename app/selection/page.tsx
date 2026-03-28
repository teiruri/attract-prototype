'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardCheck,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  Filter,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

interface Interview {
  id: string
  stage: string
  result: string | null
}

interface Candidate {
  id: string
  full_name: string
  email: string
  current_title?: string
  current_company?: string
  current_stage?: string
  status: string
  hiring_type: string
  job_id?: string
  created_at: string
  interviews: Interview[]
}

const STAGE_ORDER = [
  'document_screening',
  'aptitude',
  'es',
  'casual',
  'interview_1',
  'interview_2',
  'interview_3',
  'interview_final',
  'offer',
  'hired',
]

const STAGE_LABELS: Record<string, string> = {
  document_screening: '書類選考',
  recruiter: 'リクルーター面談',
  aptitude: '適性検査',
  es: 'ES選考',
  casual: 'カジュアル面談',
  interview_1: '一次面接',
  interview_2: '二次面接',
  interview_3: '三次面接',
  interview_final: '最終面接',
  offer: 'オファー面談',
  hired: '内定承諾',
  active: '選考中',
  gd: 'グループディスカッション',
  presentation: 'プレゼン選考',
  trial: '体験入社・ワークサンプル',
  briefing: '説明会',
}

const STAGE_COLORS: Record<string, string> = {
  document_screening: 'bg-slate-100 text-slate-600 border-slate-200',
  recruiter: 'bg-teal-50 text-teal-600 border-teal-200',
  aptitude: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  es: 'bg-gray-100 text-gray-600 border-gray-200',
  casual: 'bg-gray-100 text-gray-600 border-gray-200',
  interview_1: 'bg-blue-50 text-blue-600 border-blue-200',
  interview_2: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  interview_3: 'bg-violet-50 text-violet-600 border-violet-200',
  interview_final: 'bg-purple-50 text-purple-600 border-purple-200',
  offer: 'bg-amber-50 text-amber-600 border-amber-200',
  hired: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  active: 'bg-gray-100 text-gray-600 border-gray-200',
  gd: 'bg-orange-50 text-orange-600 border-orange-200',
  presentation: 'bg-pink-50 text-pink-600 border-pink-200',
  trial: 'bg-lime-50 text-lime-600 border-lime-200',
}

function getResultBadge(result: string | null | undefined): { label: string; color: string } {
  switch (result) {
    case 'S': return { label: 'S', color: 'bg-emerald-100 text-emerald-700' }
    case 'A': return { label: 'A', color: 'bg-blue-100 text-blue-700' }
    case 'B': return { label: 'B', color: 'bg-amber-100 text-amber-700' }
    case 'C': return { label: 'C', color: 'bg-red-100 text-red-700' }
    case 'pass': return { label: '合格', color: 'bg-emerald-100 text-emerald-700' }
    case 'fail': return { label: '不合格', color: 'bg-red-100 text-red-700' }
    case 'hold': return { label: '保留', color: 'bg-amber-100 text-amber-700' }
    default: return { label: '評価待ち', color: 'bg-orange-50 text-orange-600' }
  }
}

function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage] || stage || '選考中'
}

function getCurrentStage(candidate: Candidate): string {
  if (candidate.current_stage) return candidate.current_stage

  // Infer from interviews
  if (candidate.interviews && candidate.interviews.length > 0) {
    const stages = candidate.interviews.map(i => i.stage)
    // Return the latest stage based on order
    let latestIdx = -1
    let latestStage = 'active'
    for (const s of stages) {
      const idx = STAGE_ORDER.indexOf(s)
      if (idx > latestIdx) {
        latestIdx = idx
        latestStage = s
      }
    }
    return latestStage
  }

  return candidate.status || 'active'
}

function getLatestResult(candidate: Candidate): string | null {
  if (!candidate.interviews || candidate.interviews.length === 0) return null
  // Get the latest interview result
  const withResults = candidate.interviews.filter(i => i.result && i.result !== 'pending')
  if (withResults.length === 0) return null
  return withResults[withResults.length - 1].result
}

function isPendingEvaluation(candidate: Candidate): boolean {
  if (!candidate.interviews || candidate.interviews.length === 0) return true
  return candidate.interviews.some(i => !i.result || i.result === 'pending')
}

export default function SelectionManagementPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [evalFilter, setEvalFilter] = useState<'all' | 'pending'>('all')

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch(`/api/candidates?tenant_id=${TENANT_ID}`)
        const json = await res.json()
        if (res.ok && json.candidates) {
          setCandidates(json.candidates)
        } else {
          setError(json.error || 'データの取得に失敗しました')
        }
      } catch {
        setError('データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  // Filter candidates
  const filtered = candidates.filter(c => {
    if (stageFilter !== 'all') {
      const stage = getCurrentStage(c)
      if (stage !== stageFilter) return false
    }
    if (evalFilter === 'pending') {
      if (!isPendingEvaluation(c)) return false
    }
    return true
  })

  // Group by stage
  const grouped: Record<string, Candidate[]> = {}
  for (const c of filtered) {
    const stage = getCurrentStage(c)
    if (!grouped[stage]) grouped[stage] = []
    grouped[stage].push(c)
  }

  // Sort stage groups by STAGE_ORDER
  const sortedStages = Object.keys(grouped).sort((a, b) => {
    const idxA = STAGE_ORDER.indexOf(a)
    const idxB = STAGE_ORDER.indexOf(b)
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB)
  })

  // Count pending
  const pendingCount = candidates.filter(c => isPendingEvaluation(c)).length

  // Unique stages in data for filter
  const stagesInData = Array.from(new Set(candidates.map(c => getCurrentStage(c))))
    .sort((a, b) => {
      const idxA = STAGE_ORDER.indexOf(a)
      const idxB = STAGE_ORDER.indexOf(b)
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB)
    })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-300" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardCheck className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">選考管理</h1>
        </div>
        <p className="text-sm text-gray-500 ml-9">面接官・人事のための選考進捗管理</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全ステージ</option>
              {stagesInData.map(s => (
                <option key={s} value={s}>{getStageLabel(s)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setEvalFilter('pending')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                evalFilter === 'pending'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              評価待ち
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setEvalFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                evalFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              全て
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{filtered.length} 名</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">該当する候補者がいません</p>
          </div>
        ) : (
          sortedStages.map(stage => {
            const candidatesInStage = grouped[stage]
            const stageColor = STAGE_COLORS[stage] || 'bg-gray-100 text-gray-600 border-gray-200'

            return (
              <div key={stage}>
                {/* Stage Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${stageColor}`}>
                    {getStageLabel(stage)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{candidatesInStage.length}名</span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-2">
                  {candidatesInStage.map(candidate => {
                    const latestResult = getLatestResult(candidate)
                    const resultBadge = getResultBadge(latestResult)
                    const pending = isPendingEvaluation(candidate)

                    return (
                      <div
                        key={candidate.id}
                        className={`card p-4 flex items-center justify-between transition-colors ${
                          pending ? 'border-l-4 border-l-orange-400 bg-orange-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-700">
                              {(candidate.full_name || '?')[0]}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/candidates/${candidate.id}`}
                                className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate"
                              >
                                {candidate.full_name}
                              </Link>
                              <span className={`badge text-[10px] ${resultBadge.color}`}>
                                {resultBadge.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {candidate.current_title || candidate.email}
                              {candidate.current_company && ` / ${candidate.current_company}`}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <Link
                            href={`/candidates/${candidate.id}?tab=interviews`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              pending
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            {pending ? '評価を入力' : '評価を見る'}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Link
                            href={`/candidates/${candidate.id}/feedback-letter`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            title="合格通知"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/candidates/${candidate.id}/brief`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            title="面接シナリオ"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
