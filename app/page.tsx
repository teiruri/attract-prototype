'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronRight,
  Activity,
  Target,
  Flame,
  BarChart3,
  Users,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

// ── Types ──────────────────────────────────────────────

interface Interview {
  id: string
  stage: string
  result: string
  temperature_score: number | null
  interview_date: string | null
  interviewer_name?: string
  interviewer_evaluation?: {
    result?: string
    criteria?: Array<{ label: string; score: number }>
  } | null
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
  current_stage?: string
  created_at: string
  updated_at?: string
  interviews?: Interview[]
}

interface Job {
  id: string
  title: string
  hiring_type: string
  is_active: boolean
}

interface PredictionData {
  offer_prediction: { score: number; confidence: string }
  acceptance_prediction: { score: number; confidence: string }
}

interface EnrichedCandidate extends Candidate {
  jobTitle: string
  shiboudo: number // 志望度 0-100
  fuando: number // 不安度 0-100
  acceptProb: number // 承諾確率 0-100
  currentStageKey: string
  lastContactDays: number
  alertReason: string | null
  recommendedAction: { label: string; href: string } | null
  nextEvent: string | null
  aiSuggestion: string | null
  completedStages: string[]
}

// ── Constants ──────────────────────────────────────────

const JOURNEY_STAGES = [
  { key: 'active', label: '応募' },
  { key: 'interview_1', label: '面接1' },
  { key: 'interview_2', label: '面接2' },
  { key: 'interview_3', label: '面接3' },
  { key: 'interview_final', label: '最終' },
  { key: 'offer', label: '内定' },
  { key: 'hired', label: '承諾' },
]

const STAGE_ORDER: Record<string, number> = {
  active: 0,
  casual: 0,
  briefing: 1,
  es: 1,
  aptitude: 1,
  gd: 1,
  interview_1: 2,
  interview_2: 3,
  interview_3: 4,
  interview_final: 5,
  final: 5,
  offer: 6,
  hired: 7,
}

const FUNNEL_STAGES = [
  { key: 'active', label: '応募' },
  { key: 'interview', label: '面接中' },
  { key: 'offer', label: '内定' },
  { key: 'hired', label: '承諾' },
]

// ── Utility functions ──────────────────────────────────

function getCurrentStageKey(candidate: Candidate): string {
  const interviews = candidate.interviews || []
  if (candidate.current_stage) return candidate.current_stage
  if (interviews.length === 0) return 'active'
  const sorted = [...interviews].sort(
    (a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99)
  )
  return sorted[sorted.length - 1].stage
}

function getCompletedStages(candidate: Candidate): string[] {
  const interviews = candidate.interviews || []
  const completed = new Set<string>(['active'])
  for (const iv of interviews) {
    completed.add(iv.stage)
  }
  return Array.from(completed)
}

function calcShiboudo(interviews: Interview[]): number {
  const temps = interviews
    .filter((iv) => iv.temperature_score != null)
    .map((iv) => iv.temperature_score!)
  if (temps.length === 0) return 50
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length
  return Math.max(0, Math.min(100, Math.round(avg * 10)))
}

function calcAcceptProb(interviews: Interview[]): number {
  let score = 50
  const completed = interviews.filter((iv) => {
    const r = iv.interviewer_evaluation?.result || iv.result
    return r && r !== 'pending'
  })
  for (const iv of completed) {
    const evalResult = iv.interviewer_evaluation?.result || iv.result
    switch (evalResult) {
      case 'S': score += 15; break
      case 'A': score += 10; break
      case 'B': score -= 5; break
      case 'C': score -= 25; break
    }
    const temp = iv.temperature_score
    if (temp != null) {
      if (temp > 8) score += 10
      else if (temp > 7) score += 5
      else if (temp < 5) score -= 10
    }
  }
  if (completed.length >= 2) score += 5
  return Math.max(5, Math.min(95, Math.round(score)))
}

function getDaysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 999
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function getLastContactDate(candidate: Candidate): string | null {
  const interviews = candidate.interviews || []
  if (interviews.length === 0) return candidate.created_at
  const sorted = [...interviews]
    .filter((iv) => iv.interview_date)
    .sort((a, b) => new Date(b.interview_date!).getTime() - new Date(a.interview_date!).getTime())
  return sorted.length > 0 ? sorted[0].interview_date : candidate.created_at
}

