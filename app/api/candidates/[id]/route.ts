import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 候補者詳細取得
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = createServerClient()
    const { id } = await context.params

    const { data, error } = await db
      .from('candidates')
      .select('*, candidate_documents(*), interviews(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ candidate: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 候補者更新
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = createServerClient()
    const { id } = await context.params
    const body = await req.json()

    // Build update object from provided fields only
    const updateFields: Record<string, unknown> = {}
    const allowedFields = [
      'full_name', 'email', 'phone', 'source', 'hiring_type', 'status',
      'university', 'faculty', 'graduation_year', 'work_experience',
      'current_company', 'current_title', 'skills', 'summary',
      'job_id', 'tenant_id',
    ]
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateFields[key] = body[key]
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: '更新するフィールドがありません' }, { status: 400 })
    }

    const { data, error } = await db
      .from('candidates')
      .update(updateFields)
      .eq('id', id)
      .select('*, candidate_documents(*), interviews(*)')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '候補者が見つかりません' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ candidate: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 候補者削除
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = createServerClient()
    const { id } = await context.params

    const { error } = await db
      .from('candidates')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
