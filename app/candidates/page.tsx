'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, Users, GraduationCap, Briefcase, Trash2, ChevronRight, UserPlus, Clock } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

type HiringFilter = 'all' | 'newgrad' | 'midcareer'
type StageFilter = 'all' | 'applied' | 'interviewing' | 'offer' | 'accepted'

interface Interview {
  id: string
  stage: string
  result: string
  temperature_score?: number
  interview_date?: string
}

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
  current_stage?: string
  created_at: string
  updated_at?: string
  candidate_documents?: Array<{ id: string }>
  interviews?: Interview[]
}

// Journey stages for the mini timeline
const JOURNEY_STAGES = [
  { key: 'applied', label: '応募' },
  { key: 'screening', label: '書類' },
  { key: 'interview_1', label: '一次' },
  { key: 'interview_2', label: '二次' },
  { key: 'final', label: '最終' },
  { key: 'offer', label: '内定' },
] as const

// Map actual stage values to journey stage index
function getJourneyIndex(stage?: string): number {
  if (!stage) return 0
  const map: Record<string, number> = {
    active: 0,
    applied: 0,
    briefing: 0,
    es: 1,
    screening: 1,
    aptitude: 1,
    casual: 1,
    gd: 2,
    interview_1: 2,
    interview_2: 3,
    final: 4,
    offer: 5,
    hired: 5,
  }
  return map[stage] ?? 0
}

// Map stage to the filter categories
function getStageFilterCategory(stage?: string): StageFilter {
  const idx = getJourneyIndex(stage)
  if (idx === 5) {
    // Check if it's offer or hired/accepted
    if (stage === 'hired') return 'accepted'
    return 'offer'
  }
  if (idx >= 2) return 'interviewing'
  if (idx >= 1) return 'interviewing'
  return 'applied'
}

function getJourneyLabel(stage?: string): string {
  const labels: Record<string, string> = {
    active: '応募',
    applied: '応募',
    briefing: '説明会',
    es: 'ES選考',
    screening: '書類選考',
    aptitude: '適性検査',
    casual: 'カジュアル面談',
    gd: 'GD',
    interview_1: '一次面接',
    interview_2: '二次面接',
    final: '最終面接',
    offer: '内定',
    hired: '内定承諾',
  }
  return labels[stage || ''] || '応募'
}

// Compute a 志望度 score from available interview data
function computeMotivationScore(candidate: Candidate): number | null {
  const interviews = candidate.interviews
  if (!interviews || interviews.length === 0) return null

  // Use the latest temperature_score if available
  const withScore = interviews
    .filter((i) => i.temperature_score != null)
    .sort((a, b) => {
      // Sort by stage progression
      const order = ['casual', 'briefing', 'es', 'aptitude', 'gd', 'interview_1', 'interview_2', 'final', 'offer', 'hired']
      return order.indexOf(a.stage) - order.indexOf(b.stage)
    })

  if (withScore.length > 0) {
    const latest = withScore[withScore.length - 1]
    return Math.min(100, Math.max(0, latest.temperature_score!))
  }

  // Fallback: estimate from stage progression and results
  const idx = getJourneyIndex(candidate.current_stage)
  const passedCount = interviews.filter((i) => i.result === 'passed' || i.result === 'advance').length
  const base = ((idx + 1) / JOURNEY_STAGES.length) * 60
  const bonus = passedCount * 8
  return Math.min(100, Math.round(base + bonus))
}

// Score color
function getScoreColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-500'
  if (score >= 25) return 'bg-orange-400'
  return 'bg-red-400'
}

// Avatar color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-sky-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Days since a date
function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null
  const then = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// Get last contact date from interviews or created_at
function getLastContactDate(candidate: Candidate): string {
  const dates: string[] = []
  if (candidate.updated_at) dates.push(candidate.updated_at)
  if (candidate.created_at) dates.push(candidate.created_at)
  if (candidate.interviews) {
    candidate.interviews.forEach((i) => {
      if (i.interview_date) dates.push(i.interview_date)
    })
  }
  if (dates.length === 0) return candidate.created_at
  return dates.sort().reverse()[0]
}

