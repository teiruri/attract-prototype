import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const STAGE_ORDER: Record<string, number> = {
  casual: 0,
  briefing: 1,
  es: 2,
  aptitude: 3,
  gd: 4,
  interview_1: 5,
  interview_2: 6,
  interview_3: 7,
  interview_final: 8,
  offer: 9,
  hired: 10,
}

interface InterviewRow {
  id: string
  stage: string
  result: string
  temperature_score: number | null
  interview_date: string | null
  interview_text: string | null
  candidate_survey: Record<string, unknown> | null
  interviewer_evaluation: {
    result?: string
    criteria?: Array<{ label: string; score: number }>
  } | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function getTrend(values: number[]): 'rising' | 'stable' | 'falling' {
  if (values.length < 2) return 'stable'
  const recent = values.slice(-2)
  const diff = recent[1] - recent[0]
  if (diff > 5) return 'rising'
  if (diff < -5) return 'falling'
  return 'stable'
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.abs(Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)))
}

// 候補者スコア算出API
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = createServerClient()
    const { id } = await context.params

    // Fetch candidate
    const { data: candidate, error: candError } = await db
      .from('candidates')
      .select('*, candidate_documents(*)')
      .eq('id', id)
      .single()

    if (candError) {
      if (candError.code === 'PGRST116') {
        return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
      }
      return NextResponse.json({ error: candError.message }, { status: 500 })
    }

    // Fetch interviews ordered by date
    const { data: interviews, error: ivError } = await db
      .from('interviews')
      .select('*')
      .eq('candidate_id', id)
      .order('interview_date', { ascending: true })

    if (ivError) {
      return NextResponse.json({ error: ivError.message }, { status: 500 })
    }

    const ivList: InterviewRow[] = interviews || []

    // Fetch job data if available
    let job: Record<string, unknown> | null = null
    if (candidate.job_id) {
      const { data: jobData } = await db
        .from('jobs')
        .select('*')
        .eq('id', candidate.job_id)
        .single()
      job = jobData
    }

    // Sort interviews by stage order
    const sortedInterviews = [...ivList].sort(
      (a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99)
    )

    // Completed interviews (with result that is not pending)
    const completedInterviews = sortedInterviews.filter((iv) => {
      const r = iv.interviewer_evaluation?.result || iv.result
      return r && r !== 'pending'
    })

    // Temperature scores in chronological order
    const temperatureScores = sortedInterviews
      .filter((iv) => iv.temperature_score != null)
      .map((iv) => iv.temperature_score as number)

    // --- 志望度スコア (motivation_score): 0-100 ---
    let motivationScore = 50

    if (temperatureScores.length > 0) {
      // Base from average temperature_score (scale 1-10) * 10
      const avgTemp = temperatureScores.reduce((sum, s) => sum + s, 0) / temperatureScores.length
      motivationScore = avgTemp * 10
    }

    // Boost if candidate mentioned company positively in interview text
    const allInterviewText = sortedInterviews
      .map((iv) => iv.interview_text || '')
      .join(' ')
      .toLowerCase()

    const positiveKeywords = ['魅力', '第一志望', '御社', '入社したい', '志望度が高い', '惹かれ', '共感', 'やりがい']
    const positiveMatches = positiveKeywords.filter((kw) => allInterviewText.includes(kw))
    if (positiveMatches.length > 0) {
      motivationScore += Math.min(positiveMatches.length * 3, 15)
    }

    // Decrease if long gaps between touchpoints
    const datesWithInterviews = sortedInterviews
      .filter((iv) => iv.interview_date)
      .map((iv) => iv.interview_date as string)

    if (datesWithInterviews.length >= 2) {
      const lastGap = daysBetween(
        datesWithInterviews[datesWithInterviews.length - 2],
        datesWithInterviews[datesWithInterviews.length - 1]
      )
      if (lastGap > 14) motivationScore -= 10
      else if (lastGap > 7) motivationScore -= 5
    }

    motivationScore = clamp(motivationScore, 0, 100)

    // --- 不安スコア (anxiety_score): 0-100 ---
    let anxietyScore = 50

    // High if few interviews completed
    if (completedInterviews.length === 0) {
      anxietyScore += 20
    } else if (completedInterviews.length === 1) {
      anxietyScore += 10
    } else {
      anxietyScore -= completedInterviews.length * 5
    }

    // High if low temperature scores
    if (temperatureScores.length > 0) {
      const avgTemp = temperatureScores.reduce((sum, s) => sum + s, 0) / temperatureScores.length
      if (avgTemp < 5) anxietyScore += 20
      else if (avgTemp < 7) anxietyScore += 10
      else if (avgTemp >= 8) anxietyScore -= 15
    }

    // High if candidate has concerns in survey data
    for (const iv of sortedInterviews) {
      const survey = iv.candidate_survey
      if (survey) {
        const surveyStr = JSON.stringify(survey).toLowerCase()
        const concernKeywords = ['不安', '心配', '懸念', '迷い', '悩み', '不満']
        const hasConcerns = concernKeywords.some((kw) => surveyStr.includes(kw))
        if (hasConcerns) {
          anxietyScore += 10
          break
        }
      }
    }

    // Decrease with each positive interaction (good eval results)
    for (const iv of completedInterviews) {
      const evalResult = iv.interviewer_evaluation?.result || iv.result
      if (evalResult === 'S' || evalResult === 'A') {
        anxietyScore -= 5
      }
    }

    anxietyScore = clamp(anxietyScore, 0, 100)

    // --- 承諾確率 (acceptance_probability): 0-100 ---
    let acceptanceScore = 50

    // Based on motivation
    acceptanceScore += (motivationScore - 50) * 0.3

    // Based on interview results
    for (const iv of completedInterviews) {
      const evalResult = iv.interviewer_evaluation?.result || iv.result
      switch (evalResult) {
        case 'S': acceptanceScore += 10; break
        case 'A': acceptanceScore += 7; break
        case 'B': acceptanceScore -= 3; break
        case 'C': acceptanceScore -= 15; break
      }
    }

    // Higher if temperature trending upward across interviews
    if (temperatureScores.length >= 2) {
      const firstHalf = temperatureScores.slice(0, Math.ceil(temperatureScores.length / 2))
      const secondHalf = temperatureScores.slice(Math.ceil(temperatureScores.length / 2))
      const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
      if (secondAvg > firstAvg) {
        acceptanceScore += 10
      } else if (secondAvg < firstAvg) {
        acceptanceScore -= 10
      }
    }

    acceptanceScore = clamp(acceptanceScore, 0, 100)

    // --- マッチ度 (match_score): 0-100 ---
    let matchScore = 50

    // Based on interview evaluation criteria averages
    const allCriteriaScores: number[] = []
    for (const iv of completedInterviews) {
      const criteria = iv.interviewer_evaluation?.criteria
      if (criteria && criteria.length > 0) {
        for (const c of criteria) {
          if (typeof c.score === 'number') {
            allCriteriaScores.push(c.score)
          }
        }
      }
    }

    if (allCriteriaScores.length > 0) {
      // Assume criteria scores are on a 1-5 scale
      const avgCriteria = allCriteriaScores.reduce((s, v) => s + v, 0) / allCriteriaScores.length
      matchScore = (avgCriteria / 5) * 100
    } else {
      // Fallback: use eval results if no criteria
      for (const iv of completedInterviews) {
        const evalResult = iv.interviewer_evaluation?.result || iv.result
        switch (evalResult) {
          case 'S': matchScore += 12; break
          case 'A': matchScore += 8; break
          case 'B': matchScore -= 5; break
          case 'C': matchScore -= 15; break
        }
      }
    }

    matchScore = clamp(matchScore, 0, 100)

    // --- Trends ---
    // Build per-interview motivation snapshots for trend
    const motivationSnapshots: number[] = []
    for (const iv of sortedInterviews) {
      if (iv.temperature_score != null) {
        motivationSnapshots.push(iv.temperature_score * 10)
      }
    }

    // Build anxiety snapshots (inverse of confidence/positive signals)
    const anxietySnapshots: number[] = []
    let runningAnxiety = 60
    for (const iv of sortedInterviews) {
      const evalResult = iv.interviewer_evaluation?.result || iv.result
      if (evalResult === 'S' || evalResult === 'A') runningAnxiety -= 10
      else if (evalResult === 'C') runningAnxiety += 10
      if (iv.temperature_score != null && iv.temperature_score >= 8) runningAnxiety -= 5
      anxietySnapshots.push(clamp(runningAnxiety, 0, 100))
    }

    // Acceptance snapshots
    const acceptanceSnapshots: number[] = []
    let runningAcceptance = 50
    for (const iv of sortedInterviews) {
      if (iv.temperature_score != null) {
        runningAcceptance += (iv.temperature_score - 5) * 3
      }
      const evalResult = iv.interviewer_evaluation?.result || iv.result
      if (evalResult === 'S') runningAcceptance += 8
      else if (evalResult === 'A') runningAcceptance += 5
      else if (evalResult === 'C') runningAcceptance -= 10
      acceptanceSnapshots.push(clamp(runningAcceptance, 0, 100))
    }

    // --- Last contact days ---
    let lastContactDays = 0
    if (datesWithInterviews.length > 0) {
      const lastDate = datesWithInterviews[datesWithInterviews.length - 1]
      const now = new Date()
      lastContactDays = Math.floor(
        (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (lastContactDays < 0) lastContactDays = 0
    }

    return NextResponse.json({
      scores: {
        motivation: motivationScore,
        anxiety: anxietyScore,
        acceptance: acceptanceScore,
        match: matchScore,
      },
      trend: {
        motivation: getTrend(motivationSnapshots),
        anxiety: getTrend(anxietySnapshots),
        acceptance: getTrend(acceptanceSnapshots),
      },
      last_contact_days: lastContactDays,
      touchpoint_count: ivList.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
