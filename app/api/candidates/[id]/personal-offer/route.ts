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
        content: `あなたは採用担当者です。以下のエントリー候補者に対して、初回接点（カジュアル面談・インターンシップ・会社説明会など）への参加を促すパーソナルオファーメールを作成してください。

目的：エントリーから初回接点への移行率を高めること

作成方針：
- 候補者の経歴・スキル・専攻と求人内容のマッチポイントを具体的に提示する
- 「あなただからこそお声がけしました」という特別感を演出する
- 初回接点のハードルを下げる（カジュアルな雰囲気、短時間、オンライン可など）
- 具体的な次のアクション（日程調整リンク、返信など）を明示する
- 温かみがありつつプロフェッショナルなトーンで書く

【重要：面接官コメントの表現整形ルール】
面接官のメモ・合格理由・申し送りなどの社内コメントを文面に活かす際は、以下を必ず守ること：
- くだけた口語調（例：「めっちゃ優秀」「ぶっちゃけ即戦力」）→ 丁寧なビジネス表現に変換する
- 失礼・不適切な表現（例：「見た目は頼りないが」「年齢の割に」）→ 候補者を尊重する表現に言い換える、または文面に含めない
- 略語やスラング → 正式な表現に置き換える
- 社内向けの率直すぎる評価 → 候補者に伝えても好印象になる形に整える
- 面接官の生のコメントをそのままコピーせず、趣旨を汲み取って適切な言葉で再構成すること

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
