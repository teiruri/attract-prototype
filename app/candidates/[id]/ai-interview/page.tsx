'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Brain,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Target,
  Sparkles,
  Activity,
  User,
  Zap,
  FileText,
  Shield,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

// デモ用AI面談評価データ
const DEMO_AI_INTERVIEW = {
  importedAt: '2026-03-20 14:32',
  overallScore: 78,
  skills: [
    { name: '論理的思考力', score: 82, max: 100, description: '構造的に整理された回答が多く、因果関係の説明が明確' },
    { name: 'コミュニケーション力', score: 85, max: 100, description: '質問意図を正確に把握し、簡潔かつ具体的に回答' },
    { name: '主体性・積極性', score: 71, max: 100, description: '自発的な取り組み事例あり。逆質問の積極性にやや課題' },
    { name: 'ストレス耐性', score: 68, max: 100, description: '圧迫質問への対応は冷静だが、回答の深さにばらつき' },
    { name: '企業理解度', score: 84, max: 100, description: '事業内容・業界動向について十分な事前調査が見られる' },
  ],
  dialogExcerpts: [
    {
      question: 'これまでの経験で最も困難だった課題と、それをどう乗り越えたか教えてください。',
      answer: '前職でのプロジェクトで、クライアントの要件が二転三転し、チーム内の士気が下がった時期がありました。私はまず関係者全員と個別に話し合い、本質的な課題を整理しました。その上で優先順位を再定義し、週次の進捗共有を導入することで、チームの方向性を統一しました。結果的に納期内に品質を保った納品ができました。',
      aiComment: '具体的なエピソードで課題解決のプロセスを明確に説明。リーダーシップとコミュニケーション力が高く評価される。',
      score: 85,
    },
    {
      question: '当社を志望する理由と、入社後にどのような貢献ができると考えていますか？',
      answer: '御社が掲げる「テクノロジーで人の可能性を広げる」というミッションに強く共感しています。特に、HR Tech領域での取り組みは、私自身が前職で感じていた採用プロセスの課題と重なります。私の経験を活かして、プロダクト開発において候補者体験の向上に貢献したいと考えています。',
      aiComment: '企業研究が十分で、自身の経験と志望動機が論理的に接続されている。具体的な貢献イメージも明確。',
      score: 88,
    },
    {
      question: 'チームで意見が対立した場合、どのように対処しますか？',
      answer: 'まずは双方の意見を丁寧にヒアリングし、それぞれの根拠やゴールを明確にします。その上で、共通の目標に立ち返り、データや事実に基づいた議論を促します。最終的には全員が納得できる方向性を見つけることを重視しますが、時間的制約がある場合は責任者として判断を下すことも厭いません。',
      aiComment: '協調性と決断力のバランスが取れた回答。実務経験に基づく説得力がある。',
      score: 80,
    },
  ],
  personalityAssessment: {
    summary: '論理的かつ協調的なコミュニケーションスタイルを持ち、チームでの課題解決に強みを発揮するタイプ。計画性が高く、目標達成に向けた段取りを重視する傾向。一方で、予期せぬ変化への柔軟な対応力をさらに磨くことで、より大きな成果を出せるポテンシャルがある。',
    workStyle: '計画重視型・チーム協調型',
    strengths: ['構造的思考力', 'ステークホルダー調整力', '目標設定力'],
    developmentAreas: ['即興対応力', '自己開示の深さ'],
  },
  detailedTranscript: [
    { time: '00:00:15', speaker: 'AI', text: 'それでは面接を始めます。まず、自己紹介をお願いします。' },
    { time: '00:00:45', speaker: '候補者', text: '本日はよろしくお願いいたします。○○大学を卒業後、ITコンサルティング会社で3年間、システム導入プロジェクトに携わってまいりました。直近では人事系システムの導入を担当し、クライアントの採用プロセス改善に深く関わりました。' },
    { time: '00:01:30', speaker: 'AI', text: 'ありがとうございます。では、これまでの経験で最も困難だった課題について教えてください。' },
    { time: '00:02:00', speaker: '候補者', text: '前職でのプロジェクトで、クライアントの要件が二転三転し、チーム内の士気が下がった時期がありました。私はまず関係者全員と個別に話し合い、本質的な課題を整理しました...' },
    { time: '00:04:15', speaker: 'AI', text: '具体的な対処法を教えていただきありがとうございます。次に、当社を志望する理由についてお聞かせください。' },
    { time: '00:04:45', speaker: '候補者', text: '御社が掲げる「テクノロジーで人の可能性を広げる」というミッションに強く共感しています...' },
  ],
  recommendedFollowUp: [
    '前職での「要件変更」の具体的な状況と、クライアントとの交渉プロセスの詳細を深掘りする',
    '「予期せぬ変化への対応」について、失敗経験とそこからの学びを引き出す',
    '長期的なキャリアビジョンと当社での成長イメージの具体性を確認する',
    'チーム内でのリーダーシップ発揮場面について、メンバーからのフィードバック経験を聞く',
  ],
}

