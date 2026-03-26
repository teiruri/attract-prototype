import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ドキュメントアップロード
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const db = createServerClient()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('document_type') as string || 'other'
    const tenantId = formData.get('tenant_id') as string

    if (!file) {
      return NextResponse.json({ error: 'ファイルが指定されていません' }, { status: 400 })
    }

    // Supabase Storageにアップロード
    const fileExt = file.name.split('.').pop()
    const storagePath = `${tenantId}/${candidateId}/${crypto.randomUUID()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await db.storage
      .from('candidate-documents')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // メタデータをDBに保存
    const { data, error } = await db
      .from('candidate_documents')
      .insert({
        tenant_id: tenantId,
        candidate_id: candidateId,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ document: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 候補者のドキュメント一覧取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params
    const db = createServerClient()

    const { data, error } = await db
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ documents: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
