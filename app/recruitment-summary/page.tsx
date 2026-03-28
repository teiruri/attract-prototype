'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileBarChart,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Lightbulb,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Minus,
} from 'lucide-react'

// ─── Constants ──────────────────────────────────────────────

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const STAGE_LABELS: Record<string, string> = {
  interview_1: '一次選考',
  interview_2: '二次選考',
  interview_3: '三次選考',
  interview_4: '四次選考',
  interview_final: '最終選考',
}

const FUNNEL_STAGES = [
  'application',
  'interview_1',
  'interview_2',
  'interview_3',
  'interview_final',
  'offer',
  'accepted',
] as const

const FUNNEL_LABELS: Record<string, string> = {
  application: '応募',
  interview_1: '一次選考',
  interview_2: '二次選考',
  interview_3: '三次選考',
  interview_final: '最終選考',
  offer: '内定',
  accepted: '承諾',
}

const FUNNEL_COLORS: Record<string, string> = {
  application: 'bg-indigo-500',
  interview_1: 'bg-blue-500',
  interview_2: 'bg-cyan-500',
  interview_3: 'bg-teal-500',
  interview_final: 'bg-emerald-500',
  offer: 'bg-amber-500',
  accepted: 'bg-rose-500',
}

const STAGE_ORDER: Record<string, number> = {
  interview_1: 1,
  interview_2: 2,
  interview_3: 3,
  interview_4: 4,
  interview_final: 5,
}

// ─── Types ──────────────────────────────────────────────────

interface Candidate {
  id: string
  full_name: string
  hiring_type: string
  status: string
  current_stage?: string
  job_id?: string
  created_at: string
  candidate_documents?: { id: string }[]
  interviews?: { id: string; stage: string; result: string }[]
}

interface Job {
  id: string
  title: string
  department?: string
  position_type?: string
  status?: string
  hiring_type?: string
  is_active?: boolean
}

interface Interview {
  id: string
  candidate_id: string
  job_id?: string
  stage: string
  interviewer_name?: string
  interviewer_role?: string
  interview_date?: string
  temperature_score?: number
  result?: string
  interviewer_evaluation?: {
    result?: string
    criteria?: Array<{ label: string; score: number }>
  }
  created_at: string
}

interface ProcessedData {
  candidates: Candidate[]
  jobs: Job[]
  interviews: Map<string, Interview[]> // candidateId -> interviews
  allInterviews: Interview[]
}

// ─── Data Fetching ──────────────────────────────────────────

async function fetchAllData(): Promise<ProcessedData> {
  const [candidatesRes, jobsRes] = await Promise.all([
    fetch(`/api/candidates?tenant_id=${TENANT_ID}`),
    fetch(`/api/jobs?tenant_id=${TENANT_ID}`),
  ])

  const { candidates = [] } = await candidatesRes.json()
  const { jobs = [] } = await jobsRes.json()

  // Fetch interviews for first 20 candidates
  const interviewMap = new Map<string, Interview[]>()
  const allInterviews: Interview[] = []

  const candidatesToFetch = candidates.slice(0, 20)
  const interviewResults = await Promise.all(
    candidatesToFetch.map((c: Candidate) =>
      fetch(`/api/candidates/${c.id}/interviews`)
        .then((r) => r.json())
        .then((data) => ({ candidateId: c.id, interviews: data.interviews || [] }))
        .catch(() => ({ candidateId: c.id, interviews: [] }))
    )
  )

  for (const result of interviewResults) {
    interviewMap.set(result.candidateId, result.interviews)
    allInterviews.push(...result.interviews)
  }

  return { candidates, jobs, interviews: interviewMap, allInterviews }
}

// ─── Calculation Helpers ────────────────────────────────────

