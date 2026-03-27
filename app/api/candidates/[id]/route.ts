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
      .select('*, candidate_documents(id, document_type, file_name, file_size, uploaded_at, parse_status), interviews(id, stage, stage_label, scheduled_at, format, status, result, interviewers, evaluation, signal, handoff_notes, feedback_letter, attract_plan)')
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
