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
採用タイプ: ${candidate.hiring_type === 'new_graduate' ? '新卒' : '中途'}
現職: ${candidate.current_company || ''} ${candidate.current_title || ''}
大学: ${candidate.university || ''} ${candidate.faculty || ''}
職歴: ${JSON.stringify(candidate.work_experience || [])}
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

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `あなたは、候補者の人生の転機に寄り添う採用担当者です。
以下の候補者に対して、選考通過（合格）を伝えるオファーレターを作成してください。

このレターの目的は「合格を通知する」だけではありません。
候補者が「この会社に入りたい」と心から思えるような、感情に響くメッセージを届けることです。

■ 構成（必ずこの順序で）：
1. 【合格のお祝いと感謝】— 形式的でなく、心のこもった言葉で
2. 【あなたの強み】— 面接で見えた候補者固有の強みを、具体的なエピソードとともに言語化する。「○○の場面で見せた△△な姿勢は、まさに私たちが求めていたものです」のように
3. 【活躍への期待】— この人がこのポジションでどう輝けるか、具体的にイメージが湧く描写を。入社後の具体的なシーン・プロジェクト・チームとの関わりを含める
4. 【あなただけに伝えたいこと】— 候補者の志向性・価値観に合わせた個別メッセージ。「あなたが大切にしている○○という価値観は、当社の△△という文化と深く共鳴しています」
5. 【次のステップ】— 次の選考 or 入社までの流れを明確に

■ トーン：
- 定型文ではなく、「一人の人間として書いた手紙」のような温かさ
- 候補者の名前を適度に使い、パーソナルに
- 過度にフォーマルにならず、誠実さと熱意が伝わる文体

■ 禁止事項：
- 「貴殿」「ご査収ください」などの硬すぎるビジネス敬語
- 汎用的な定型文（他の誰にでも送れる文面は不可）
- 候補者の情報に言及しない抽象的な褒め言葉

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

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