type ImportStatus = 'not_imported' | 'importing' | 'imported'

export default function AIInterviewPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)
  const [importStatus, setImportStatus] = useState<ImportStatus>('imported') // デモ用：取込済み
  const [showDetailedReport, setShowDetailedReport] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  if (!candidate) {
    return <div className="p-8 text-gray-500">候補者が見つかりません</div>
  }

  const handleImport = () => {
    setImportStatus('importing')
    setTimeout(() => setImportStatus('imported'), 2500)
  }

  const getStatusBadge = () => {
    switch (importStatus) {
      case 'not_imported':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <AlertCircle className="w-3.5 h-3.5" />
            未取込
          </span>
        )
      case 'importing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            処理中
          </span>
        )
      case 'imported':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            取込済み
          </span>
        )
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-500'
  }

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-violet-500'
    if (score >= 60) return 'bg-violet-400'
    return 'bg-violet-300'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/candidates/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-400">候補者管理</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link href={`/candidates/${id}`} className="text-sm text-gray-400 hover:text-gray-600">
            {candidate.fullName}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-sm text-gray-700 font-medium">AI面談</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  AI面談（AIレコメン連携）
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                    <Zap className="w-3 h-3" />
                    アイエンター
                  </span>
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  オプション機能 - アイエンター社 AIレコメン と連携
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <a
              href="https://www.i-enter.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 transition-colors"
            >
              AIレコメン詳細
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-6xl">
        {/* Section 1: AI面談結果の取り込み */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-violet-500" />
            AI面談結果の取り込み
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={importStatus === 'importing'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${importStatus === 'importing' ? 'animate-spin' : ''}`} />
              AIレコメンから結果を取り込む
            </button>
            <span className="text-gray-300">|</span>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors">
              <Upload className="w-4 h-4" />
              面接結果データをアップロード
            </button>
          </div>
          {importStatus === 'imported' && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              最終取込: {DEMO_AI_INTERVIEW.importedAt}
            </p>
          )}
        </div>

        {/* Section 2: AI面談サマリー (imported時のみ表示) */}
        {importStatus === 'imported' && (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500" />
                AI面談サマリー
              </h2>

              {/* Overall Score + Skills Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <p className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-2">総合AI評価スコア</p>
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#e9d5ff" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke="#7c3aed" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(DEMO_AI_INTERVIEW.overallScore / 100) * 327} 327`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-violet-700">{DEMO_AI_INTERVIEW.overallScore}</span>
                      <span className="text-xs text-violet-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* Skills Assessment */}
                <div className="lg:col-span-2 space-y-3">
                  <p className="text-sm font-semibold text-gray-700 mb-3">コミュニケーション能力評価（5項目）</p>
                  {DEMO_AI_INTERVIEW.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-medium">{skill.name}</span>
                        <span className={`text-sm font-bold ${getScoreColor(skill.score)}`}>
                          {skill.score}<span className="text-gray-400 font-normal text-xs">/{skill.max}</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBarColor(skill.score)} transition-all duration-500`}
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Dialogue Excerpts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-500" />
                注目の質疑応答
              </h2>
              <div className="space-y-4">
                {DEMO_AI_INTERVIEW.dialogExcerpts.map((excerpt, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:border-violet-200 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Brain className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-violet-600 mb-1">Q. AI質問</p>
                        <p className="text-sm text-gray-700">{excerpt.question}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mb-3 ml-9">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">A. 候補者回答</p>
                        <p className="text-sm text-gray-600">{excerpt.answer}</p>
                      </div>
                    </div>
                    <div className="ml-9 pl-3 border-l-2 border-violet-200 bg-violet-50/50 rounded-r-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-violet-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI評価コメント
                        </p>
                        <span className={`text-xs font-bold ${getScoreColor(excerpt.score)}`}>
                          スコア: {excerpt.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{excerpt.aiComment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality/Work-style Assessment */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />
                AIパーソナリティ・業務スタイル評価
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                  <p className="text-xs font-medium text-violet-600 mb-1">ワークスタイル分類</p>
                  <p className="text-sm font-bold text-gray-900">{DEMO_AI_INTERVIEW.personalityAssessment.workStyle}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-600 mb-1">強み</p>
                  <div className="flex flex-wrap gap-1">
                    {DEMO_AI_INTERVIEW.personalityAssessment.strengths.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-white rounded text-xs text-emerald-700 border border-emerald-200">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-medium text-amber-600 mb-1">成長ポイント</p>
                  <div className="flex flex-wrap gap-1">
                    {DEMO_AI_INTERVIEW.personalityAssessment.developmentAreas.map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-white rounded text-xs text-amber-700 border border-amber-200">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">{DEMO_AI_INTERVIEW.personalityAssessment.summary}</p>
              </div>
            </div>

            {/* Section 4: システム連携状況 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                システム連携状況
              </h2>
              <div className="space-y-2.5">
                {[
                  { label: '候補者カルテに反映済み', icon: FileText },
                  { label: '惹きつけメモの算出に使用', icon: Sparkles },
                  { label: '通過・内定レター生成に反映', icon: Target },
                  { label: '面接準備シートに反映', icon: MessageSquare },
                  { label: '内定予測・承諾予測の算出に使用', icon: TrendingUp },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                    <item.icon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
                <p className="text-xs text-violet-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  AIレコメンでの面接内容は、すべての選考プロセスに自動で反映されます
                </p>
              </div>
            </div>

            {/* Section 5: AIレコメン詳細レポート (expandable) */}
            <div className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowDetailedReport(!showDetailedReport)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors rounded-xl"
              >
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-500" />
                  AIレコメン詳細レポート
                </h2>
                {showDetailedReport ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showDetailedReport && (
                <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-4">
                  {/* Transcript */}
                  <div>
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 hover:text-violet-600 transition-colors"
                    >
                      {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      面接トランスクリプト（抜粋）
                    </button>
                    {showTranscript && (
                      <div className="space-y-2 pl-2">
                        {DEMO_AI_INTERVIEW.detailedTranscript.map((entry, idx) => (
                          <div key={idx} className="flex items-start gap-3 py-2">
                            <span className="text-[11px] font-mono text-gray-400 w-16 flex-shrink-0 pt-0.5">{entry.time}</span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              entry.speaker === 'AI' ? 'bg-violet-100' : 'bg-gray-100'
                            }`}>
                              {entry.speaker === 'AI' ? (
                                <Brain className="w-3 h-3 text-violet-600" />
                              ) : (
                                <User className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className={`text-xs font-medium mb-0.5 ${
                                entry.speaker === 'AI' ? 'text-violet-600' : 'text-gray-500'
                              }`}>{entry.speaker}</p>
                              <p className="text-sm text-gray-700">{entry.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Behavioral Analysis Chart (CSS-based radar approximation) */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">行動特性分析</p>
                    <div className="grid grid-cols-5 gap-2">
                      {DEMO_AI_INTERVIEW.skills.map((skill) => (
                        <div key={skill.name} className="flex flex-col items-center">
                          <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '120px' }}>
                            <div className="w-full flex items-end justify-center h-full">
                              <div
                                className="w-8 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md transition-all duration-700"
                                style={{ height: `${(skill.score / 100) * 100}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1.5 text-center leading-tight">{skill.name}</p>
                          <p className="text-xs font-bold text-violet-600">{skill.score}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Follow-up Questions */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">次回面接への推奨フォローアップ質問</p>
                    <div className="space-y-2">
                      {DEMO_AI_INTERVIEW.recommendedFollowUp.map((q, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 bg-violet-50/50 rounded-lg border border-violet-100">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-gray-700">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