function calcKPIs(data: ProcessedData) {
  const total = data.candidates.length
  const active = data.candidates.filter((c) => c.status === 'active').length
  const offered = data.candidates.filter(
    (c) =>
      c.status === 'offered' ||
      c.status === 'accepted' ||
      c.current_stage === 'interview_final'
  ).length

  // Avg days in pipeline
  const now = new Date()
  const daysArr: number[] = []

  for (const [candidateId, interviews] of data.interviews) {
    const candidate = data.candidates.find((c) => c.id === candidateId)
    if (!candidate) continue

    const createdAt = new Date(candidate.created_at)
    if (interviews.length > 0) {
      const sortedIv = [...interviews].sort(
        (a, b) =>
          new Date(b.interview_date || b.created_at).getTime() -
          new Date(a.interview_date || a.created_at).getTime()
      )
      const latestDate = new Date(sortedIv[0].interview_date || sortedIv[0].created_at)
      daysArr.push(
        Math.max(
          0,
          Math.floor((latestDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        )
      )
    } else {
      daysArr.push(
        Math.max(
          0,
          Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        )
      )
    }
  }

  let avgDays = 0
  if (daysArr.length > 0) {
    avgDays = Math.round(daysArr.reduce((s, v) => s + v, 0) / daysArr.length)
  }

  return { total, active, offered, avgDays }
}

function calcFunnel(data: ProcessedData) {
  const counts: Record<string, number> = {}

  // Every candidate counts as an application
  counts['application'] = data.candidates.length

  // Count candidates who reached each stage or beyond
  for (const candidate of data.candidates) {
    const candidateInterviews = data.interviews.get(candidate.id) || []
    const stagesReached = new Set<string>()

    // Add stages from interviews
    for (const iv of candidateInterviews) {
      stagesReached.add(iv.stage)
    }

    // Add current_stage
    if (candidate.current_stage) {
      stagesReached.add(candidate.current_stage)
    }

    // Determine highest stage reached
    let maxStageOrder = 0
    for (const stage of stagesReached) {
      const order = STAGE_ORDER[stage] || 0
      if (order > maxStageOrder) maxStageOrder = order
    }

    // Count cumulative: if they reached stage N, they passed all stages before
    if (maxStageOrder >= 1) counts['interview_1'] = (counts['interview_1'] || 0) + 1
    if (maxStageOrder >= 2) counts['interview_2'] = (counts['interview_2'] || 0) + 1
    if (maxStageOrder >= 3) counts['interview_3'] = (counts['interview_3'] || 0) + 1
    if (maxStageOrder >= 5) counts['interview_final'] = (counts['interview_final'] || 0) + 1

    // Offer / Accepted from status
    if (candidate.status === 'offered' || candidate.status === 'accepted') {
      counts['offer'] = (counts['offer'] || 0) + 1
    }
    if (candidate.status === 'accepted') {
      counts['accepted'] = (counts['accepted'] || 0) + 1
    }
  }

  return FUNNEL_STAGES.map((stage, idx) => {
    const count = counts[stage] || 0
    const prevCount = idx > 0 ? counts[FUNNEL_STAGES[idx - 1]] || 0 : 0
    const conversionRate =
      idx > 0 && prevCount > 0 ? Math.round((count / prevCount) * 100) : 100
    return {
      key: stage,
      label: FUNNEL_LABELS[stage],
      count,
      conversionRate,
      color: FUNNEL_COLORS[stage],
    }
  })
}

function calcJobStats(data: ProcessedData) {
  return data.jobs.map((job) => {
    const jobCandidates = data.candidates.filter((c) => c.job_id === job.id)
    const jobInterviews = data.allInterviews.filter((iv) => iv.job_id === job.id)

    // Stage distribution
    const stageDistribution: Record<string, number> = {}
    for (const c of jobCandidates) {
      const stage = c.current_stage || 'application'
      const label = STAGE_LABELS[stage] || '応募'
      stageDistribution[label] = (stageDistribution[label] || 0) + 1
    }

    // Average temperature score
    const temps = jobInterviews
      .filter((iv) => iv.temperature_score != null)
      .map((iv) => iv.temperature_score!)
    const avgTemp =
      temps.length > 0
        ? Math.round((temps.reduce((s, v) => s + v, 0) / temps.length) * 10) / 10
        : null

    return {
      job,
      candidateCount: jobCandidates.length,
      stageDistribution,
      avgTemperature: avgTemp,
    }
  })
}

function calcRatingDistribution(data: ProcessedData) {
  const ratings: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 }
  const criteriaScores: Record<string, { total: number; count: number }> = {}
  const interviewerCounts: Record<string, number> = {}

  for (const iv of data.allInterviews) {
    const evalResult = iv.interviewer_evaluation?.result || iv.result
    if (evalResult && evalResult in ratings) {
      ratings[evalResult]++
    }

    // Criteria scores
    const criteria = iv.interviewer_evaluation?.criteria
    if (criteria && Array.isArray(criteria)) {
      for (const c of criteria) {
        if (c.label && typeof c.score === 'number') {
          if (!criteriaScores[c.label]) {
            criteriaScores[c.label] = { total: 0, count: 0 }
          }
          criteriaScores[c.label].total += c.score
          criteriaScores[c.label].count++
        }
      }
    }

    // Interviewer counts
    if (iv.interviewer_name) {
      interviewerCounts[iv.interviewer_name] =
        (interviewerCounts[iv.interviewer_name] || 0) + 1
    }
  }

  const avgCriteria = Object.entries(criteriaScores).map(([label, d]) => ({
    label,
    avgScore: Math.round((d.total / d.count) * 10) / 10,
  }))

  const topInterviewers = Object.entries(interviewerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return { ratings, avgCriteria, topInterviewers }
}

function calcTemperatureTrend(data: ProcessedData) {
  const trending: {
    up: { name: string; from: number; to: number }[]
    down: { name: string; from: number; to: number }[]
  } = { up: [], down: [] }

  const stageAvgTemps: Record<string, { total: number; count: number }> = {}

  for (const [candidateId, interviews] of data.interviews) {
    const candidate = data.candidates.find((c) => c.id === candidateId)
    if (!candidate || interviews.length < 2) continue

    const sorted = [...interviews]
      .filter((iv) => iv.temperature_score != null)
      .sort((a, b) => (STAGE_ORDER[a.stage] || 0) - (STAGE_ORDER[b.stage] || 0))

    if (sorted.length >= 2) {
      const first = sorted[0].temperature_score!
      const last = sorted[sorted.length - 1].temperature_score!
      if (last > first) {
        trending.up.push({ name: candidate.full_name, from: first, to: last })
      } else if (last < first) {
        trending.down.push({ name: candidate.full_name, from: first, to: last })
      }
    }
  }

  // Average temperature per stage
  for (const iv of data.allInterviews) {
    if (iv.temperature_score != null && iv.stage) {
      const label = STAGE_LABELS[iv.stage] || iv.stage
      if (!stageAvgTemps[label]) {
        stageAvgTemps[label] = { total: 0, count: 0 }
      }
      stageAvgTemps[label].total += iv.temperature_score
      stageAvgTemps[label].count++
    }
  }

  const stageAverages = Object.entries(stageAvgTemps).map(([stage, d]) => ({
    stage,
    avg: Math.round((d.total / d.count) * 10) / 10,
  }))

  return { trending, stageAverages }
}

function generateInsights(
  kpis: ReturnType<typeof calcKPIs>,
  funnel: ReturnType<typeof calcFunnel>,
  ratingData: ReturnType<typeof calcRatingDistribution>,
  tempTrend: ReturnType<typeof calcTemperatureTrend>
) {
  const insights: { text: string; type: 'warning' | 'info' | 'success' }[] = []

  // Long pipeline
  if (kpis.avgDays > 30) {
    insights.push({
      text: `平均選考日数が${kpis.avgDays}日です。選考期間が長期化しています。スピードアップを検討してください。`,
      type: 'warning',
    })
  } else if (kpis.avgDays > 0 && kpis.avgDays <= 14) {
    insights.push({
      text: `平均選考日数が${kpis.avgDays}日と迅速です。この良い傾向を維持してください。`,
      type: 'success',
    })
  }

  // Low conversion from interview to offer
  const interviewStage = funnel.find((f) => f.key === 'interview_1')
  const offerStage = funnel.find((f) => f.key === 'offer')
  if (interviewStage && offerStage && interviewStage.count > 0) {
    const convRate = Math.round((offerStage.count / interviewStage.count) * 100)
    if (convRate < 30) {
      insights.push({
        text: `面接から内定への変換率が${convRate}%と低いです。面接準備シートの活用を推奨します。`,
        type: 'warning',
      })
    }
  }

  // Many C ratings
  const totalRatings =
    ratingData.ratings.S + ratingData.ratings.A + ratingData.ratings.B + ratingData.ratings.C
  if (totalRatings > 0) {
    const cRatio = Math.round((ratingData.ratings.C / totalRatings) * 100)
    if (cRatio > 30) {
      insights.push({
        text: `C評価が全体の${cRatio}%を占めています。ターゲット設定の見直しを検討してください。`,
        type: 'warning',
      })
    }
    if (ratingData.ratings.S > 0 || ratingData.ratings.A > 0) {
      const goodRatio = Math.round(
        ((ratingData.ratings.S + ratingData.ratings.A) / totalRatings) * 100
      )
      if (goodRatio > 50) {
        insights.push({
          text: `S/A評価が全体の${goodRatio}%と高水準です。良い母集団形成ができています。`,
          type: 'success',
        })
      }
    }
  }

  // Temperature dropping
  if (tempTrend.trending.down.length > 0) {
    insights.push({
      text: `志望度が低下傾向の候補者が${tempTrend.trending.down.length}名います。惹きつけメモの活用を推奨します。`,
      type: 'warning',
    })
  }

  if (tempTrend.trending.up.length > 0) {
    insights.push({
      text: `志望度が上昇傾向の候補者が${tempTrend.trending.up.length}名います。良い面接体験を提供できています。`,
      type: 'success',
    })
  }

  // If no data at all
  if (insights.length === 0) {
    insights.push({
      text: 'データが蓄積されると、ここに改善のヒントが表示されます。面接データの入力を進めましょう。',
      type: 'info',
    })
  }

  return insights
}

// ─── Main Component ─────────────────────────────────────────

export default function RecruitmentSummaryPage() {
  const [data, setData] = useState<ProcessedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string>('all')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchAllData()
      setData(result)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter data by selected job
  const filteredData = useMemo((): ProcessedData | null => {
    if (!data) return null
    if (selectedJobId === 'all') return data

    const filteredCandidates = data.candidates.filter(c => c.job_id === selectedJobId)
    const filteredCandidateIds = new Set(filteredCandidates.map(c => c.id))

    const filteredInterviewMap = new Map<string, Interview[]>()
    const filteredAllInterviews: Interview[] = []
    for (const [candidateId, interviews] of data.interviews) {
      if (filteredCandidateIds.has(candidateId)) {
        filteredInterviewMap.set(candidateId, interviews)
        filteredAllInterviews.push(...interviews)
      }
    }

    return {
      candidates: filteredCandidates,
      jobs: data.jobs, // keep all jobs for the dropdown
      interviews: filteredInterviewMap,
      allInterviews: filteredAllInterviews,
    }
  }, [data, selectedJobId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-600 font-medium">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium mb-2">データの読み込みに失敗しました</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || (data.candidates.length === 0 && data.jobs.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Header />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <FileBarChart className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              データがまだありません
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              採用レポートを表示するには、まず求人を作成し候補者を登録してください。
            </p>
            <div className="flex gap-3">
              <a
                href="/jobs"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                求人を作成する
              </a>
              <a
                href="/candidates"
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                候補者を登録する
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeData = filteredData || data
  const kpis = calcKPIs(activeData)
  const funnel = calcFunnel(activeData)
  const jobStats = calcJobStats(activeData)
  const ratingData = calcRatingDistribution(activeData)
  const tempTrend = calcTemperatureTrend(activeData)
  const insights = generateInsights(kpis, funnel, ratingData, tempTrend)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />

        {/* Job Filter */}
        {data.jobs.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">表示する求人:</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm min-w-[200px]"
            >
              <option value="all">すべての求人</option>
              {data.jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}{job.department ? ` (${job.department})` : ''}</option>
              ))}
            </select>
            {selectedJobId !== 'all' && (
              <button
                onClick={() => setSelectedJobId('all')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                フィルター解除
              </button>
            )}
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: KPI */}
          <KPISection kpis={kpis} />

          {/* Section 2: Funnel */}
          <FunnelSection funnel={funnel} />

          {/* Section 3: Job Stats */}
          {jobStats.length > 0 && <JobStatsSection jobStats={jobStats} />}

          {/* Section 4: Rating Distribution */}
          {data.allInterviews.length > 0 && (
            <RatingSection ratingData={ratingData} />
          )}

          {/* Section 5: Temperature Trend */}
          {(tempTrend.trending.up.length > 0 ||
            tempTrend.trending.down.length > 0 ||
            tempTrend.stageAverages.length > 0) && (
            <TemperatureTrendSection tempTrend={tempTrend} />
          )}

          {/* Section 6: Insights */}
          <InsightsSection insights={insights} />
        </div>
      </div>
    </div>
  )
}

// ─── Sub Components ─────────────────────────────────────────

function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <FileBarChart className="w-8 h-8 text-indigo-600" />
        採用レポート
      </h1>
      <p className="mt-2 text-gray-500 text-lg">
        採用活動の全体像をリアルタイムで把握し、改善アクションにつなげます
      </p>
    </div>
  )
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-indigo-600">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
  )
}

