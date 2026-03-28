import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { candidate, job, revp, interviews } = await req.json()

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

    const jobInfo = `
求人情報:
ポジション: ${job?.title || '未設定'}
部署: ${job?.department || '未設定'}
職種: ${job?.position_type || '未設定'}
求人概要: ${job?.description || '未設定'}
必須要件: ${(job?.requirements || []).join(', ') || '未設定'}
歓迎要件: ${(job?.preferred || []).join(', ') || '未設定'}
ターゲットペルソナ: ${JSON.stringify(job?.target_persona || {})}
`.trim()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `あなたは採用担当者です。以下の候補者に対して、選考通過（合格）を伝えるメールを作成してください。

作成方針：
- 選考通過のお祝いと感謝を伝える
- 面接での候補者の印象的だった点や強みを具体的に言及する
- 求人ポジションとの適合性を改めて伝える
- 次の選考ステップの案内を含める
- 候補者の入社意欲を高める内容にする
- 企業の魅力や将来のビジョンに触れる

形式：そのまま送信できるメール文面（件名・本文・署名欄）
マークダウンは使わないでください。

${candidateInfo}

${jobInfo}

企業REVP情報:
自社の強み: ${(revp?.strengths || []).join('、') || '未設定'}
候補者への重要メッセージ: ${(revp?.messages || []).join('、') || '未設定'}
魅力エピソード: ${(revp?.episodes || []).join('、') || '未設定'}

面接評価情報:
${(interviews || []).map((iv: any) => `
${iv.stage}: 結果=${iv.result || '未評価'}, 志望度=${iv.temperature_score || '未入力'}/10
面接官: ${iv.interviewer_name || '未設定'}
合格理由: ${iv.interviewer_evaluation?.pass_reason || '未入力'}
申し送り: ${iv.interviewer_evaluation?.handoff_to_interviewer || '未入力'}
面接メモ: ${iv.interview_text || '未入力'}
`).join('\n')}`
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
