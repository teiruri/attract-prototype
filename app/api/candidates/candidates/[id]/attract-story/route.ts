import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateAttractStory } from '@/lib/ai'

export const dynamic = 'force-dynamic'

// 惹きつけストーリー生成（AI）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const db = createServerClient()

    // 候補者情報
    const { data: candidate } = await db
      .from('candidates')
      .select('*, candidate_documents(*)')
      .eq('id', candidateId)
      .single()

    if (!candidate) {
      return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
    }

    // 企業プロフィール
    const { data: profile } = await db
      .from('company_profiles')
      .select('*')
      .eq('tenant_id', candidate.tenant_id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: '企業の魅力が設定されていません。先に企業の魅力を入力してください。' }, { status: 400 })
    }

    // 求人
    const { data: job } = await db
      .from('jobs')
      .select('*')
      .eq('id', candidate.job_id)
      .single()

    // 最新のマッチ分析結果を取得
    const { data: latestMatch } = await db
      .from('generated_outputs')
      .select('content')
      .eq('candidate_id', candidateId)
      .eq('output_type', 'match_analysis')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // generating状態でレコード作成
    const { data: output } = await db
      .from('generated_outputs')
      .insert({
        tenant_id: candidate.tenant_id,
        candidate_id: candidateId,
        job_id: candidate.job_id,
        output_type: 'attract_story',
        status: 'generating',
        content: {},
      })
      .select()
      .single()

    // AI生成
    const result = await generateAttractStory({
      candidateName: candidate.full_name,
      candidateProfile: candidate.profile_summary || `${candidate.full_name}（${candidate.university || candidate.current_company || ''}）`,
      matchAnalysis: latestMatch?.content as any,
      companyProfile: {
        company_name: profile.company_name,
        mission: profile.mission,
        vision: profile.vision,
        evp: profile.evp,
        culture_keywords: profile.culture_keywords,
        attraction_points: profile.attraction_points,
      },
      jobTitle: job?.title || '',
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