function getAlertReason(ec: {
  shiboudo: number
  lastContactDays: number
  currentStageKey: string
  interviews: Interview[]
}): string | null {
  if (ec.shiboudo < 40) return '志望度が低下しています'
  if (ec.lastContactDays > 5) return `最終接触から${ec.lastContactDays}日経過`
  if (ec.currentStageKey === 'offer') return '内定後フォローが必要です'
  const latestIv = ec.interviews?.[ec.interviews.length - 1]
  if (latestIv && ec.lastContactDays >= 2) return '面接後フォロー未実施'
  if (ec.shiboudo < 60) return '志望度がやや低めです'
  return null
}

function getRecommendedAction(ec: {
  currentStageKey: string
  shiboudo: number
  lastContactDays: number
  candidateId: string
}): { label: string; href: string } | null {
  if (ec.currentStageKey === 'offer' || ec.shiboudo < 40) {
    return { label: 'パーソナルオファーを送る', href: `/candidates/${ec.candidateId}/personal-offer` }
  }
  if (ec.lastContactDays > 5) {
    return { label: '惹きつけストーリーを確認', href: `/candidates/${ec.candidateId}/attract` }
  }
  if (ec.shiboudo < 60) {
    return { label: 'フィードバックレターを作成', href: `/candidates/${ec.candidateId}/feedback-letter` }
  }
  return { label: '面接準備資料を確認', href: `/candidates/${ec.candidateId}/brief` }
}

function getAiSuggestion(ec: {
  shiboudo: number
  currentStageKey: string
  lastContactDays: number
}): string {
  if (ec.shiboudo < 40) return '志望度回復のため、候補者の価値観に合わせた魅力訴求を推奨'
  if (ec.currentStageKey === 'offer') return '承諾率向上のため、入社後のビジョンを共有するフォローを推奨'
  if (ec.lastContactDays > 5) return '接触頻度が低下中。早期のタッチポイント設定を推奨'
  if (ec.shiboudo >= 70) return '志望度良好。次ステップへスムーズに進行させましょう'
  return '候補者の不安要素を特定し、解消アクションを実施しましょう'
}

