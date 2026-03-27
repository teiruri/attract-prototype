import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 候補者一覧取得
export async function GET(req: NextRequest) {
  try {
    const db = createServerClient()
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenant_id')
    const jobId = searchParams.get('job_id')
    const status = searchParams.get('status')

    let query = db
      .from('candidates')
      .select('*, candidate_documents(id), interviews(id, stage, result)')
      .order('created_at', { ascending: false })

    if (tenantId) query = query.eq('tenant_id', tenantId)
    if (jobId) query = query.eq('job_id', jobId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ candidates: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 候補者新規登録
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = createServerClient()

    const { data, error } = await db
      .from('candidates')
      .insert({
        tenant_id: body.tenant_id,
        job_id: body.job_id,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        hiring_type: body.hiring_type || 'new_graduate',
        status: 'active',
        university: body.university,
        faculty: body.faculty,
        graduation_year: body.graduation_year,
        work_experience: body.work_experience || [],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ candidate: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
