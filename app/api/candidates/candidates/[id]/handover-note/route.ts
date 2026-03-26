import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateHandoverNote } from '@/lib/ai'
import { STAGE_LABELS, STAGE_ORDER, type InterviewStage } from '@/lib/db-types'

export const dynamic = 'force-dynamic'

// 面接申し送り生成（AI）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const body = await req.json()
    const currentStage = body.stage as InterviewStage

    if (!currentStage) {
      return NextResponse.json({ error: '現在の選考ステージを指定してください' }, { status: 400 })
    }

    // 次のステージを算出
    const currentIdx = STAGE_ORDER.indexOf(currentStage)
    if (currentIdx === -1 || currentIdx >= STAGE_ORDER.length - 1) {
      return NextResponse.json({ error: '最終選考には申し送りは不要です' }, { status: 400 })
    }
    const nextStage = STAGE_ORDER[currentIdx + 1]

    const db = createServerClient()

    // 候補者情報
    const { data: candidate } = await db
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single()

    if (!candidate) {
      return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
    }

    // 対象ステージの面接データ
    const { data: interview } = await db
      .from('interviews')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('stage', currentStage)
      .single()

    if (!interview) {
      return NextResponse.json({ error: 'このステージの面接データがありません' }, { status: 400 })
    }

    // 過去の面接
    const { data: previousInterviews } = await db
      .from('interviews')
      .select('stage, interview_text')
      .eq('candidate_id', candidateId)
      .neq('stage', currentStage)
      .order('stage')

    // マッチ分析結果
    const { data: matchOutput } = await db
      .from('generated_outputs')
      .select('content')
      .eq('candidate_id', candidateId)
      .eq('output_type', 'match_analysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // generating状態でレコード作成
    const { data: output } = await db
      .from('generated_outputs')
      .insert({
        tenant_id: candidate.tenant_id,
        candidate_id: candidateId,
        interview_id: interview.id,
        job_id: candidate.job_id,
        output_type: 'handover_note',
        status: 'generating',
        stage: currentStage,
        content: {},
      })
      .select()
      .single()

    // AI生成
    const result = await generateHandoverNote({
      candidateName: candidate.full_name,
      candidateProfile: candidate.profile_summary || candidate.full_name,
      currentStage,
      currentStageLabel: STAGE_LABELS[currentStage],
      nextStage,
      nextStageLabel: STAGE_LABELS[nextStage],
      interviewData: {
        interviewText: interview.interview_text,
        candidateSurvey: interview.candidate_survey,
        interviewerEvaluation: interview.interviewer_evaluation,
      },
      previousInterviews: (previousInterviews || []).map(i => ({
        stage: STAGE_LABELS[i.stage as InterviewStage] || i.stage,
        summary: i.interview_text?.substring(0, 200),
      })),
      matchAnalysis: matchOutput?.content as any,
    })

    // 結果を保存
    const { data: updated } = await db
      .from('generated_outputs')
      .update({ status: 'draft', content: result })
      .eq('id', output!.id)
      .select()
      .single()

    return NextResponse.json({ output: updated, result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
