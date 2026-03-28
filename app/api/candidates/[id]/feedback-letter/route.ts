import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const STAGE_LABELS: Record<string, string> = {
  interview_1: '一次面接',
  interview_2: '二次面接',
  interview_3: '三次面接',
  interview_final: '最終面接',
}

function getStageName(stage: string): string {
  return STAGE_LABELS[stage] || stage
}

function getNextStageName(stage: string): string {
  const order = ['interview_1', 'interview_2', 'interview_3', 'interview_final']
  const idx = order.indexOf(stage)
  if (idx >= 0 && idx < order.length - 1) {
    return STAGE_LABELS[order[idx + 1]] || '次回面接'
  }
  return '次回選考'
}

function buildStagePassPrompt(
  candidateInfo: string,
  jobInfo: string,
  revpInfo: string,
  targetInterview: string,
  stageName: string,
  nextStageName: string,
): string {
  return `あなたは、候補者の選考体験を最高のものにする採用担当者です。
以下の候補者に対して、「${stageName}」の通過を伝える選考通過レターを作成してください。

このレターの目的は「通過を通知する」だけではありません。
候補者が次の選考に前向きな気持ちで臨めるよう、面接で感じた魅力を具体的に伝え、次のステップへの期待を高めることです。

■ 構成（必ずこの順序で）：
1. 【通過のお知らせ】— 「${stageName}を通過されましたことをお伝えいたします」という明確な通知。形式的すぎず、温かみのある表現で
2. 【面接での印象】— ${stageName}で見えた候補者固有の魅力・強みを、具体的なエピソードとともに伝える。「○○についてお話いただいた際の△△な視点は、非常に印象的でした」のように
3. 【次回のご案内】— ${nextStageName}で何を行うか、どんな方が面接官になるか（わかる範囲で）、候補者に準備してほしいことなどを案内
4. 【メッセージ】— 短い個人的な励まし。「次のステップでもお会いできることを楽しみにしています」のような前向きなメッセージ

■ トーン：
- 定型文ではなく、「一人の人間として書いた手紙」のような温かさ
- 候補者の名前を適度に使い、パーソナルに
- 前向きで、次のステップへのワクワク感を伝える
- 過度にフォーマルにならず、誠実さと熱意が伝わる文体

■ 禁止事項：
- 「貴殿」「ご査収ください」などの硬すぎるビジネス敬語
- 汎用的な定型文（他の誰にでも送れる文面は不可）
- 候補者の情報に言及しない抽象的な褒め言葉
- 内定・オファーを匂わせる表現（あくまで選考通過の通知）

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

${revpInfo}

対象面接の評価情報:
${targetInterview}`
}

function buildFinalOfferPrompt(
  candidateInfo: string,
  jobInfo: string,
  revpInfo: string,
  allInterviews: string,
): string {
  return `あなたは、候補者の人生の転機に寄り添う採用担当者です。
以下の候補者に対して、内定を伝える内定レターを作成してください。

このレターの目的は「内定を通知する」だけではありません。
候補者が「この会社に入りたい」と心から思えるような、感情に響くメッセージを届けることです。

■ 構成（必ずこの順序で）：
1. 【内定のお祝いと感謝】— 形式的でなく、心のこもった言葉で
2. 【あなたの強み】— 面接で見えた候補者固有の強みを、具体的なエピソードとともに言語化する。「○○の場面で見せた△△な姿勢は、まさに私たちが求めていたものです」のように
3. 【活躍への期待】— この人がこのポジションでどう輝けるか、具体的にイメージが湧く描写を。入社後の具体的なシーン・プロジェクト・チームとの関わりを含める
4. 【あなただけに伝えたいこと】— 候補者の志向性・価値観に合わせた個別メッセージ。「あなたが大切にしている○○という価値観は、当社の△△という文化と深く共鳴しています」
5. 【次のステップ】— 入社までの流れを明確に

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

${revpInfo}

面接評価情報:
${allInterviews}`
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { candidate, job, revp, interviews, letter_type, target_stage } = await req.json()

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

    const revpInfo = `企業REVP情報:
自社の強み: ${(revp?.strengths || []).join('、') || '未設定'}
候補者への重要メッセージ: ${(revp?.messages || []).join('、') || '未設定'}
魅力エピソード: ${(revp?.episodes || []).join('、') || '未設定'}`

    const formatInterview = (iv: any) => `
${iv.stage}: 結果=${iv.result || '未評価'}, 志望度=${iv.temperature_score || '未入力'}/10
面接官: ${iv.interviewer_name || '未設定'}
合格理由: ${iv.interviewer_evaluation?.pass_reason || '未入力'}
申し送り: ${iv.interviewer_evaluation?.handoff_to_interviewer || '未入力'}
面接メモ: ${iv.interview_text || '未入力'}
アンケート回答: ${iv.candidate_survey?.raw_text || (iv.candidate_survey && Object.keys(iv.candidate_survey).length > 0 ? JSON.stringify(iv.candidate_survey) : '未回収')}
`

    let prompt: string

    if (letter_type === 'stage_pass' && target_stage) {
      // Mode A: 選考通過レター
      const targetInterviewData = (interviews || []).filter((iv: any) => iv.stage === target_stage)
      const stageName = getStageName(target_stage)
      const nextStageName = getNextStageName(target_stage)

      prompt = buildStagePassPrompt(
        candidateInfo,
        jobInfo,
        revpInfo,
        targetInterviewData.map(formatInterview).join('\n'),
        stageName,
        nextStageName,
      )
    } else {
      // Mode B: 内定レター (final_offer or fallback)
      const allInterviews = (interviews || []).map(formatInterview).join('\n')

      prompt = buildFinalOfferPrompt(
        candidateInfo,
        jobInfo,
        revpInfo,
        allInterviews,
      )
    }

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
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
