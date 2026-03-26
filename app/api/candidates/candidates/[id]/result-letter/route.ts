import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateResultLetter } from '@/lib/ai'
import { STAGE_LABELS, type InterviewStage } from '@/lib/db-types'

export const dynamic = 'force-dynamic'

// 選考結果レター生成（AI）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const body = await req.json()
    const stage = body.stage as InterviewStage
    const isPass = body.is_pass as boolean

    if (!stage) {
      return NextResponse.json({ error: '選考ステージを指定してください' }, { status: 400 })
    }

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
      .eq('stage', stage)
      .single()

    // 過去の面接データ
    const { data: previousInterviews } = await db
      .from('interviews')
      .select('stage, interview_text')
      .eq('candidate_id', candidateId)
      .neq('stage', stage)
      .order('stage')

    // 企業プロフィール
    const { data: profile } = await db
      .from('company_profiles')
      .select('*')
      .eq('tenant_id', candidate.tenant_id)
      .single()

    // generating状態でレコード作成
    const { data: output } = await db
      .from('generated_outputs')
      .insert({
        tenant_id: candidate.tenant_id,
        candidate_id: candidateId,
        interview_id: interview?.id,
        job_id: candidate.job_id,
        output_type: 'result_letter',
        status: 'generating',
        stage,
        content: {},
      })
      .select()
      .single()

    // AI生成
    const result = await generateResultLetter({
      candidateName: candidate.full_name,
      candidateProfile: candidate.profile_summary || candidate.full_name,
      stage,
      stageLabel: STAGE_LABELS[stage],
      isPass,
      interviewData: interview ? {
        interviewText: interview.interview_text,
        candidateSurvey: interview.candidate_survey,
        interviewerEvaluation: interview.interviewer_evaluation,
      } : undefined,
      companyProfile: profile ? {
        company_name: profile.company_name,
        evp: profile.evp,
      } : undefined,
      previousInterviews: (previousInterviews || []).map(i => ({
        stage: STAGE_LABELS[i.stage as InterviewStage] || i.stage,
        summary: i.interview_text?.substring(0, 200),
      })),
    })

    // 結果を保存
    const { data: updated } = await db
      .from('generated_outputs')
      .update({ status: 'draft', content: result })
      .eq('id', output!.id)
      .select()
      .single()

    // 面接結果も更新
    if (interview) {
      await db.from('interviews').update({
        result: isPass ? 'pass' : 'fail'
      }).eq('id', interview.id)
    }

    // 内定の場合はステータス更新
    if (stage === 'interview_final' && isPass) {
      await db.from('candidates').update({ status: 'offered' }).eq('id', candidateId)
    }

    return NextResponse.json({ output: updated, result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
