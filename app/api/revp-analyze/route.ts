import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルが指定されていません' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey })

    console.log('revp-analyze: Processing file:', file.name, 'size:', file.size, 'type:', file.type)

    const arrayBuffer = await file.arrayBuffer()
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'ファイルが空です' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    let userContent: Anthropic.MessageCreateParams['messages'][0]['content']

    if (ext === 'pdf') {
      const base64Data = Buffer.from(arrayBuffer).toString('base64')
      userContent = [
        {
          type: 'document' as const,
          source: {
            type: 'base64' as const,
            media_type: 'application/pdf' as const,
            data: base64Data,
          },
        },
        {
          type: 'text' as const,
          text: PROMPT,
        },
      ]
    } else {
      const textContent = Buffer.from(arrayBuffer).toString('utf-8')
      userContent = [
        {
          type: 'text' as const,
          text: `以下はREVP診断結果の内容です:\n\n${textContent}\n\n${PROMPT}`,
        },
      ]
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: userContent }],
    })

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('revp-analyze: JSON extraction failed. Raw text:', responseText)
      return NextResponse.json({ error: 'JSONの抽出に失敗しました', raw_text: responseText }, { status: 500 })
    }

    let revpData
    try {
      revpData = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      console.error('revp-analyze: JSON parse failed:', parseErr, 'Matched text:', jsonMatch[0])
      return NextResponse.json({ error: 'JSONのパースに失敗しました', raw_text: responseText }, { status: 500 })
    }
    return NextResponse.json({ revp_data: revpData, raw_text: responseText })
  } catch (err: unknown) {
    console.error('revp-analyze error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, detail: String(err) }, { status: 500 })
  }
}

const PROMPT = `この文書はREVP（Realistic Employee Value Proposition）診断の結果です。
以下の情報をJSON形式で抽出してください。

抽出項目:
- scores: 以下のカテゴリーごとに0〜100のスコアを推定してください
  - philosophy: 理念・ビジョン
  - work_content: 仕事内容・やりがい
  - organization: 組織・チーム
  - growth: 成長・キャリア
  - work_style: 働き方・環境
  - compensation: 報酬・福利厚生
  - brand: 企業ブランド・知名度
  - people: 人・カルチャー
- strengths: 自社の強み・差別化ポイント（文字列の配列、3〜5個）
- messages: 候補者に伝えるべき重要メッセージ（文字列の配列、3〜5個）
- episodes: 魅力を伝える具体的なエピソード（文字列の配列、2〜3個）

必ず有効なJSONのみを返してください。マークダウンのコードブロックや説明文は不要です。`
