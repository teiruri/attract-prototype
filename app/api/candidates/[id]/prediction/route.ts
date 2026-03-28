export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

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

const STAGE_LABELS: Record<string, string> = {
  casual: 'カジュアル面談',
  interview_1: '一次面接',
  interview_2: '二次面接',
  interview_3: '三次面接',
  interview_final: '最終面接',
  briefing: '説明会',
  es: 'ES選考',
  aptitude: '適性検査',
  gd: 'GD',
  offer: 'オファー',
  hired: '内定承諾',
}

interface Factor {
  label: string
  impact: string
  type: 'positive' | 'negative' | 'neutral'
}

interface InterviewRow {
  id: string
  stage: string
  result: string
  temperature_score: number | null
  interviewer_evaluation: {
    result?: string
    criteria?: Array<{ label: string; score: number }>
  } | null
  interview_date: string | null
}

function clampScore(score: number): number {
  return Math.max(5, Math.min(95, Math.round(score)))
}

function getConfidence(completedCount: number): 'low' | 'medium' | 'high' {
  if (completedCount >= 3) return 'high'
  if (completedCount >= 1) return 'medium'
  return 'low'
}

function getConfidenceLabel(c: 'low' | 'medium' | 'high'): string {
  return c === 'high' ? '高' : c === 'medium' ? '中' : '低'
}

function getCurrentStageLabel(interviews: InterviewRow[], candidateStage?: string): string {
  if (interviews.length === 0) return candidateStage ? (STAGE_LABELS[candidateStage] || '選考中') : '選考開始前'
  const sorted = [...interviews].sort(
    (a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99)
  )
  const latest = sorted[sorted.length - 1]
  const evalResult = latest.interviewer_evaluation?.result || latest.result
  if (evalResult && evalResult !== 'pending') {
    return `${STAGE_LABELS[latest.stage] || latest.stage}完了`
  }
  return `${STAGE_LABELS[latest.stage] || latest.stage}中`
}

function getEvalResult(iv: InterviewRow): string | null {
  return iv.interviewer_evaluation?.result || iv.result || null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = createServerClient()
    const { id } = await context.params

    // Fetch candidate with documents and interviews
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

    // Fetch interviews
    const { data: interviews, error: ivError } = await db
      .from('interviews')
      .select('*')
      .eq('candidate_id', id)
      .eq('tenant_id', TENANT_ID)
      .order('interview_date', { ascending: true })

    if (ivError) {
      return NextResponse.json({ error: ivError.message }, { status: 500 })
    }

    const ivList: InterviewRow[] = interviews || []

    // Completed interviews (those with a result that is not 'pending')
    const completedInterviews = ivList.filter((iv) => {
      const r = getEvalResult(iv)
      return r && r !== 'pending'
    })

    // --- Calculate offer prediction ---
    let offerScore = 50
    const offerFactors: Factor[] = []

    for (const iv of completedInterviews) {
      const evalResult = getEvalResult(iv)
      const stageLabel = STAGE_LABELS[iv.stage] || iv.stage

      switch (evalResult) {
        case 'S':
          offerScore += 15
          offerFactors.push({ label: `${stageLabel}S評価`, impact: '+15%', type: 'positive' })
          break
        case 'A':
          offerScore += 10
          offerFactors.push({ label: `${stageLabel}A評価`, impact: '+10%', type: 'positive' })
          break
        case 'B':
          offerScore -= 5
          offerFactors.push({ label: `${stageLabel}B評価`, impact: '-5%', type: 'negative' })
          break
        case 'C':
          offerScore -= 25
          offerFactors.push({ label: `${stageLabel}C評価`, impact: '-25%', type: 'negative' })
          break
      }
    }

    // Document completeness bonus
    const docs = candidate.candidate_documents || []
    if (docs.length > 0) {
      const parsedDocs = docs.filter((d: { parse_status?: string }) => d.parse_status === 'parsed')
      if (parsedDocs.length > 0) {
        offerScore += 5
        offerFactors.push({ label: `書類${parsedDocs.length}件AI解析済`, impact: '+5%', type: 'positive' })
      }
    }

    // Stage progression bonus: further in process = slight boost
    if (completedInterviews.length >= 2) {
      offerScore += 5
      offerFactors.push({ label: '複数選考を通過', impact: '+5%', type: 'positive' })
    }

    // --- Calculate acceptance prediction ---
    let acceptScore = 50
    const acceptFactors: Factor[] = []

    for (const iv of completedInterviews) {
      const temp = iv.temperature_score
      const stageLabel = STAGE_LABELS[iv.stage] || iv.stage

      if (temp != null) {
        if (temp > 8) {
          acceptScore += 15
          acceptFactors.push({ label: `${stageLabel} 志望度スコア ${temp}/10`, impact: '+15%', type: 'positive' })
        } else if (temp > 7) {
          acceptScore += 10
          acceptFactors.push({ label: `${stageLabel} 志望度スコア ${temp}/10`, impact: '+10%', type: 'positive' })
        } else if (temp < 5) {
          acceptScore -= 15
          acceptFactors.push({ label: `${stageLabel} 志望度スコア ${temp}/10`, impact: '-15%', type: 'negative' })
        }
      }
    }

    // If offer score is high, acceptance gets a small boost
    if (offerScore > 70) {
      acceptScore += 5
      acceptFactors.push({ label: '内定可能性が高い', impact: '+5%', type: 'positive' })
    }

    // --- Historical comparison ---
    let historicalComparison = {
      similar_candidates: 0,
      offer_rate: 0,
      acceptance_rate: 0,
    }

    if (candidate.job_id) {
      const { data: historicalCandidates } = await db
        .from('candidates')
        .select('id, status')
        .eq('job_id', candidate.job_id)
        .eq('tenant_id', TENANT_ID)
        .in('status', ['offered', 'hired', 'rejected'])
        .neq('id', id)

      if (historicalCandidates && historicalCandidates.length > 0) {
        const total = historicalCandidates.length
        const offered = historicalCandidates.filter(
          (c: { status: string }) => c.status === 'offered' || c.status === 'hired'
        ).length
        const hired = historicalCandidates.filter(
          (c: { status: string }) => c.status === 'hired'
        ).length

        historicalComparison = {
          similar_candidates: total,
          offer_rate: total > 0 ? Math.round((offered / total) * 100) : 0,
          acceptance_rate: offered > 0 ? Math.round((hired / offered) * 100) : 0,
        }

        // Adjust scores slightly based on historical rates
        if (historicalComparison.offer_rate > 50) {
          offerScore += 3
          offerFactors.push({ label: `同ポジション内定率${historicalComparison.offer_rate}%`, impact: '+3%', type: 'positive' })
        }
        if (historicalComparison.acceptance_rate > 70) {
          acceptScore += 3
          acceptFactors.push({ label: `同ポジション承諾率${historicalComparison.acceptance_rate}%`, impact: '+3%', type: 'positive' })
        }
      }
    }

    const confidence = getConfidence(completedInterviews.length)

    return NextResponse.json({
      offer_prediction: {
        score: clampScore(offerScore),
        confidence: getConfidenceLabel(confidence),
        factors: offerFactors,
        stage: getCurrentStageLabel(ivList, candidate.current_stage),
      },
      acceptance_prediction: {
        score: clampScore(acceptScore),
        confidence: getConfidenceLabel(confidence),
        factors: acceptFactors,
      },
      historical_comparison: historicalComparison,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
