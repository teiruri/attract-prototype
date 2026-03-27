import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

function getMediaType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    default:
      return 'application/octet-stream'
  }
}

function isTextBasedFile(mediaType: string): boolean {
  return mediaType.includes('msword') ||
    mediaType.includes('wordprocessingml') ||
    mediaType === 'text/plain'
}

function isDocumentType(mediaType: string): boolean {
  return mediaType === 'application/pdf'
}

function isImageType(mediaType: string): boolean {
  return mediaType.startsWith('image/')
}

const EXTRACTION_PROMPT = `あなたは採用候補者の書類（履歴書・職務経歴書・CVなど）から情報を抽出するアシスタントです。
以下の情報をJSON形式で抽出してください。情報が見つからない場合はnullを返してください。

抽出する項目:
- full_name: 氏名（フルネーム）
- email: メールアドレス
- phone: 電話番号
- current_company: 現在の勤務先
- current_title: 現在の役職
- skills: スキル一覧（文字列の配列）
- work_experience: 職歴（配列。各要素は { company: string, title: string, period: string, description: string }）
- university: 大学名
- faculty: 学部・学科
- graduation_year: 卒業年（数値）
- summary: 候補者の概要（2-3文で）

必ず有効なJSONのみを返してください。マークダウンのコードブロックや説明文は不要です。`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const jobId = formData.get('job_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルが指定されていません' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey })
    const mediaType = getMediaType(file.name)
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    // Build the message content based on file type
    let userContent: Anthropic.MessageCreateParams['messages'][0]['content']

    if (isTextBasedFile(mediaType)) {
      // For Word/text files, decode as text and send as text content
      const textContent = Buffer.from(arrayBuffer).toString('utf-8')
      userContent = [
        {
          type: 'text' as const,
          text: `以下は候補者の書類の内容です:\n\n${textContent}`,
        },
      ]
    } else if (isDocumentType(mediaType)) {
      // For PDF, send as document
      userContent = [
        {
          type: 'document' as const,
          source: {
            type: 'base64' as const,
            media_type: mediaType as 'application/pdf',
            data: base64Data,
          },
        },
        {
          type: 'text' as const,
          text: EXTRACTION_PROMPT,
        },
      ]
    } else if (isImageType(mediaType)) {
      // For images, send as image
      userContent = [
        {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64Data,
          },
        },
        {
          type: 'text' as const,
          text: EXTRACTION_PROMPT,
        },
      ]
    } else {
      return NextResponse.json(
        { error: 'サポートされていないファイル形式です。PDF、画像、またはWordファイルをアップロードしてください。' },
        { status: 400 }
      )
    }

    // If text-based, prepend the extraction prompt as system or in text
    const systemPrompt = isTextBasedFile(mediaType) ? EXTRACTION_PROMPT : undefined

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    // Extract the text response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    // Parse the JSON from Claude's response
    let extracted
    try {
      // Try to extract JSON from the response (handle cases where Claude wraps it in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('JSONが見つかりませんでした')
      }
      extracted = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      return NextResponse.json(
        {
          error: '抽出結果のパースに失敗しました',
          raw_response: responseText,
        },
        { status: 500 }
      )
    }

    // Insert into candidates table
    const db = createServerClient()
    const { data: candidate, error: dbError } = await db
      .from('candidates')
      .insert({
        tenant_id: TENANT_ID,
        job_id: jobId || null,
        full_name: extracted.full_name,
        email: extracted.email,
        phone: extracted.phone,
        source: 'document_import',
        hiring_type: extracted.work_experience?.length > 0 ? 'mid_career' : 'new_graduate',
        status: 'active',
        university: extracted.university,
        faculty: extracted.faculty,
        graduation_year: extracted.graduation_year,
        work_experience: extracted.work_experience || [],
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        {
          error: 'データベースへの保存に失敗しました',
          detail: dbError.message,
          extracted,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      extracted,
      candidate,
    })
  } catch (err) {
    console.error('import-document error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
