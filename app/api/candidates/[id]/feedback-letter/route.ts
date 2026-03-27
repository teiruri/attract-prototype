import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { candidate } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const anthropic = new Anthropic({ apiKey })

    const candidateInfo = `
候補者名: ${candidate.full_name || '不明'}
メール: ${candidate.email || '不明'}
採用タイプ: ${candidate.hiring_type === 'new_graduate' ? '新卒' : '中途'}
現職: ${candidate.current_company || ''} ${candidate.current_title || ''}
大学: ${candidate.university || ''} ${candidate.faculty || ''}
職歴: ${JSON.stringify(candidate.work_experience || [])}
ステータス: ${candidate.status || ''}
`.trim()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `以下の候補者に送る面接後のフィードバックレターを作成してください。候補者の強みを認め、次のステップへの期待を伝える温かみのあるレターにしてください。

レターは以下の構成で作成してください:
- 冒頭の挨拶（候補者名を使用）
- 面接への感謝
- 候補者の印象に残った強み・良かった点（具体的に）
- 次のステップへの期待と案内
- 結びの言葉
- 署名（採用担当者として）

候補者の経歴に基づいて、パーソナライズされた内容にしてください。丁寧でプロフェッショナル、かつ温かみのあるトーンで書いてください。

${candidateInfo}`
      }]
    })

    const resultText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    return NextResponse.json({ result: resultText })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
