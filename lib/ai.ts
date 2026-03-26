/**
 * Claude API を使用したAI生成モジュール
 * HR FARM MVP - マッチ分析、惹きつけストーリー、選考結果レター、面接申し送り
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

async function callClaude(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY が設定されていません')

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

// ============================================================
// マッチ度解析
// ============================================================

export interface MatchAnalysisInput {
  candidateName: string
  candidateProfile: string       // 履歴書・ESから抽出したテキスト
  documents?: string[]           // アップロードされた書類のテキスト
  targetPersona: Record<string, unknown>  // 求人のターゲットペルソナ
  jobTitle: string
  companyProfile?: Record<string, unknown>
}

export interface MatchAnalysisResult {
  overall_match_score: number    // 0-100
  persona_fit: { score: number; analysis: string }
  strengths: string[]
  gaps: string[]
  summary: string
}

export async function analyzeMatch(input: MatchAnalysisInput): Promise<MatchAnalysisResult> {
  const systemPrompt = `あなたは「応募者体験を設計し、承諾率を高める」採用プラットフォームのAIです。候補者の情報とターゲットペルソナを比較し、マッチ度を分析してください。
この分析結果は、候補者一人ひとりに合わせた惹きつけ戦略の土台となります。

分析の観点:
- スキル・経験のマッチ度
- 志向性・価値観の合致度
- カルチャーフィット
- 成長ポテンシャル
- 承諾率に影響する動機づけ要因

以下のJSON形式で回答してください（日本語で）:
{
  "overall_match_score": 0-100の数値,
  "persona_fit": {
    "score": 0-100の数値,
    "analysis": "ペルソナとのフィット分析（2-3文）"
  },
  "strengths": ["強み1", "強み2", "強み3"],
  "gaps": ["ギャップ1", "ギャップ2"],
  "summary": "総合的な所見（3-4文。候補者の魅力と課題をバランスよく記述）"
}

JSONのみを返してください。`

  const userMessage = `
## 求人: ${input.jobTitle}

## ターゲットペルソナ
${JSON.stringify(input.targetPersona, null, 2)}

## 候補者: ${input.candidateName}
${input.candidateProfile}

${input.documents?.length ? `## アップロード書類の内容\n${input.documents.join('\n\n---\n\n')}` : ''}

${input.companyProfile ? `## 企業情報\n${JSON.stringify(input.companyProfile, null, 2)}` : ''}
`

  const result = await callClaude(systemPrompt, [{ role: 'user', content: userMessage }])
  return JSON.parse(result)
}

// ============================================================
// 惹きつけストーリー生成
// ============================================================

export interface AttractStoryInput {
  candidateName: string
  candidateProfile: string
  matchAnalysis?: MatchAnalysisResult
  companyProfile: Record<string, unknown>
  jobTitle: string
}

export interface AttractStoryResult {
  story_text: string
  key_messages: string[]
  personalized_evp: Record<string, string>
  talking_points: string[]
}

export async function generateAttractStory(input: AttractStoryInput): Promise<AttractStoryResult> {
  const systemPrompt = `あなたは「応募者体験を設計し、承諾率を高める」採用プラットフォームのAIです。候補者一人ひとりに合わせた「惹きつけストーリー」を作成してください。
このストーリーは承諾率向上の鍵です。候補者が選考プロセス全体を通じて「この会社に入りたい」と思い続けられるような体験設計の一環です。

惹きつけストーリーとは:
- この候補者が「この会社で働きたい」と思えるような、パーソナライズされたメッセージ
- 候補者の志向・価値観・キャリア目標に響くポイントを企業の魅力と結びつける
- 押しつけがましくなく、自然で誠実なトーン
- 具体的なエピソードや事実に基づく
- 候補者の転職軸・意思決定要因に直接響く内容を含める

以下のJSON形式で回答してください:
{
  "story_text": "惹きつけストーリー本文（400-600字。候補者に直接語りかける形式で）",
  "key_messages": ["核心メッセージ1", "核心メッセージ2", "核心メッセージ3"],
  "personalized_evp": {
    "候補者が重視する価値1": "企業がそれに応えられる具体的な根拠",
    "候補者が重視する価値2": "企業がそれに応えられる具体的な根拠"
  },
  "talking_points": ["面接官が伝えるべきポイント1", "ポイント2", "ポイント3"]
}

JSONのみを返してください。`

  const userMessage = `
## 候補者: ${input.candidateName}
${input.candidateProfile}

${input.matchAnalysis ? `## マッチ分析結果\n${JSON.stringify(input.matchAnalysis, null, 2)}` : ''}

## 企業の魅力
${JSON.stringify(input.companyProfile, null, 2)}

## 求人: ${input.jobTitle}
`

  const result = await callClaude(systemPrompt, [{ role: 'user', content: userMessage }], 3000)
  return JSON.parse(result)
}

// ============================================================
// 選考結果レター生成
// ============================================================

export interface ResultLetterInput {
  candidateName: string
  candidateProfile: string
  stage: string              // interview_1 ~ interview_final
  stageLabel: string         // 一次選考 ~ 最終選考
  isPass: boolean
  interviewData?: {
    interviewText?: string
    candidateSurvey?: Record<string, unknown>
    interviewerEvaluation?: Record<string, unknown>
  }
  companyProfile?: Record<string, unknown>
  previousInterviews?: Array<{ stage: string; summary?: string }>
}

export interface ResultLetterResult {
  subject: string
  body: string
  temperature: string        // warm, personal, celebratory
  result: 'pass' | 'fail'
  stage: string
}

export async function generateResultLetter(input: ResultLetterInput): Promise<ResultLetterResult> {
  // 段階に応じた温度感の指示
  const toneGuide = getToneGuide(input.stage, input.isPass)

  const systemPrompt = `あなたは「応募者体験を設計し、承諾率を高める」採用プラットフォームのAIです。候補者への選考結果通知レターを作成してください。
各選考ステップでの候補者体験が承諾率に直結します。合格レターは「次もこの会社の選考を受けたい」と思わせる重要なタッチポイントです。

## 温度感の指針
${toneGuide}

## 重要なルール
- 候補者の名前で呼びかける
- 面接で話した具体的な内容に触れる（面接データがある場合）
- 合格の場合: 次のステップへの期待感と、候補者の魅力を具体的に伝える
- 不合格の場合: 敬意を持ち、候補者の良かった点を認めた上で、丁寧にお伝えする
- 形式的・事務的になりすぎない。人間味のある文章で。

以下のJSON形式で回答してください:
{
  "subject": "メールの件名",
  "body": "メール本文（改行は\\nで表現）",
  "temperature": "${input.isPass ? (input.stage === 'interview_final' ? 'celebratory' : 'warm') : 'respectful'}",
  "result": "${input.isPass ? 'pass' : 'fail'}",
  "stage": "${input.stage}"
}

JSONのみを返してください。`

  const userMessage = `
## 候補者: ${input.candidateName}
${input.candidateProfile}

## 選考ステージ: ${input.stageLabel}
## 結果: ${input.isPass ? '合格（通過）' : '不合格'}

${input.interviewData?.interviewText ? `## 面接内容\n${input.interviewData.interviewText}` : ''}
${input.interviewData?.candidateSurvey ? `## 候補者アンケート\n${JSON.stringify(input.interviewData.candidateSurvey, null, 2)}` : ''}
${input.interviewData?.interviewerEvaluation ? `## 面接官評価\n${JSON.stringify(input.interviewData.interviewerEvaluation, null, 2)}` : ''}

${input.previousInterviews?.length ? `## これまでの選考履歴\n${input.previousInterviews.map(i => `- ${i.stage}: ${i.summary || '(記録なし)'}`).join('\n')}` : ''}

${input.companyProfile ? `## 企業情報\n${JSON.stringify(input.companyProfile, null, 2)}` : ''}
`

  const result = await callClaude(systemPrompt, [{ role: 'user', content: userMessage }], 3000)
  return JSON.parse(result)
}

function getToneGuide(stage: string, isPass: boolean): string {
  if (!isPass) {
    return `不合格通知です。候補者への敬意を最優先に。
- 感謝の気持ちを丁寧に伝える
- 面接で感じた候補者の良い点を具体的に述べる
- 今後の活躍を心から応援する気持ちを込める
- 決して上から目線にならない`
  }

  switch (stage) {
    case 'interview_1':
      return `一次選考通過の通知です。
- 温かみのあるプロフェッショナルなトーン
- 堅すぎず、でも礼儀正しく
- 候補者との対話で印象に残った点に触れる
- 次の選考への期待感を自然に伝える`

    case 'interview_2':
    case 'interview_3':
      return `${stage === 'interview_2' ? '二' : '三'}次選考通過の通知です。
- より個人に寄り添ったパーソナルなトーン
- 選考が進むにつれて「この候補者のことをよく理解している」ことが伝わるように
- 候補者の強みやポテンシャルに具体的に言及
- 互いの理解が深まっていることを感じさせる`

    case 'interview_4':
      return `四次選考通過の通知です。
- 熱量が高まったトーン
- 「あなたと一緒に働きたい」という気持ちが滲むように
- これまでの選考プロセス全体を振り返りつつ
- 最終選考への特別感を演出する`

    case 'interview_final':
      return `【内定通知】これは候補者にとっての一大イベントです。
- 心に響く、特別感のあるトーン
- 「あなたを選んだ」ではなく「一緒に未来を創りたい」という姿勢
- これまでの選考で見てきた候補者の魅力を総括する
- 入社後のビジョンや期待を具体的に描く
- 候補者の人生の大きな決断に対する敬意
- 喜びと期待感が伝わる、記憶に残るレター`

    default:
      return '丁寧で誠実なトーンで。'
  }
}

// ============================================================
// 面接申し送り生成
// ============================================================

export interface HandoverNoteInput {
  candidateName: string
  candidateProfile: string
  currentStage: string
  currentStageLabel: string
  nextStage: string
  nextStageLabel: string
  interviewData: {
    interviewText?: string
    candidateSurvey?: Record<string, unknown>
    interviewerEvaluation?: Record<string, unknown>
  }
  previousInterviews?: Array<{ stage: string; summary?: string }>
  matchAnalysis?: MatchAnalysisResult
}

export interface HandoverNoteResult {
  summary: string
  key_observations: string[]
  recommended_approach: string
  concerns_to_address: string[]
  candidate_temperature: number  // 1-10
  next_stage_focus: string
  questions_for_next: string[]
}

export async function generateHandoverNote(input: HandoverNoteInput): Promise<HandoverNoteResult> {
  const systemPrompt = `あなたは「応募者体験を設計し、承諾率を高める」採用プラットフォームのAIです。次の面接官が最高の面接を行えるよう、申し送りメモを作成してください。
申し送りの質が面接の質を決め、面接の質が候補者体験を決め、候補者体験が承諾率を決めます。

## 申し送りメモの目的
- 次の面接官が候補者を理解した上で面接に臨めるようにする
- これまでの選考で得られた情報を簡潔にまとめる
- 次の面接で確認すべきポイントを明確にする
- 候補者の温度感（志望度）を共有する
- 候補者の動機づけ要因を伝え、惹きつけポイントを面接官が活用できるようにする

以下のJSON形式で回答してください:
{
  "summary": "候補者の概要と現在の選考状況（3-4文）",
  "key_observations": ["これまでの面接で得られた重要な所見1", "所見2", "所見3"],
  "recommended_approach": "次回面接での推奨アプローチ（2-3文）",
  "concerns_to_address": ["確認・解消すべき懸念点1", "懸念点2"],
  "candidate_temperature": 1-10の数値（候補者の志望度。10が最も高い）,
  "next_stage_focus": "次の面接で特に注力すべきテーマ",
  "questions_for_next": ["次の面接官が聞くべき質問1", "質問2", "質問3"]
}

JSONのみを返してください。`

  const userMessage = `
## 候補者: ${input.candidateName}
${input.candidateProfile}

## 現在のステージ: ${input.currentStageLabel} → 次: ${input.nextStageLabel}

## 今回の面接データ
${input.interviewData.interviewText ? `### 面接内容\n${input.interviewData.interviewText}` : '面接テキストなし'}
${input.interviewData.candidateSurvey ? `### 候補者アンケート\n${JSON.stringify(input.interviewData.candidateSurvey, null, 2)}` : ''}
${input.interviewData.interviewerEvaluation ? `### 面接官評価\n${JSON.stringify(input.interviewData.interviewerEvaluation, null, 2)}` : ''}

${input.previousInterviews?.length ? `## 過去の面接履歴\n${input.previousInterviews.map(i => `- ${i.stage}: ${i.summary || '(記録なし)'}`).join('\n')}` : ''}

${input.matchAnalysis ? `## マッチ分析\nスコア: ${input.matchAnalysis.overall_match_score}/100\n${input.matchAnalysis.summary}` : ''}
`

  const result = await callClaude(systemPrompt, [{ role: 'user', content: userMessage }], 2000)
  return JSON.parse(result)
}
