import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 企業の魅力プロフィール取得
export async function GET() {
  try {
    const db = createServerClient()
    const { data, error } = await db
      .from('company_profiles')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Expose revp_data from metadata for convenience
    if (data && data.metadata?.revp_data) {
      data.revp_data = data.metadata.revp_data
    }

    return NextResponse.json({ profile: data || null })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 企業の魅力プロフィール部分更新（REVP等）
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const db = createServerClient()

    const { data: existing } = await db
      .from('company_profiles')
      .select('id, metadata')
      .limit(1)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    const updateFields: Record<string, unknown> = {}

    // Store revp_data inside the metadata JSONB field
    if (body.revp_data !== undefined) {
      const existingMetadata = (existing.metadata as Record<string, unknown>) || {}
      updateFields.metadata = { ...existingMetadata, revp_data: body.revp_data }
    }

    const { data, error } = await db
      .from('company_profiles')
      .update(updateFields)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Expose revp_data from metadata for convenience
    if (data && data.metadata?.revp_data) {
      data.revp_data = data.metadata.revp_data
    }

    return NextResponse.json({ profile: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// 企業の魅力プロフィール作成・更新
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = createServerClient()

    // 既存チェック
    const { data: existing } = await db
      .from('company_profiles')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      // 更新
      const { data, error } = await db
        .from('company_profiles')
        .update({
          company_name: body.company_name,
          industry: body.industry,
          company_size: body.company_size,
          mission: body.mission,
          vision: body.vision,
          values: body.values,
          evp: body.evp || {},
          culture_keywords: body.culture_keywords || [],
          attraction_points: body.attraction_points || [],
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ profile: data })
    } else {
      // 新規作成
      const { data, error } = await db
        .from('company_profiles')
        .insert({
          tenant_id: body.tenant_id,
          company_name: body.company_name,
          industry: body.industry,
          company_size: body.company_size,
          mission: body.mission,
          vision: body.vision,
          values: body.values,
          evp: body.evp || {},
          culture_keywords: body.culture_keywords || [],
          attraction_points: body.attraction_points || [],
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ profile: data }, { status: 201 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
