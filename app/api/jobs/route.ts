import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 求人一覧取得
export async function GET(req: NextRequest) {
  try {
    const db = createServerClient()
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenant_id')

    let query = db
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (tenantId) query = query.eq('tenant_id', tenantId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ jobs: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 求人作成（ターゲットペルソナ含む）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = createServerClient()

    const { data, error } = await db
      .from('jobs')
      .insert({
        tenant_id: body.tenant_id,
        title: body.title,
        department: body.department,
        position_type: body.position_type,
        description: body.description,
        requirements: body.requirements || [],
        preferred: body.preferred || [],
        target_persona: body.target_persona || {},
        hiring_type: body.hiring_type || 'new_graduate',
        is_active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ job: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 求人更新
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const db = createServerClient()

    const { data, error } = await db
      .from('jobs')
      .update({
        title: body.title,
        department: body.department,
        position_type: body.position_type,
        description: body.description,
        requirements: body.requirements,
        preferred: body.preferred,
        target_persona: body.target_persona,
        hiring_type: body.hiring_type,
        is_active: body.is_active,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ job: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 求人削除
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const db = createServerClient()
    const { error } = await db.from('jobs').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