function getNextEvent(interviews: Interview[]): string | null {
  const now = new Date()
  const upcoming = interviews
    .filter((iv) => iv.interview_date && new Date(iv.interview_date) > now)
    .sort((a, b) => new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime())
  if (upcoming.length === 0) return null
  const iv = upcoming[0]
  const d = new Date(iv.interview_date!)
  const stageLabel =
    iv.stage === 'interview_1' ? '一次面接' :
    iv.stage === 'interview_2' ? '二次面接' :
    iv.stage === 'interview_3' ? '三次面接' :
    iv.stage === 'interview_final' || iv.stage === 'final' ? '最終面接' :
    iv.stage === 'casual' ? 'カジュアル面談' : iv.stage
  return `${stageLabel} ${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ── Score Gauge Component ──────────────────────────────

function ScoreGauge({ value, label, colorClass }: { value: number; label: string; colorClass?: string }) {
  const color = colorClass || (value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-400' : 'bg-rose-500')
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[11px] text-gray-500 w-10 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  )
}

// ── Mini Journey Timeline ──────────────────────────────

function MiniJourneyTimeline({ currentStageKey, completedStages }: { currentStageKey: string; completedStages: string[] }) {
  const stages = JOURNEY_STAGES
  const currentIdx = stages.findIndex((s) => s.key === currentStageKey)

  function getStageStatus(idx: number, stageKey: string) {
    if (completedStages.includes(stageKey) && idx < currentIdx) return 'completed'
    if (stageKey === currentStageKey || idx === currentIdx) return 'current'
    if (idx < currentIdx) return 'completed'
    return 'upcoming'
  }

  return (
    <div className="flex items-center gap-0.5">
      {stages.map((stage, idx) => {
        const status = getStageStatus(idx, stage.key)
        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  status === 'current'
                    ? 'bg-indigo-600 border-indigo-600 ring-2 ring-indigo-200'
                    : status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-gray-300'
                }`}
              />
              <span className={`text-[8px] mt-0.5 leading-none ${
                status === 'current' ? 'text-indigo-600 font-bold' :
                status === 'completed' ? 'text-emerald-600' : 'text-gray-400'
              }`}>
                {stage.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div
                className={`w-3 h-0.5 mx-0.5 ${
                  idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [predictions, setPredictions] = useState<Record<string, PredictionData>>({})
  const [loading, setLoading] = useState(true)
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [candRes, jobsRes] = await Promise.all([
          fetch(`/api/candidates?tenant_id=${TENANT_ID}`),
          fetch(`/api/jobs?tenant_id=${TENANT_ID}`),
        ])
        const candData = await candRes.json()
        const jobsData = await jobsRes.json()
        const fetchedCandidates: Candidate[] = candData.candidates || []
        const fetchedJobs: Job[] = jobsData.jobs || []
        setCandidates(fetchedCandidates)
        setJobs(fetchedJobs)

        // Fetch predictions for active candidates (parallel, limited)
        const activeCands = fetchedCandidates.filter((c) => c.status === 'active').slice(0, 20)
        const predResults = await Promise.allSettled(
          activeCands.map((c) =>
            fetch(`/api/candidates/${c.id}/prediction`)
              .then((r) => r.json())
              .then((data) => ({ id: c.id, data }))
          )
        )
        const predMap: Record<string, PredictionData> = {}
        for (const r of predResults) {
          if (r.status === 'fulfilled' && r.value.data.acceptance_prediction) {
            predMap[r.value.id] = r.value.data
          }
        }
        setPredictions(predMap)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Build enriched candidates
  const jobMap = new Map(jobs.map((j) => [j.id, j]))

  const enrichedCandidates: EnrichedCandidate[] = candidates
    .filter((c) => c.status === 'active')
    .map((c) => {
      const interviews = c.interviews || []
      const currentStageKey = getCurrentStageKey(c)
      const completedStages = getCompletedStages(c)
      const shiboudo = calcShiboudo(interviews)
      const fuando = Math.max(0, Math.min(100, 100 - shiboudo))
      const pred = predictions[c.id]
      const acceptProb = pred?.acceptance_prediction?.score ?? calcAcceptProb(interviews)
      const lastContactDate = getLastContactDate(c)
      const lastContactDays = getDaysSince(lastContactDate)
      const alertReason = getAlertReason({ shiboudo, lastContactDays, currentStageKey, interviews })
      const recommendedAction = getRecommendedAction({
        currentStageKey, shiboudo, lastContactDays, candidateId: c.id,
      })
      const nextEvent = getNextEvent(interviews)
      const aiSuggestion = getAiSuggestion({ shiboudo, currentStageKey, lastContactDays })
      const jobTitle = jobMap.get(c.job_id)?.title || '未設定'

      return {
        ...c,
        jobTitle,
        shiboudo,
        fuando,
        acceptProb,
        currentStageKey,
        lastContactDays,
        alertReason,
        recommendedAction,
        nextEvent,
        aiSuggestion,
        completedStages,
      }
    })

  // Urgent candidates (top 5 with alerts, sorted by urgency)
  const urgentCandidates = enrichedCandidates
    .filter((c) => c.alertReason)
    .sort((a, b) => {
      // Lower shiboudo = more urgent
      const urgencyA = (100 - a.shiboudo) + a.lastContactDays * 5
      const urgencyB = (100 - b.shiboudo) + b.lastContactDays * 5
      return urgencyB - urgencyA
    })
    .slice(0, 5)

  // Funnel counts
  const funnelData = FUNNEL_STAGES.map((stage, idx) => {
    let count = 0
    if (stage.key === 'active') {
      count = enrichedCandidates.filter((c) => (STAGE_ORDER[c.currentStageKey] ?? 0) <= 1).length
    } else if (stage.key === 'interview') {
      count = enrichedCandidates.filter((c) => {
        const o = STAGE_ORDER[c.currentStageKey] ?? 0
        return o >= 2 && o <= 5
      }).length
    } else if (stage.key === 'offer') {
      count = enrichedCandidates.filter((c) => c.currentStageKey === 'offer').length
    } else if (stage.key === 'hired') {
      count = enrichedCandidates.filter((c) => c.currentStageKey === 'hired').length
    }
    const prevCount = idx > 0 ? (() => {
      const prevStage = FUNNEL_STAGES[idx - 1]
      if (prevStage.key === 'active') return enrichedCandidates.filter((c) => (STAGE_ORDER[c.currentStageKey] ?? 0) <= 1).length
      if (prevStage.key === 'interview') return enrichedCandidates.filter((c) => { const o = STAGE_ORDER[c.currentStageKey] ?? 0; return o >= 2 && o <= 5 }).length
      if (prevStage.key === 'offer') return enrichedCandidates.filter((c) => c.currentStageKey === 'offer').length
      return enrichedCandidates.length
    })() : enrichedCandidates.length
    const conversionRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0
    return { ...stage, count, conversionRate }
  })

  // Filtered candidates for Section 3
  const filteredCandidates = selectedFunnelStage
    ? enrichedCandidates.filter((c) => {
        const o = STAGE_ORDER[c.currentStageKey] ?? 0
        if (selectedFunnelStage === 'active') return o <= 1
        if (selectedFunnelStage === 'interview') return o >= 2 && o <= 5
        if (selectedFunnelStage === 'offer') return c.currentStageKey === 'offer'
        if (selectedFunnelStage === 'hired') return c.currentStageKey === 'hired'
        return true
      })
    : enrichedCandidates

  // Weekly insights
  const avgShiboudo = enrichedCandidates.length > 0
    ? Math.round(enrichedCandidates.reduce((s, c) => s + c.shiboudo, 0) / enrichedCandidates.length)
    : 0
  const actionNeededCount = urgentCandidates.length
  const interviewsThisWeek = enrichedCandidates.reduce((count, c) => {
    const interviews = c.interviews || []
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    return count + interviews.filter((iv) =>
      iv.interview_date && new Date(iv.interview_date) >= weekStart && new Date(iv.interview_date) < weekEnd
    ).length
  }, 0)

  // Top movers
  const shiboudoSorted = [...enrichedCandidates].sort((a, b) => Math.abs(b.shiboudo - 50) - Math.abs(a.shiboudo - 50))
  const top3Volatile = shiboudoSorted.slice(0, 3)
  const risingCandidates = enrichedCandidates.filter((c) => c.acceptProb >= 65).slice(0, 3)
  const decliningCandidates = enrichedCandidates.filter((c) => c.shiboudo < 45).slice(0, 3)
  const focusCandidate = urgentCandidates[0] || enrichedCandidates[0]

  // Today's date
  const today = new Date()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()]
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${dayOfWeek}）`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Journey Decision Center</h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ═══ Header ═══ */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Journey Decision Center
              </h1>
              <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
            </div>
          </div>

          {/* Global Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">承諾予測スコア平均</p>
                  <p className="text-2xl font-bold text-gray-900">{avgShiboudo}<span className="text-sm font-normal text-gray-400 ml-0.5">/ 100</span></p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionNeededCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                  <AlertTriangle className={`w-5 h-5 ${actionNeededCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">要アクション候補者数</p>
                  <p className={`text-2xl font-bold ${actionNeededCount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {actionNeededCount}<span className="text-sm font-normal text-gray-400 ml-0.5">人</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">今週の面接数</p>
                  <p className="text-2xl font-bold text-gray-900">{interviewsThisWeek}<span className="text-sm font-normal text-gray-400 ml-0.5">件</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Section 1: Urgent Actions ═══ */}
        {urgentCandidates.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-gray-900">今すぐ対応が必要</h2>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                {urgentCandidates.length}
              </span>
            </div>
            <div className="space-y-3">
              {urgentCandidates.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-rose-100 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full ${getAvatarColor(c.full_name)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-sm font-bold text-white">{getInitials(c.full_name)}</span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Link
                          href={`/candidates/${c.id}`}
                          className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {c.full_name}
                        </Link>
                        <span className="text-[11px] text-gray-400">{c.jobTitle}</span>
                      </div>

                      {/* Mini timeline */}
                      <div className="mb-2">
                        <MiniJourneyTimeline currentStageKey={c.currentStageKey} completedStages={c.completedStages} />
                      </div>

                      {/* Alert reason */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-rose-600">{c.alertReason}</span>
                        <span className="text-[10px] text-gray-400 ml-2">
                          <Clock className="w-3 h-3 inline mr-0.5" />
                          {c.lastContactDays}日前
                        </span>
                      </div>

                      {/* Score bar (shiboudo) */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-gray-500 w-12">志望度</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.shiboudo >= 70 ? 'bg-emerald-500' : c.shiboudo >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${c.shiboudo}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold min-w-[28px] text-right ${
                          c.shiboudo >= 70 ? 'text-emerald-600' : c.shiboudo >= 40 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {c.shiboudo}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    {c.recommendedAction && (
                      <Link
                        href={c.recommendedAction.href}
                        className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {c.recommendedAction.label}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Section 2: Journey Funnel ═══ */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900">ジャーニー全体像</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-center gap-0">
              {funnelData.map((stage, idx) => (
                <div key={stage.key} className="flex items-center">
                  <button
                    onClick={() => setSelectedFunnelStage(selectedFunnelStage === stage.key ? null : stage.key)}
                    className={`relative flex flex-col items-center px-8 py-4 rounded-2xl transition-all cursor-pointer ${
                      selectedFunnelStage === stage.key
                        ? 'bg-indigo-50 ring-2 ring-indigo-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-3xl font-bold text-gray-900">{stage.count}</span>
                    <span className="text-xs font-medium text-gray-500 mt-1">{stage.label}</span>
                    {idx > 0 && stage.conversionRate > 0 && (
                      <span className="text-[10px] text-indigo-500 font-medium mt-1">
                        {stage.conversionRate}%通過
                      </span>
                    )}
                  </button>
                  {idx < funnelData.length - 1 && (
                    <div className="flex-shrink-0 mx-1">
                      <svg width="28" height="28" viewBox="0 0 28 28" className="text-gray-300">
                        <path d="M8 6 L20 14 L8 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedFunnelStage && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <button
                  onClick={() => setSelectedFunnelStage(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  フィルターを解除
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Section 3: Active Candidate Journeys ═══ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-gray-900">候補者ジャーニー</h2>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                {filteredCandidates.length}名
              </span>
            </div>
            {selectedFunnelStage && (
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                {FUNNEL_STAGES.find((s) => s.key === selectedFunnelStage)?.label}でフィルター中
              </span>
            )}
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">該当する候補者がいません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCandidates.slice(0, 12).map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(c.full_name)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-sm font-bold text-white">{getInitials(c.full_name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/candidates/${c.id}`}
                        className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {c.full_name}
                      </Link>
                      <p className="text-[11px] text-gray-400 truncate">{c.jobTitle}</p>
                    </div>
                    <Link
                      href={`/candidates/${c.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>

                  {/* Mini timeline */}
                  <div className="mb-3">
                    <MiniJourneyTimeline currentStageKey={c.currentStageKey} completedStages={c.completedStages} />
                  </div>

                  {/* Scores */}
                  <div className="space-y-1.5 mb-3">
                    <ScoreGauge value={c.shiboudo} label="志望度" />
                    <ScoreGauge value={c.fuando} label="不安度" colorClass={c.fuando >= 60 ? 'bg-rose-400' : c.fuando >= 30 ? 'bg-amber-300' : 'bg-emerald-400'} />
                    <ScoreGauge value={c.acceptProb} label="承諾率" />
                  </div>

                  {/* Next event */}
                  {c.nextEvent && (
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] text-violet-600 bg-violet-50 px-2.5 py-1.5 rounded-lg">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{c.nextEvent}</span>
                    </div>
                  )}

                  {/* AI suggestion */}
                  <div className="flex items-start gap-1.5 mb-3 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    <Sparkles className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{c.aiSuggestion}</span>
                  </div>

                  {/* CTA */}
                  {c.recommendedAction && (
                    <Link
                      href={c.recommendedAction.href}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {c.recommendedAction.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {filteredCandidates.length > 12 && (
            <div className="mt-4 text-center">
              <Link
                href="/candidates"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                すべての候補者を見る ({filteredCandidates.length}名) →
              </Link>
            </div>
          )}
        </div>

        {/* ═══ Section 4: Weekly Insights ═══ */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">週次インサイト</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Volatile candidates */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-gray-700">志望度の変動が大きい TOP3</h3>
              </div>
              {top3Volatile.length > 0 ? (
                <div className="space-y-2.5">
                  {top3Volatile.map((c) => (
                    <Link key={c.id} href={`/candidates/${c.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(c.full_name)} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white">{getInitials(c.full_name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{c.full_name}</p>
                        <p className="text-[10px] text-gray-400">志望度 {c.shiboudo}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">データなし</p>
              )}
            </div>

            {/* Rising acceptance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-gray-700">承諾確率が高い候補者</h3>
              </div>
              {risingCandidates.length > 0 ? (
                <div className="space-y-2.5">
                  {risingCandidates.map((c) => (
                    <Link key={c.id} href={`/candidates/${c.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(c.full_name)} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white">{getInitials(c.full_name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{c.full_name}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">承諾率 {c.acceptProb}%</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">データなし</p>
              )}
            </div>

            {/* Declining */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-gray-700">志望度が低い候補者</h3>
              </div>
              {decliningCandidates.length > 0 ? (
                <div className="space-y-2.5">
                  {decliningCandidates.map((c) => (
                    <Link key={c.id} href={`/candidates/${c.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(c.full_name)} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white">{getInitials(c.full_name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{c.full_name}</p>
                        <p className="text-[10px] text-rose-600 font-medium">志望度 {c.shiboudo}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">該当なし</p>
              )}
            </div>

            {/* AI Focus recommendation */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-sm p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <h3 className="text-xs font-bold text-indigo-100">AI推奨：今週注力すべき候補者</h3>
              </div>
              {focusCandidate ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xs font-bold">{getInitials(focusCandidate.full_name)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{focusCandidate.full_name}</p>
                      <p className="text-[10px] text-indigo-200">{focusCandidate.jobTitle}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-100 mb-3 leading-relaxed">
                    {focusCandidate.aiSuggestion}
                  </p>
                  <Link
                    href={focusCandidate.recommendedAction?.href || `/candidates/${focusCandidate.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
                  >
                    アクションを実行
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-indigo-200">候補者データがありません</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
