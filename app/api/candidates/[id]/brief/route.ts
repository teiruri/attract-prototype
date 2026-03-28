import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
        content: `あなたは採用マネージャーです。以下の候補者の次回面接に向けた面接シナリオを作成してください。

作成方針：
- 候補者の経歴と求人要件を照合した確認ポイントを整理する
- 候補者の志向性や価値観を深掘りする質問を提案する
- 企業の魅力を効果的に伝えるトークポイントを含める
- 面接の時間配分と進行の流れを提案する
- 候補者の懸念点を払拭するための準備事項を含める
- 面接後のフォローアップアクションも提案する

【重要：面接官コメントの表現整形ルール】
前回面接官のメモ・合格理由・申し送りなどの社内コメントを資料に活かす際は、以下を必ず守ること：
- くだけた口語調（例：「めっちゃ優秀」「ぶっちゃけ即戦力」）→ 丁寧なビジネス表現に変換する
- 失礼・不適切な表現（例：「見た目は頼りないが」「年齢の割に」）→ 候補者を尊重する表現に言い換える、または資料に含めない
- 略語やスラング → 正式な表現に置き換える
- 社内向けの率直すぎる評価 → プロフェッショナルな表現に整える
- 面接官の生のコメントをそのままコピーせず、趣旨を汲み取って適切な言葉で再構成すること

形式：面接官が印刷して手元に置けるブリーフィング資料
【】で見出しを囲み、箇条書きを活用して簡潔にまとめてください。
マークダウンの##は使わないでください。

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