function KPISection({ kpis }: { kpis: ReturnType<typeof calcKPIs> }) {
  return (
    <section>
      <SectionHeading
        icon={<TrendingUp className="w-6 h-6" />}
        title="採用KPI"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500">総候補者数</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {kpis.total}
            <span className="text-base font-normal text-gray-400 ml-1">名</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            <span className="text-xs font-medium text-gray-500">選考中</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {kpis.active}
            <span className="text-base font-normal text-gray-400 ml-1">名</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500">内定者数</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {kpis.offered}
            <span className="text-base font-normal text-gray-400 ml-1">名</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 ring-1 ring-indigo-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-medium text-gray-500">平均選考日数</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            {kpis.avgDays}
            <span className="text-base font-normal text-indigo-400 ml-1">日</span>
          </p>
        </div>
      </div>
    </section>
  )
}

function FunnelSection({
  funnel,
}: {
  funnel: ReturnType<typeof calcFunnel>
}) {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1)

  return (
    <section>
      <SectionHeading
        icon={<TrendingUp className="w-6 h-6" />}
        title="選考ファネル"
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-3">
          {funnel.map((stage, idx) => {
            const widthPct = Math.max((stage.count / maxCount) * 100, 4)
            return (
              <div key={stage.key}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-24 flex-shrink-0">
                    {stage.label}
                  </span>
                  <div className="flex-1 relative">
                    <div
                      className={`h-8 rounded-lg ${stage.color} transition-all duration-700 flex items-center px-3`}
                      style={{ width: `${widthPct}%`, minWidth: '40px' }}
                    >
                      <span className="text-white text-sm font-bold">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  {idx > 0 && (
                    <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
                      {stage.conversionRate}%
                    </span>
                  )}
                </div>
                {idx < funnel.length - 1 && (
                  <div className="flex items-center ml-24 pl-3 py-0.5">
                    <ArrowRight className="w-3 h-3 text-gray-300 rotate-90" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            通過率 = 各ステージに到達した候補者数 / 前ステージの候補者数
          </p>
        </div>
      </div>
    </section>
  )
}

function JobStatsSection({
  jobStats,
}: {
  jobStats: ReturnType<typeof calcJobStats>
}) {
  return (
    <section>
      <SectionHeading
        icon={<Briefcase className="w-6 h-6" />}
        title="求人別の採用状況"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {jobStats.map(({ job, candidateCount, stageDistribution, avgTemperature }) => {
          const totalInStages = Object.values(stageDistribution).reduce(
            (s, v) => s + v,
            0
          )
          const stageColors = [
            'bg-indigo-500',
            'bg-blue-500',
            'bg-cyan-500',
            'bg-emerald-500',
            'bg-amber-500',
            'bg-rose-500',
          ]
          const stageEntries = Object.entries(stageDistribution)

          return (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-gray-900">{job.title}</h4>
                  {job.department && (
                    <span className="text-xs text-gray-500">{job.department}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {candidateCount}名
                </span>
              </div>

              {/* Stage distribution bar */}
              {totalInStages > 0 && (
                <div className="mb-3">
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                    {stageEntries.map(([label, count], i) => (
                      <div
                        key={label}
                        className={`${stageColors[i % stageColors.length]} transition-all`}
                        style={{
                          width: `${(count / totalInStages) * 100}%`,
                        }}
                        title={`${label}: ${count}名`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {stageEntries.map(([label, count], i) => (
                      <span key={label} className="flex items-center gap-1 text-xs text-gray-500">
                        <span
                          className={`w-2 h-2 rounded-full ${stageColors[i % stageColors.length]}`}
                        />
                        {label} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {avgTemperature !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">平均志望度:</span>
                  <span
                    className={`font-bold ${
                      avgTemperature >= 7
                        ? 'text-emerald-600'
                        : avgTemperature >= 5
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {avgTemperature}/10
                  </span>
                </div>
              )}

              {candidateCount === 0 && (
                <p className="text-sm text-gray-400">候補者がまだいません</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function RatingSection({
  ratingData,
}: {
  ratingData: ReturnType<typeof calcRatingDistribution>
}) {
  const { ratings, avgCriteria, topInterviewers } = ratingData
  const totalRatings = ratings.S + ratings.A + ratings.B + ratings.C

  const ratingConfig = [
    { key: 'S', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { key: 'A', color: 'bg-blue-500', textColor: 'text-blue-700' },
    { key: 'B', color: 'bg-amber-500', textColor: 'text-amber-700' },
    { key: 'C', color: 'bg-red-500', textColor: 'text-red-700' },
  ]

  return (
    <section>
      <SectionHeading
        icon={<CheckCircle className="w-6 h-6" />}
        title="面接評価の傾向"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">評価分布</h4>
          {totalRatings > 0 ? (
            <>
              {/* Donut-style ring using stacked horizontal bar */}
              <div className="flex h-6 rounded-full overflow-hidden bg-gray-100 mb-4">
                {ratingConfig.map(({ key, color }) => {
                  const count = ratings[key as keyof typeof ratings]
                  if (count === 0) return null
                  return (
                    <div
                      key={key}
                      className={`${color} transition-all`}
                      style={{ width: `${(count / totalRatings) * 100}%` }}
                    />
                  )
                })}
              </div>
              <div className="space-y-2">
                {ratingConfig.map(({ key, color, textColor }) => {
                  const count = ratings[key as keyof typeof ratings]
                  const pct =
                    totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${color}`} />
                        <span className={`text-sm font-bold ${textColor}`}>{key}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {count}件 ({pct}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">評価データがありません</p>
          )}
        </div>

        {/* Average Criteria Scores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            平均評価スコア（項目別）
          </h4>
          {avgCriteria.length > 0 ? (
            <div className="space-y-3">
              {avgCriteria.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{c.label}</span>
                    <span className="text-gray-500">{c.avgScore}/5</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${(c.avgScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              評価項目のデータがありません
            </p>
          )}
        </div>

        {/* Top Interviewers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            面接官別 評価件数
          </h4>
          {topInterviewers.length > 0 ? (
            <div className="space-y-3">
              {topInterviewers.map((interviewer, idx) => (
                <div
                  key={interviewer.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {interviewer.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{interviewer.count}件</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">面接官データがありません</p>
          )}
        </div>
      </div>
    </section>
  )
}

function TemperatureTrendSection({
  tempTrend,
}: {
  tempTrend: ReturnType<typeof calcTemperatureTrend>
}) {
  const { trending, stageAverages } = tempTrend

  return (
    <section>
      <SectionHeading
        icon={<TrendingUp className="w-6 h-6" />}
        title="志望度トレンド"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {/* Up trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            上昇傾向 ({trending.up.length}名)
          </h4>
          {trending.up.length > 0 ? (
            <div className="space-y-2">
              {trending.up.slice(0, 5).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">
                    {item.from} → {item.to}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">該当なし</p>
          )}
        </div>

        {/* Down trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            低下傾向 ({trending.down.length}名)
          </h4>
          {trending.down.length > 0 ? (
            <div className="space-y-2">
              {trending.down.slice(0, 5).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                  <span className="text-xs text-red-600 font-bold">
                    {item.from} → {item.to}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">該当なし</p>
          )}
        </div>

        {/* Stage averages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Minus className="w-4 h-4 text-indigo-500" />
            ステージ別 平均志望度
          </h4>
          {stageAverages.length > 0 ? (
            <div className="space-y-3">
              {stageAverages.map((item) => (
                <div key={item.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.stage}</span>
                    <span className="text-gray-500">{item.avg}/10</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.avg >= 7
                          ? 'bg-emerald-500'
                          : item.avg >= 5
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(item.avg / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">データがありません</p>
          )}
        </div>
      </div>
    </section>
  )
}

function InsightsSection({
  insights,
}: {
  insights: ReturnType<typeof generateInsights>
}) {
  const iconMap = {
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
    info: <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />,
  }

  const borderMap = {
    warning: 'border-l-amber-500 bg-amber-50',
    info: 'border-l-blue-500 bg-blue-50',
    success: 'border-l-emerald-500 bg-emerald-50',
  }

  return (
    <section>
      <SectionHeading
        icon={<Lightbulb className="w-6 h-6" />}
        title="改善のヒント"
      />
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`rounded-xl border-l-4 p-4 flex items-start gap-3 ${borderMap[insight.type]}`}
          >
            {iconMap[insight.type]}
            <p className="text-sm font-medium text-gray-800">{insight.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
