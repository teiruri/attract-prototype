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

interface InterviewRow {
  id: string
  stage: string
  result: string
  temperature_score: number | null
  interview_date: string | null
  interviewer_evaluation: {
    result?: string
    criteria?: Array<{ label: string; score: number }>
  } | null
}

interface Action {
  id: string
  priority: 'urgent' | 'recommended' | 'optional'
  title: string
  description: string
  action_type: string
  action_url: string
  icon: string
}

function getEvalResult(iv: InterviewRow): string | null {
  return iv.interviewer_evaluation?.result || iv.result || null
}

function getNextStageLabel(currentStage: string): string {
  const stages = Object.keys(STAGE_ORDER)
  const currentIdx = stages.indexOf(currentStage)
  if (currentIdx === -1 || currentIdx >= stages.length - 1) return '次のステップ'
  const nextStage = stages[currentIdx + 1]
  return STAGE_LABELS[nextStage] || nextStage
}

// 候補者ネクストアクションAPI
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

    // Sort by stage order
    const sortedInterviews = [...ivList].sort(
      (a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99)
    )

    const completedInterviews = sortedInterviews.filter((iv) => {
      const r = getEvalResult(iv)
      return r && r !== 'pending'
    })

    // Fetch scores from our scoring endpoint internally
    // Instead of calling the API, calculate key metrics inline
    const temperatureScores = sortedInterviews
      .filter((iv) => iv.temperature_score != null)
      .map((iv) => iv.temperature_score as number)

    const avgTemp = temperatureScores.length > 0
      ? temperatureScores.reduce((s, v) => s + v, 0) / temperatureScores.length
      : 0

    const motivationScore = temperatureScores.length > 0 ? avgTemp * 10 : 50

    // Last contact days
    const datesWithInterviews = sortedInterviews
      .filter((iv) => iv.interview_date)
      .map((iv) => iv.interview_date as string)
      .sort()

    let lastContactDays = 0
    if (datesWithInterviews.length > 0) {
      const lastDate = datesWithInterviews[datesWithInterviews.length - 1]
      const now = new Date()
      lastContactDays = Math.floor(
        (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (lastContactDays < 0) lastContactDays = 0
    }

    // Days in pipeline
    let daysInPipeline = 0
    if (candidate.created_at) {
      const created = new Date(candidate.created_at)
      const now = new Date()
      daysInPipeline = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysInPipeline < 0) daysInPipeline = 0
    }

    // Determine current journey stage
    let journeyStage = candidate.current_stage || 'unknown'
    if (sortedInterviews.length > 0) {
      const latestIv = sortedInterviews[sortedInterviews.length - 1]
      journeyStage = latestIv.stage
    }

    // Check if REVP data has been applied
    const meta = (candidate.metadata as Record<string, unknown>) || {}
    const hasRevpData = !!(meta.revp_applied || meta.signals)

    // Check for generated_outputs with REVP-related content
    let hasRevpOutput = false
    try {
      const { data: revpOutputs } = await db
        .from('generated_outputs')
        .select('id')
        .eq('candidate_id', id)
        .in('output_type', ['attract_story', 'personal_offer', 'candidate_signal'])
        .limit(1)

      hasRevpOutput = !!(revpOutputs && revpOutputs.length > 0)
    } catch {
      // Table might not exist; continue
    }

    const hasRevp = hasRevpData || hasRevpOutput

    // Latest interview
    const latestInterview = sortedInterviews.length > 0
      ? sortedInterviews[sortedInterviews.length - 1]
      : null

    const latestEvalResult = latestInterview ? getEvalResult(latestInterview) : null

    // Temperature trend check
    let temperatureDecreased = false
    if (temperatureScores.length >= 2) {
      const last = temperatureScores[temperatureScores.length - 1]
      const prev = temperatureScores[temperatureScores.length - 2]
      if (last < prev) temperatureDecreased = true
    }

    // Check if all interviews have good results
    const allGoodResults = completedInterviews.length > 0 &&
      completedInterviews.every((iv) => {
        const r = getEvalResult(iv)
        return r === 'S' || r === 'A'
      })

    // Determine next milestone
    const nextMilestone = getNextStageLabel(journeyStage)

    // --- Generate actions based on rules ---
    const actions: Action[] = []

    // Rule: No interviews yet
    if (ivList.length === 0) {
      actions.push({
        id: 'first_interview',
        priority: 'urgent',
        title: 'AI面談の実施',
        description: '初期理解を深めるためAI面談を実施してください。候補者の価値観・志望動機を早期に把握しましょう。',
        action_type: 'ai_interview',
        action_url: `/candidates/${id}/ai-interview`,
        icon: 'message-square',
      })
    }

    // Rule: Last interview > 3 days ago
    if (lastContactDays > 3 && ivList.length > 0) {
      actions.push({
        id: 'follow_up',
        priority: lastContactDays > 7 ? 'urgent' : 'recommended',
        title: `${lastContactDays > 7 ? '緊急' : '48時間以内の'}フォローアップ`,
        description: `前回面接から${lastContactDays}日経過しています。志望度維持のため早めのフォローを。`,
        action_type: 'attract',
        action_url: `/candidates/${id}/attract`,
        icon: 'zap',
      })
    }

    // Rule: Temperature score decreased between interviews
    if (temperatureDecreased) {
      actions.push({
        id: 'temperature_drop',
        priority: 'urgent',
        title: '志望度低下への対応',
        description: '志望度が低下傾向です。惹きつけ戦略を確認してください。候補者の不安要素を特定し、個別対応が必要です。',
        action_type: 'attract',
        action_url: `/candidates/${id}/attract`,
        icon: 'trending-down',
      })
    }

    // Rule: Latest interview result is S or A → advance to next step
    if (latestEvalResult === 'S' || latestEvalResult === 'A') {
      // Only if not already at offer/hired stage and not all done
      if (journeyStage !== 'offer' && journeyStage !== 'hired' && !allGoodResults) {
        actions.push({
          id: 'advance_stage',
          priority: 'recommended',
          title: '次の選考ステップへ',
          description: `次の選考ステップに進めましょう。${STAGE_LABELS[journeyStage] || journeyStage}で好評価を獲得しています。`,
          action_type: 'interview',
          action_url: `/candidates/${id}?tab=interviews`,
          icon: 'arrow-right',
        })
      }
    }

    // Rule: All interviews done with good results → create offer
    if (allGoodResults && completedInterviews.length >= 2) {
      actions.push({
        id: 'create_offer',
        priority: 'urgent',
        title: 'オファーレター作成',
        description: 'オファーレターを作成してください。全選考で好評価を獲得しており、早期のオファー提示が承諾率向上に繋がります。',
        action_type: 'personal_offer',
        action_url: `/candidates/${id}/personal-offer`,
        icon: 'file-text',
      })
    }

    // Rule: Motivation < 50
    if (motivationScore < 50) {
      actions.push({
        id: 'low_motivation',
        priority: 'urgent',
        title: '志望度向上施策の検討',
        description: '候補者の不安を解消するフォロー施策を検討してください。シグナル分析で懸念事項を確認しましょう。',
        action_type: 'signal',
        action_url: `/candidates/${id}/signal-input`,
        icon: 'alert-triangle',
      })
    }

    // Rule: No REVP data applied
    if (!hasRevp) {
      actions.push({
        id: 'apply_revp',
        priority: 'recommended',
        title: 'REVP情報の反映',
        description: 'REVP情報を候補者対応に反映してください。惹きつけストーリーやパーソナルオファーの質が向上します。',
        action_type: 'attract',
        action_url: `/candidates/${id}/attract`,
        icon: 'sparkles',
      })
    }

    // Additional contextual actions

    // If interviews exist but no signal analysis yet
    if (ivList.length > 0 && !meta.signals) {
      let hasSignalOutput = false
      try {
        const { data: signalOutputs } = await db
          .from('generated_outputs')
          .select('id')
          .eq('candidate_id', id)
          .eq('output_type', 'candidate_signal')
          .limit(1)

        hasSignalOutput = !!(signalOutputs && signalOutputs.length > 0)
      } catch {
        // Continue
      }

      if (!hasSignalOutput) {
        actions.push({
          id: 'run_signal',
          priority: 'recommended',
          title: 'シグナル分析の実行',
          description: '面接データからシグナル分析を実行し、候補者の本音・価値観・不安を可視化しましょう。',
          action_type: 'signal',
          action_url: `/candidates/${id}/signal-input`,
          icon: 'search',
        })
      }
    }

    // If offer stage but no feedback letter
    if (journeyStage === 'offer' || journeyStage === 'hired') {
      actions.push({
        id: 'feedback_letter',
        priority: 'optional',
        title: '通過・内定レター作成',
        description: '候補者への通過・内定レターを作成し、入社意欲を高めましょう。',
        action_type: 'feedback',
        action_url: `/candidates/${id}/feedback-letter`,
        icon: 'mail',
      })
    }

    // Sort actions by priority: urgent > recommended > optional
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      recommended: 1,
      optional: 2,
    }
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return NextResponse.json({
      actions,
      journey_stage: journeyStage,
      next_milestone: nextMilestone,
      days_in_pipeline: daysInPipeline,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
