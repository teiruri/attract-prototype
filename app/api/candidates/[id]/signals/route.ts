import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// シグナル生成（AI）
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await context.params
    const body = await req.json()
    const { candidate, job, revp, interviews, documents, survey_text, memo_text } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const anthropic = new Anthropic({ apiKey })

    // ---- 候補者情報 ----
    const candidateInfo = `
【候補者基本情報】
氏名: ${candidate?.full_name || '不明'}
採用タイプ: ${candidate?.hiring_type === 'new_graduate' ? '新卒' : '中途'}
現職: ${candidate?.current_company || ''} ${candidate?.current_title || ''}
大学: ${candidate?.university || ''} ${candidate?.faculty || ''}
職歴: ${JSON.stringify(candidate?.work_experience || [])}
`.trim()

    // ---- 求人情報 ----
    const jobInfo = job ? `
【求人情報】
ポジション: ${job.title || '未設定'}
部署: ${job.department || '未設定'}
求人概要: ${job.description || '未設定'}
必須要件: ${(job.requirements || []).join(', ') || '未設定'}
`.trim() : ''

    // ---- REVP情報 ----
    const revpInfo = revp ? `
【企業REVP情報】
自社の強み: ${(revp.strengths || []).join('、') || '未設定'}
候補者への重要メッセージ: ${(revp.messages || []).join('、') || '未設定'}
魅力エピソード: ${(revp.episodes || []).join('、') || '未設定'}
`.trim() : ''

    // ---- 面接評価データ ----
    const interviewsInfo = (interviews || []).map((iv: any) => `
【${iv.stage}】
面接日: ${iv.interview_date || '不明'}
面接官: ${iv.interviewer_name || '未設定'}（${iv.interviewer_role || ''}）
評価: ${iv.interviewer_evaluation?.result || '未評価'}
志望度: ${iv.temperature_score || '未入力'}/10
合格理由: ${iv.interviewer_evaluation?.pass_reason || '未入力'}
申し送り（次面接官へ）: ${iv.interviewer_evaluation?.handoff_to_interviewer || '未入力'}
申し送り（人事へ）: ${iv.interviewer_evaluation?.handoff_to_hr || '未入力'}
面接メモ・書き起こし:
${iv.interview_text || '未入力'}
`).join('\n---\n')

    // ---- 書類（事前資料）----
    const documentsInfo = (documents || []).map((doc: any) =>
      `[${doc.file_name}] ${doc.extracted_text || ''}`
    ).join('\n\n')

    // ---- アンケート ----
    const surveyInfo = survey_text ? `
【選考後アンケート内容】
${survey_text}
` : ''

    // ---- メモテキスト（直接入力）----
    const memoInfo = memo_text ? `
【面接メモ・書き起こし（追加入力）】
${memo_text}
` : ''

    const prompt = `あなたは採用コンサルタント兼キャリアアドバイザーです。
以下の情報から、この候補者の「候補者シグナル」を構造化して抽出してください。

面接の録画書き起こし・面接メモ・選考後アンケート・事前資料（履歴書等）すべてを統合的に分析し、
候補者の本音・価値観・不安・ポジティブ反応・緊急アクションを特定してください。

【重要：面接官コメントの表現整形ルール】
面接官のメモ・合格理由・申し送りなどの社内コメントを抽出結果に活かす際は、以下を必ず守ること：
- くだけた口語調（例：「めっちゃ優秀」「ぶっちゃけ即戦力」）→ 丁寧なビジネス表現に変換する
- 失礼・不適切な表現（例：「見た目は頼りないが」「年齢の割に」）→ 候補者を尊重する表現に言い換える、または含めない
- 略語やスラング → 正式な表現に置き換える
- 社内向けの率直すぎる評価 → プロフェッショナルな表現に整える
- 面接官の生のコメントをそのままコピーせず、趣旨を汲み取って適切な言葉で再構成すること

${candidateInfo}

${jobInfo}

${revpInfo}

${interviewsInfo ? `【面接評価データ】\n${interviewsInfo}` : ''}

${documentsInfo ? `【事前資料（履歴書・職務経歴書等）】\n${documentsInfo}` : ''}

${surveyInfo}

${memoInfo}

以下のJSON形式で出力してください。必ず有効なJSONのみを返してください。マークダウンのコードブロックや説明文は不要です。

{
  "candidateName": "候補者名",
  "stage": "現在の選考ステージ",
  "careerValues": [
    {
      "value": "価値観の名前（例：裁量権・成長速度）",
      "strength": "high | medium | low",
      "evidence": "発言や行動の根拠（具体的な引用や観察）",
      "evpMatch": "自社EVPとのマッチポイント"
    }
  ],
  "positiveReactions": [
    {
      "topic": "ポジティブ反応のトリガー",
      "reaction": "候補者の具体的な反応",
      "matchStrength": "very_strong | strong | medium"
    }
  ],
  "concerns": [
    {
      "concern": "懸念事項",
      "severity": "high | medium | low",
      "status": "解消状況と推奨アクション"
    }
  ],
  "questionsAsked": ["候補者から出た質問リスト"],
  "energyLevel": 1〜5の数値,
  "attractAngle": "この候補者を惹きつけるための最適な訴求軸",
  "urgentActions": [
    {
      "action": "具体的なアクション内容",
      "priority": "high | medium"
    }
  ],
  "summary": "候補者シグナルの総合サマリー（3〜4文）"
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'シグナルの抽出に失敗しました', raw_text: responseText }, { status: 500 })
    }

    let signalData
    try {
      signalData = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'JSONパースに失敗しました', raw_text: responseText }, { status: 500 })
    }

    // Save signal to generated_outputs table
    const db = createServerClient()

    // First ensure the enum value exists
    try {
      await db.rpc('exec_sql', { sql: "ALTER TYPE generated_output_type ADD VALUE IF NOT EXISTS 'candidate_signal'" })
    } catch {
      // If rpc doesn't exist or fails, try direct insert anyway
    }

    const { error: insertError } = await db.from('generated_outputs').insert({
      tenant_id: '00000000-0000-0000-0000-000000000001',
      candidate_id: candidateId,
      output_type: 'candidate_signal',
      content: signalData,
      status: 'draft',
    })

    if (insertError) {
      console.warn('Signal save warning (signal still returned):', insertError.message)
      // If enum doesn't exist, try saving to candidate metadata instead
      try {
        const { data: existingCandidate } = await db
          .from('candidates')
          .select('metadata')
          .eq('id', candidateId)
          .single()

        const existingMeta = (existingCandidate?.metadata as Record<string, unknown>) || {}
        const existingSignals = (existingMeta.signals as any[]) || []
        existingSignals.unshift({ ...signalData, created_at: new Date().toISOString() })

        await db.from('candidates')
          .update({ metadata: { ...existingMeta, signals: existingSignals } })
          .eq('id', candidateId)
      } catch (metaErr) {
        console.warn('Signal metadata save also failed:', metaErr)
      }
    }

    return NextResponse.json({ signal: signalData })
  } catch (err) {
    console.error('signal generation error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// シグナル取得
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await context.params
    const db = createServerClient()

    // Try generated_outputs first
    const { data, error } = await db
      .from('generated_outputs')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('output_type', 'candidate_signal')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return NextResponse.json({ signals: data })
    }

    // Fallback: read from candidate metadata
    const { data: candidate } = await db
      .from('candidates')
      .select('metadata')
      .eq('id', candidateId)
      .single()

    const meta = (candidate?.metadata as Record<string, unknown>) || {}
    const metaSignals = (meta.signals as any[]) || []

    // Transform to match generated_outputs format
    const formatted = metaSignals.map((s: any, i: number) => ({
      id: `meta_${i}`,
      content: s,
      created_at: s.created_at || new Date().toISOString(),
      output_type: 'candidate_signal',
    }))

    return NextResponse.json({ signals: formatted })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
