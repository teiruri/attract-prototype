import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generatePersonalOffer } from '@/lib/ai'

export const dynamic = 'force-dynamic'

// 個別オファー生成（AI）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const body = await req.json()
    const db = createServerClient()

    // 候補者情報を取得
    const { data: candidate, error: candErr } = await db
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single()

    if (candErr || !candidate) {
      return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
    }

    // 求人情報を取得
    const { data: job } = await db
      .from('jobs')
      .select('*')
      .eq('id', candidate.job_id)
      .single()

    if (!job) {
      return NextResponse.json({ error: '求人が設定されていません' }, { status: 400 })
    }

    // 企業プロフィールを取得
    const { data: profile } = await db
      .from('company_profiles')
      .select('*')
      .eq('tenant_id', candidate.tenant_id)
      .single()

    // 既存のマッチ分析結果があれば取得
    const { data: existingAnalysis } = await db
      .from('generated_outputs')
      .select('content')
      .eq('candidate_id', candidateId)
      .eq('output_type', 'match_analysis')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 次ステップのタイプとラベル
    const nextStepType = body.next_step_type || 'info_session'
    const STEP_LABELS: Record<string, string> = {
      internship: 'インターンシップ',
      info_session: '説明会',
      casual_talk: 'カジュアル面談',
      office_visit: 'オフィス見学',
      workshop: 'ワークショップ',
    }
    const nextStepLabel = STEP_LABELS[nextStepType] || nextStepType

    // generating状態でレコードを作成
    const { data: output } = await db
      .from('generated_outputs')
      .insert({
        tenant_id: candidate.tenant_id,
        candidate_id: candidateId,
        job_id: job.id,
        output_type: 'personal_offer',
        status: 'generating',
        content: {},
      })
      .select()
      .single()

    // AI生成を実行
    const result = await generatePersonalOffer({
      candidateName: candidate.full_name,
      candidateProfile: candidate.profile_summary || buildProfile(candidate),
      hiringType: candidate.hiring_type || 'new_graduate',
      nextStepType,
      nextStepLabel,
      jobTitle: job.title,
      companyProfile: profile ? {
        company_name: profile.company_name,
        evp: profile.evp,
        culture_keywords: profile.culture_keywords,
        attraction_points: profile.attraction_points,
      } : undefined,
      matchAnalysis: existingAnalysis?.content || undefined,
    })

    // 結果を保存
    const { data: updated, error: updateErr } = await db
      .from('generated_outputs')
      .update({
        status: 'draft',
        content: result,
      })
      .eq('id', output!.id)
      .select()
      .single()

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ output: updated, result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function buildProfile(candidate: Record<string, unknown>): string {
  const parts: string[] = []
  if (candidate.full_name) parts.push(`氏名: ${candidate.full_name}`)
  if (candidate.university) parts.push(`大学: ${candidate.university} ${candidate.faculty || ''}`)
  if (candidate.current_company) parts.push(`現職: ${candidate.current_company}`)
  if (candidate.current_title) parts.push(`役職: ${candidate.current_title}`)
  if (candidate.source) parts.push(`流入経路: ${candidate.source}`)
  const meta = candidate.metadata as Record<string, unknown> | undefined
  if (meta?.current_company) parts.push(`現職: ${meta.current_company}`)
  if (meta?.current_title) parts.push(`役職: ${meta.current_title}`)
  return parts.join('\n')
}
