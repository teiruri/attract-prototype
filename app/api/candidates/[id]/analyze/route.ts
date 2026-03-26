import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { analyzeMatch } from '@/lib/ai'

export const dynamic = 'force-dynamic'

// マッチ度解析（AI）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const db = createServerClient()

    // 候補者情報を取得
    const { data: candidate, error: candErr } = await db
      .from('candidates')
      .select('*, candidate_documents(*)')
      .eq('id', candidateId)
      .single()

    if (candErr || !candidate) {
      return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
    }

    // 求人（ターゲットペルソナ）を取得
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

    // ドキュメントのテキストを収集
    const docTexts = (candidate.candidate_documents || [])
      .filter((d: { extracted_text?: string }) => d.extracted_text)
      .map((d: { extracted_text: string }) => d.extracted_text)

    // generating状態でレコードを作成
    const { data: output } = await db
      .from('generated_outputs')
      .insert({
        tenant_id: candidate.tenant_id,
        candidate_id: candidateId,
        job_id: job.id,
        output_type: 'match_analysis',
        status: 'generating',
        content: {},
      })
      .select()
      .single()

    // AI分析を実行
    const result = await analyzeMatch({
      candidateName: candidate.full_name,
      candidateProfile: candidate.profile_summary || buildCandidateProfile(candidate),
      documents: docTexts,
      targetPersona: job.target_persona,
      jobTitle: job.title,
      companyProfile: profile ? {
        company_name: profile.company_name,
        evp: profile.evp,
        culture_keywords: profile.culture_keywords,
        attraction_points: profile.attraction_points,
      } : undefined,
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

    // 候補者のマッチスコアも更新
    await db.from('candidates').update({
      match_score: result.overall_match_score,
    }).eq('id', candidateId)

    return NextResponse.json({ output: updated, result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function buildCandidateProfile(candidate: Record<string, unknown>): string {
  const parts: string[] = []
  if (candidate.full_name) parts.push(`氏名: ${candidate.full_name}`)
  if (candidate.university) parts.push(`大学: ${candidate.university} ${candidate.faculty || ''}`)
  if (candidate.current_company) parts.push(`現職: ${candidate.current_company}`)
  if (candidate.current_title) parts.push(`役職: ${candidate.current_title}`)
  if (candidate.source) parts.push(`流入経路: ${candidate.source}`)
  const workExp = candidate.work_experience as unknown[]
  if (workExp && Array.isArray(workExp) && workExp.length > 0) {
    parts.push(`職歴: ${JSON.stringify(workExp)}`)
  }
  return parts.join('\n')
}
