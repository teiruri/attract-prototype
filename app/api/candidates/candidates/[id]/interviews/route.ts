import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 面接データ登録・更新
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const body = await req.json()
    const db = createServerClient()

    // 同じステージの既存データをチェック
    const { data: existing } = await db
      .from('interviews')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('stage', body.stage)
      .single()

    if (existing) {
      // 更新
      const { data, error } = await db
        .from('interviews')
        .update({
          interviewer_name: body.interviewer_name,
          interviewer_role: body.interviewer_role,
          interview_date: body.interview_date,
          interview_text: body.interview_text,
          candidate_survey: body.candidate_survey || {},
          interviewer_evaluation: body.interviewer_evaluation || {},
          temperature_score: body.temperature_score,
          result: body.result || 'pending',
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // 候補者のcurrent_stageを更新
      await db.from('candidates').update({ current_stage: body.stage }).eq('id', candidateId)

      return NextResponse.json({ interview: data })
    } else {
      // 新規作成
      const { data, error } = await db
        .from('interviews')
        .insert({
          tenant_id: body.tenant_id,
          candidate_id: candidateId,
          job_id: body.job_id,
          stage: body.stage,
          interviewer_name: body.interviewer_name,
          interviewer_role: body.interviewer_role,
          interview_date: body.interview_date,
          interview_text: body.interview_text,
          candidate_survey: body.candidate_survey || {},
          interviewer_evaluation: body.interviewer_evaluation || {},
          temperature_score: body.temperature_score,
          result: body.result || 'pending',
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // 候補者のcurrent_stageを更新
      await db.from('candidates').update({ current_stage: body.stage }).eq('id', candidateId)

      return NextResponse.json({ interview: data }, { status: 201 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 候補者の面接一覧取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const db = createServerClient()

    const { data, error } = await db
      .from('interviews')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('stage')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ interviews: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