// Determine next action
function getNextAction(candidate: Candidate): { label: string; urgent: boolean } {
  const stage = candidate.current_stage
  const interviews = candidate.interviews || []
  const lastInterview = interviews.length > 0 ? interviews[interviews.length - 1] : null

  if (!stage || stage === 'active' || stage === 'applied') {
    return { label: '書類選考を開始', urgent: interviews.length === 0 }
  }
  if (stage === 'hired') {
    return { label: '入社準備', urgent: false }
  }
  if (stage === 'offer') {
    return { label: '承諾確認フォロー', urgent: true }
  }
  if (lastInterview?.result === 'pending') {
    return { label: '面接結果を入力', urgent: true }
  }
  if (lastInterview?.result === 'passed' || lastInterview?.result === 'advance') {
    return { label: '次の面接を設定', urgent: true }
  }

  const stageLabels: Record<string, string> = {
    casual: '一次面接を設定',
    briefing: 'ES提出を依頼',
    es: '適性検査を案内',
    aptitude: '面接を設定',
    gd: '個人面接を設定',
    interview_1: '二次面接を設定',
    interview_2: '最終面接を設定',
    final: 'オファーを検討',
  }
  return { label: stageLabels[stage] || '次のステップを確認', urgent: false }
}

// Sort: urgent first, then by last activity (most recent first)
function sortCandidates(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => {
    const actionA = getNextAction(a)
    const actionB = getNextAction(b)
    // Urgent first
    if (actionA.urgent && !actionB.urgent) return -1
    if (!actionA.urgent && actionB.urgent) return 1
    // Then by most recent activity
    const dateA = getLastContactDate(a)
    const dateB = getLastContactDate(b)
    return dateB.localeCompare(dateA)
  })
}

