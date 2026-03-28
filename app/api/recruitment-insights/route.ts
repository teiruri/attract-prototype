import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const STAGES = [
  { key: 'application', label: '応募' },
  { key: 'interview_1', label: '一次面接' },
  { key: 'interview_2', label: '二次面接' },
  { key: 'interview_final', label: '最終面接' },
  { key: 'offer', label: '内定' },
  { key: 'hired', label: '承諾' },
] as const

interface Insight {
  type: 'critical' | 'warning' | 'info' | 'alert'
  area: string
  title: string
  message: string
  suggestion?: string
  related_action?: string
}

interface Interview {
  id: string
  candidate_id: string
  job_id: string
  stage: string
  result: string
  temperature_score: number | null
  interview_date: string | null
  interviewer_evaluation: Record<string, unknown> | null
  candidate_survey: Record<string, unknown> | null
}

interface Candidate {
  id: string
  job_id: string
  status: string
  current_stage: string | null
  created_at: string
  interviews: Interview[]
  jobs?: { id: string; title: string } | null
}

export async function GET(req: NextRequest) {
  try {
    const db = createServerClient()
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenant_id') || TENANT_ID
    const jobId = searchParams.get('job_id') // optional filter

    // Fetch all candidates with their interviews and job info
    let query = db
      .from('candidates')
      .select('id, job_id, status, current_stage, created_at, interviews(id, candidate_id, job_id, stage, result, temperature_score, interview_date, interviewer_evaluation, candidate_survey), jobs(id, title)')
      .eq('tenant_id', tenantId)

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data: candidates, error: candError } = await query

    if (candError) {
      return NextResponse.json({ error: candError.message }, { status: 500 })
    }

    const allCandidates = (candidates || []) as unknown as Candidate[]

    // Build overall funnel
    const funnel = buildFunnel(allCandidates)
    const conversions = buildConversions(funnel)

    // Build per-job funnel
    const jobMap = new Map<string, { title: string; candidates: Candidate[] }>()
    for (const c of allCandidates) {
      if (!c.job_id) continue
      if (!jobMap.has(c.job_id)) {
        const jobTitle = (c.jobs as { id: string; title: string } | null)?.title || '不明な求人'
        jobMap.set(c.job_id, { title: jobTitle, candidates: [] })
      }
      jobMap.get(c.job_id)!.candidates.push(c)
    }

    const perJob = Array.from(jobMap.entries()).map(([jobId, { title, candidates: jobCandidates }]) => {
      const jFunnel = buildFunnel(jobCandidates)
      const allInterviews = jobCandidates.flatMap(c => c.interviews || [])
      const tempScores = allInterviews
        .map(i => i.temperature_score)
        .filter((s): s is number => s != null)
      const avgTemp = tempScores.length > 0
        ? Math.round((tempScores.reduce((a, b) => a + b, 0) / tempScores.length) * 10) / 10
        : null

      const avgDays = calcAvgDaysInPipeline(jobCandidates)
      const jConversions = buildConversions(jFunnel)
      const topIssue = findTopIssue(jConversions)

      return {
        job_id: jobId,
        job_title: title,
        funnel: jFunnel,
        avg_temperature: avgTemp,
        avg_days: avgDays,
        top_issue: topIssue,
      }
    })

    // Generate insights
    const insights = generateInsights(allCandidates, conversions, perJob)

    // Survey summary
    const surveySummary = buildSurveySummary(allCandidates)

    // Summary
    const allInterviews = allCandidates.flatMap(c => c.interviews || [])
    const allTemps = allInterviews
      .map(i => i.temperature_score)
      .filter((s): s is number => s != null)
    const avgTemperature = allTemps.length > 0
      ? Math.round((allTemps.reduce((a, b) => a + b, 0) / allTemps.length) * 10) / 10
      : null

    const avgDaysInPipeline = calcAvgDaysInPipeline(allCandidates)

    const hiredCount = funnel.find(s => s.key === 'hired')?.count || 0
    const totalCount = funnel.find(s => s.key === 'application')?.count || 0
    const overallConversion = totalCount > 0
      ? Math.round((hiredCount / totalCount) * 1000) / 10
      : 0

    return NextResponse.json({
      funnel: {
        stages: funnel,
        conversions,
      },
      per_job: perJob,
      insights,
      survey_summary: surveySummary,
      summary: {
        total_candidates: totalCount,
        avg_days_in_pipeline: avgDaysInPipeline,
        overall_conversion: overallConversion,
        avg_temperature: avgTemperature,
      },
    })
  } catch (err) {
    console.error('recruitment-insights error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFunnel(candidates: Candidate[]) {
  const total = candidates.length

  const withInterview1 = candidates.filter(c =>
    (c.interviews || []).some(i => i.stage === 'interview_1')
  ).length

  const withInterview2 = candidates.filter(c =>
    (c.interviews || []).some(i => i.stage === 'interview_2')
  ).length

  const withInterviewFinal = candidates.filter(c =>
    (c.interviews || []).some(i => i.stage === 'interview_final')
  ).length

  const offered = candidates.filter(c =>
    c.status === 'offered' || c.current_stage === 'offer'
  ).length

  const hired = candidates.filter(c =>
    c.status === 'hired' || c.current_stage === 'hired'
  ).length

  return [
    { key: 'application', label: '応募', count: total },
    { key: 'interview_1', label: '一次面接', count: withInterview1 },
    { key: 'interview_2', label: '二次面接', count: withInterview2 },
    { key: 'interview_final', label: '最終面接', count: withInterviewFinal },
    { key: 'offer', label: '内定', count: offered },
    { key: 'hired', label: '承諾', count: hired },
  ]
}

function buildConversions(funnel: { key: string; label: string; count: number }[]) {
  const conversions: { from: string; to: string; rate: number }[] = []
  for (let i = 0; i < funnel.length - 1; i++) {
    const from = funnel[i]
    const to = funnel[i + 1]
    const rate = from.count > 0
      ? Math.round((to.count / from.count) * 1000) / 10
      : 0
    conversions.push({ from: from.label, to: to.label, rate })
  }
  return conversions
}

function calcAvgDaysInPipeline(candidates: Candidate[]): number {
  const now = new Date()
  const days = candidates
    .map(c => {
      if (!c.created_at) return null
      const created = new Date(c.created_at)
      return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    })
    .filter((d): d is number => d != null)

  if (days.length === 0) return 0
  return Math.round(days.reduce((a, b) => a + b, 0) / days.length)
}

function findTopIssue(conversions: { from: string; to: string; rate: number }[]): string | null {
  let worstRate = 100
  let worstConversion: { from: string; to: string; rate: number } | null = null
  for (const c of conversions) {
    if (c.rate < worstRate) {
      worstRate = c.rate
      worstConversion = c
    }
  }
  if (worstConversion && worstRate < 50) {
    return `${worstConversion.from}→${worstConversion.to}の通過率が低い（${worstConversion.rate}%）`
  }
  return null
}

function generateInsights(
  candidates: Candidate[],
  conversions: { from: string; to: string; rate: number }[],
  perJob: { job_id: string; job_title: string; avg_temperature: number | null; avg_days: number | null }[]
): Insight[] {
  const insights: Insight[] = []

  // Rule 1: 応募→一次 conversion < 50%
  const appToFirst = conversions.find(c => c.from === '応募' && c.to === '一次面接')
  if (appToFirst && appToFirst.rate < 50) {
    insights.push({
      type: 'warning',
      area: '書類選考',
      title: '書類通過率が低下しています',
      message: '書類通過率が低いです。求人要件が厳しすぎるか、ターゲティングの見直しを検討してください。',
      suggestion: '求人設計の必須要件を見直す',
      related_action: '/jobs',
    })
  }

  // Rule 2: 一次→二次 conversion < 50%
  const firstToSecond = conversions.find(c => c.from === '一次面接' && c.to === '二次面接')
  if (firstToSecond && firstToSecond.rate < 50) {
    insights.push({
      type: 'warning',
      area: '一次面接',
      title: '一次面接の通過率が低下しています',
      message: '一次面接の通過率が低いです。面接準備シートの活用状況を確認してください。',
      suggestion: '面接準備シートを全面接官に配布する',
      related_action: '/candidates',
    })
  }

  // Rule 3: temperature_score < 6 per stage
  const allInterviews = candidates.flatMap(c => c.interviews || [])
  const stageTemps = new Map<string, number[]>()
  for (const iv of allInterviews) {
    if (iv.temperature_score != null) {
      if (!stageTemps.has(iv.stage)) stageTemps.set(iv.stage, [])
      stageTemps.get(iv.stage)!.push(iv.temperature_score)
    }
  }
  const stageLabels: Record<string, string> = {
    interview_1: '一次面接',
    interview_2: '二次面接',
    interview_final: '最終面接',
  }
  for (const [stage, temps] of stageTemps.entries()) {
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length
    if (avg < 6) {
      const label = stageLabels[stage] || stage
      insights.push({
        type: 'alert',
        area: label,
        title: `${label}での志望度が低い傾向です`,
        message: '志望度が低い傾向です。惹きつけメモの活用を推奨します。',
        related_action: '/candidates',
      })
    }
  }

  // Rule 4: 内定→承諾 conversion < 70%
  const offerToHired = conversions.find(c => c.from === '内定' && c.to === '承諾')
  if (offerToHired && offerToHired.rate < 70) {
    insights.push({
      type: 'critical',
      area: '内定承諾',
      title: '内定承諾率が低下しています',
      message: '内定承諾率が低いです。通過・内定レターの活用と、フォロー施策の強化を検討してください。',
      related_action: '/candidates',
    })
  }

  // Rule 5: avg days in pipeline > 30
  const avgDays = calcAvgDaysInPipeline(candidates)
  if (avgDays > 30) {
    insights.push({
      type: 'warning',
      area: '選考スピード',
      title: '選考期間が長期化しています',
      message: '選考期間が長期化しています。各ステップの所要日数を短縮してください。',
      suggestion: '各選考ステップの目標日数を設定し、リマインダーを活用する',
      related_action: '/candidates',
    })
  }

  // Rule 6: C ratings > 30%
  const allEvals: string[] = []
  for (const iv of allInterviews) {
    const evalData = iv.interviewer_evaluation as Record<string, unknown> | null
    if (evalData) {
      const rating = evalData.rating || evalData.overall_rating || evalData.evaluation
      if (typeof rating === 'string') {
        allEvals.push(rating.toUpperCase())
      }
    }
  }
  if (allEvals.length > 0) {
    const cCount = allEvals.filter(e => e === 'C').length
    const cRate = cCount / allEvals.length
    if (cRate > 0.3) {
      insights.push({
        type: 'warning',
        area: '候補者品質',
        title: 'C評価の候補者が多い傾向です',
        message: 'C評価が多い求人があります。ターゲット設定やスカウト方法の見直しを検討してください。',
        suggestion: 'ターゲット人材の要件定義を見直し、スカウト文面を改善する',
        related_action: '/jobs',
      })
    }
  }

  return insights
}

// ---------------------------------------------------------------------------
// Survey Summary (keyword-based sentiment analysis)
// ---------------------------------------------------------------------------

const POSITIVE_KEYWORDS = ['魅力', '成長', 'やりがい', '楽しい', '良い', '素晴らしい', '期待', '共感', '安心', '挑戦']
const NEGATIVE_KEYWORDS = ['不安', '給与', '残業', '懸念', '心配', '他社', '迷い', '待遇', '離職', '厳しい']

function buildSurveySummary(candidates: Candidate[]) {
  const allInterviews = candidates.flatMap(c => c.interviews || [])

  // Collect interviews that have non-empty candidate_survey
  const surveyed = allInterviews.filter(iv => {
    if (!iv.candidate_survey) return false
    const survey = iv.candidate_survey
    if (typeof survey === 'object' && Object.keys(survey).length === 0) return false
    return true
  })

  const totalCollected = surveyed.length

  // Extract text from each survey for keyword scanning
  const surveyTexts = surveyed.map(iv => {
    const survey = iv.candidate_survey!
    if (typeof survey === 'string') return survey
    // Try raw_text field first, then stringify the whole object
    const rawText = (survey as Record<string, unknown>).raw_text
    if (typeof rawText === 'string') return rawText
    return JSON.stringify(survey)
  })

  // Count concerns (surveys containing any negative keyword)
  let withConcerns = 0
  const positiveHits = new Map<string, number>()
  const negativeHits = new Map<string, number>()

  for (const text of surveyTexts) {
    let hasConcern = false
    for (const kw of NEGATIVE_KEYWORDS) {
      if (text.includes(kw)) {
        hasConcern = true
        negativeHits.set(kw, (negativeHits.get(kw) || 0) + 1)
      }
    }
    if (hasConcern) withConcerns++

    for (const kw of POSITIVE_KEYWORDS) {
      if (text.includes(kw)) {
        positiveHits.set(kw, (positiveHits.get(kw) || 0) + 1)
      }
    }
  }

  // Sort by frequency and take top keywords
  const sortedPositive = Array.from(positiveHits.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw)
    .slice(0, 5)

  const sortedNegative = Array.from(negativeHits.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw)
    .slice(0, 5)

  return {
    total_collected: totalCollected,
    with_concerns: withConcerns,
    avg_sentiment_keywords: {
      positive: sortedPositive,
      negative: sortedNegative,
    },
  }
}