export default function CandidatesPage() {
  const [hiringFilter, setHiringFilter] = useState<HiringFilter>('all')
  const [stageFilter, setStageFilter] = useState<StageFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/candidates?tenant_id=${TENANT_ID}`)
        const data = await res.json()
        setCandidates(data.candidates || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let result = candidates.filter((c) => {
      // Hiring type filter
      if (hiringFilter === 'newgrad' && c.hiring_type !== 'new_graduate' && c.hiring_type !== 'newgrad') return false
      if (hiringFilter === 'midcareer' && c.hiring_type !== 'mid_career' && c.hiring_type !== 'midcareer') return false

      // Stage filter
      if (stageFilter !== 'all') {
        const category = getStageFilterCategory(c.current_stage)
        if (category !== stageFilter) return false
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          (c.full_name || '').toLowerCase().includes(q) ||
          (c.current_company || '').toLowerCase().includes(q) ||
          (c.university || '').toLowerCase().includes(q)
        )
      }
      return true
    })

    return sortCandidates(result)
  }, [candidates, hiringFilter, stageFilter, searchQuery])

  const handleDelete = async (candidateId: string) => {
    if (!window.confirm('この候補者を削除しますか？')) return
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, { method: 'DELETE' })
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">候補者ジャーニー</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">候補者ジャーニー</h1>
          </div>
          <p className="text-sm text-gray-500 ml-9">
            一人ひとりの応募者体験を可視化し、次のアクションにつなげます
          </p>
        </div>
        <Link
          href="/candidates/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新しい候補者
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="候補者名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Compact Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Hiring type toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([
            { id: 'all' as HiringFilter, label: '全て' },
            { id: 'newgrad' as HiringFilter, label: '新卒', icon: GraduationCap },
            { id: 'midcareer' as HiringFilter, label: '中途', icon: Briefcase },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => setHiringFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                hiringFilter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.icon && <f.icon className="w-3.5 h-3.5" />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Journey stage filter pills */}
        <div className="flex gap-1.5">
          {([
            { id: 'all' as StageFilter, label: '全て' },
            { id: 'applied' as StageFilter, label: '応募' },
            { id: 'interviewing' as StageFilter, label: '面接中' },
            { id: 'offer' as StageFilter, label: '内定' },
            { id: 'accepted' as StageFilter, label: '承諾' },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => setStageFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                stageFilter === f.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {candidates.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          {filtered.length}名を表示（全{candidates.length}名）
        </p>
      )}

      {/* Empty State */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">候補者のジャーニーを始めましょう</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            最初の候補者を追加して、採用プロセスの可視化を始めましょう。
            一人ひとりの体験を丁寧に追跡できます。
          </p>
          <Link
            href="/candidates/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            最初の候補者を追加
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">条件に一致する候補者が見つかりません</p>
        </div>
      ) : (
        /* Candidate Cards */
        <div className="space-y-3">
          {filtered.map((candidate) => {
            const journeyIdx = getJourneyIndex(candidate.current_stage)
            const journeyLabel = getJourneyLabel(candidate.current_stage)
            const score = computeMotivationScore(candidate)
            const lastContact = getLastContactDate(candidate)
            const days = daysSince(lastContact)
            const nextAction = getNextAction(candidate)
            const initial = (candidate.full_name || '?')[0]
            const avatarColor = getAvatarColor(candidate.full_name || '')
            const isNewgrad = candidate.hiring_type === 'new_graduate' || candidate.hiring_type === 'newgrad'
            const subtitle = isNewgrad
              ? [candidate.university, candidate.faculty].filter(Boolean).join(' ')
              : [candidate.current_company, candidate.current_title].filter(Boolean).join(' / ')

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow px-5 py-4"
              >
                <div className="flex items-center gap-5">
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0 w-56 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-sm font-bold text-white">{initial}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{candidate.full_name}</p>
                        {isNewgrad ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-50 text-pink-700 flex-shrink-0">
                            <GraduationCap className="w-2.5 h-2.5" />
                            新卒
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 flex-shrink-0">
                            <Briefcase className="w-2.5 h-2.5" />
                            中途
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{subtitle || '---'}</p>
                    </div>
                  </div>

                  {/* Center: Mini Journey Timeline */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-0">
                      {JOURNEY_STAGES.map((s, i) => {
                        const isCompleted = i <= journeyIdx
                        const isCurrent = i === journeyIdx
                        return (
                          <div key={s.key} className="flex items-center">
                            {/* Dot */}
                            <div className="relative flex items-center justify-center">
                              <div
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                  isCurrent
                                    ? 'bg-indigo-600 ring-4 ring-indigo-100'
                                    : isCompleted
                                    ? 'bg-indigo-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            </div>
                            {/* Line */}
                            {i < JOURNEY_STAGES.length - 1 && (
                              <div
                                className={`w-5 h-0.5 ${
                                  i < journeyIdx ? 'bg-indigo-400' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1.5">{journeyLabel}</p>
                  </div>

                  {/* Right: Score + Days + Action + Nav */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    {/* 志望度 gauge */}
                    <div className="w-20">
                      <p className="text-[10px] text-gray-400 mb-1">志望度</p>
                      {score !== null ? (
                        <>
                          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getScoreColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{score}%</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-gray-300">---</p>
                      )}
                    </div>

                    {/* Days since last contact */}
                    <div className="w-14 text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">最終接触</p>
                      {days !== null ? (
                        <p className={`text-xs font-medium ${days > 14 ? 'text-red-500' : days > 7 ? 'text-amber-500' : 'text-gray-600'}`}>
                          <Clock className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />
                          {days}日前
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-300">---</p>
                      )}
                    </div>

                    {/* Next action */}
                    <div className="w-32">
                      <p className="text-[10px] text-gray-400 mb-0.5">次のアクション</p>
                      <p className={`text-xs font-medium truncate ${nextAction.urgent ? 'text-red-600' : 'text-gray-700'}`}>
                        {nextAction.urgent && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1 -mt-0.5" />}
                        {nextAction.label}
                      </p>
                    </div>

                    {/* Delete + Link */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(candidate.id)
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
