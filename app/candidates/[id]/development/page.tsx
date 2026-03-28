'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Users,
  Brain,
  ArrowRight,
  FileText,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  UserCheck,
  ClipboardCheck,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

// --- Mock Data ---

const COMPETENCIES = [
  { name: '技術スキル', current: 85, required: 80 },
  { name: 'マネジメント経験', current: 60, required: 80 },
  { name: '業界知識', current: 70, required: 60 },
  { name: 'コミュニケーション力', current: 90, required: 85 },
  { name: '戦略思考', current: 65, required: 75 },
  { name: 'チームビルディング', current: 55, required: 70 },
]

type Severity = '要改善' | '要強化' | '要経験'

interface DevelopmentArea {
  area: string
  severity: Severity
  currentState: string
  needed: string
  suggestedActions: string[]
  ngExample: string
  recommendedPhrasing: string
  timing: string
  communicator: string
}

const DEVELOPMENT_AREAS: DevelopmentArea[] = [
  {
    area: 'マネジメント経験',
    severity: '要強化',
    currentState:
      '現職でのリーダー経験が限定的。5名以上のチームマネジメント経験が求められるが、最大3名の指導経験のみ。',
    needed:
      '5名以上のチーム運営経験、もしくはそれに準ずるリーダーシップ実績が必要。メンバー育成・評価の経験も求められる。',
    suggestedActions: [
      '最終面接でリーダーシップ経験について深掘り質問を実施',
      '現職での非公式なリーダーシップ（メンター、プロジェクトリード等）を確認',
      '入社後の育成プランにマネジメント研修を組み込み検討',
    ],
    ngExample: 'マネジメント経験が足りません。5名以上のチーム経験がないと厳しいです。',
    recommendedPhrasing:
      '入社後、より大きなチームをお任せしたいと考えています。そのための準備として、現職で3名→5名規模のプロジェクトリードに挑戦してみてはいかがでしょうか。',
    timing: '二次面接後のフォローアップ面談で',
    communicator: 'リクルーター佐藤 → 候補者',
  },
  {
    area: '戦略思考',
    severity: '要経験',
    currentState:
      '事業戦略への関与が少ない。プロダクト戦略の立案・実行経験を確認する必要あり。日常業務では戦術レベルの意思決定が中心。',
    needed:
      'プロダクトロードマップの策定や事業計画への参画経験。中長期視点での意思決定プロセスへの関与。',
    suggestedActions: [
      '次回面接で事業戦略に関するケーススタディ質問を追加',
      '過去のプロダクト戦略への関与度をヒアリング',
      '入社後にストラテジーワークショップへの参加機会を提供',
    ],
    ngExample: '戦略的な思考が弱いので、もっと上流の経験を積んでください。',
    recommendedPhrasing:
      '田中さんの実行力は非常に高く評価しています。次のステップとして、より上流の戦略立案にも関わる機会を一緒に作っていきたいと考えています。',
    timing: '最終面接前のカジュアル面談で',
    communicator: 'リクルーター佐藤 → 候補者',
  },
  {
    area: 'チームビルディング',
    severity: '要改善',
    currentState:
      '組織づくりの経験が不足。採用・育成への関与度を確認。チーム文化の形成やオンボーディング設計の経験が限定的。',
    needed:
      '採用面接への参加経験、チーム文化の構築、新メンバーのオンボーディング設計など組織づくり全般への関与。',
    suggestedActions: [
      '現職での採用・オンボーディング関与度をリクルーターからヒアリング',
      'チーム文化に関する価値観をカジュアル面談で確認',
      '入社後のチームビルディング研修プランを検討',
    ],
    ngExample: 'チームビルディングの経験がないのが心配です。組織づくりは未経験ですか？',
    recommendedPhrasing:
      '弊社では組織拡大フェーズにあり、チームづくりに情熱を持てる方を求めています。田中さんがこれまでチームの雰囲気づくりで工夫されたことがあれば、ぜひお聞かせください。',
    timing: '二次面接のアイスブレイクで自然に質問',
    communicator: '面接官（中村 エンジニアリングリード）→ 候補者',
  },
]

const INTERVIEWER_COMMENTS = [
  {
    name: '山田 CPO',
    role: 'CPO',
    comment:
      'プロダクトへの理解は深い。ただし、組織横断のファシリテーション経験がもう少し欲しい。ポテンシャルは十分感じる。',
    date: '2026-03-20',
  },
  {
    name: '中村 エンジニアリングリード',
    role: 'エンジニアリングリード',
    comment:
      '技術的な素養は十分。開発チームとの協業スタイルについてもう少し具体例が欲しかった。次回面接で深掘りしたい。',
    date: '2026-03-18',
  },
]

const ACTION_PLAN = [
  {
    label: '次回面接',
    date: '2026-03-28',
    description: '戦略思考の深掘り質問を3問追加（面接準備シートに反映済み）',
    status: 'scheduled' as const,
  },
  {
    label: 'フォローアップ',
    date: '2026-04-02',
    description: 'リクルーターから現職でのリーダーシップ機会について相談',
    status: 'pending' as const,
  },
  {
    label: '内定条件',
    date: '2026-04-10',
    description: '入社後3ヶ月の育成プランを提示し、成長ロードマップを共有',
    status: 'pending' as const,
  },
]

// --- Helpers ---

function getGapColor(current: number, required: number) {
  const gap = required - current
  if (gap <= 0) return { bar: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50', label: '達成' }
  if (gap < 15) return { bar: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50', label: `−${gap}%` }
  return { bar: 'bg-red-500', badge: 'text-red-700 bg-red-50', label: `−${gap}%` }
}

function getSeverityStyle(severity: Severity) {
  switch (severity) {
    case '要改善':
      return 'bg-red-50 text-red-700 border-red-200'
    case '要強化':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case '要経験':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
}

// --- Component ---

export default function DevelopmentFeedbackPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)
  const [expandedAreas, setExpandedAreas] = useState<Record<number, boolean>>({ 0: true })
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(INTERVIEWER_COMMENTS)
  const [analysisUpdating, setAnalysisUpdating] = useState(false)

  if (!candidate) {
    return <div className="p-8 text-gray-500">候補者が見つかりません</div>
  }

  const toggleArea = (index: number) => {
    setExpandedAreas((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleUpdateAnalysis = () => {
    setAnalysisUpdating(true)
    setTimeout(() => setAnalysisUpdating(false), 1500)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    setComments((prev) => [
      ...prev,
      { name: 'あなた', role: 'リクルーター', comment: newComment, date: '2026-03-23' },
    ])
    setNewComment('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600 transition-colors">
            候補者一覧
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600 transition-colors">
            {candidate.fullName}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">育成フィードバック</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">候補者育成フィードバック</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-7.5">
              内定に向けた成長ポイントを把握し、候補者に建設的に伝える
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">候補者:</span>
            <div className={`w-8 h-8 rounded-full ${candidate.avatarColor} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{candidate.avatarInitials[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{candidate.fullName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Section 1: AIギャップ分析 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900">AIギャップ分析</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              最終更新: 2026-03-22
            </span>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 mb-6">
              候補者の現在のスキルレベルとポジション要件を比較し、ギャップを可視化しています。
            </p>
            <div className="space-y-4">
              {COMPETENCIES.map((comp) => {
                const colors = getGapColor(comp.current, comp.required)
                const maxVal = Math.max(comp.current, comp.required)
                return (
                  <div key={comp.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{comp.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          現在 {comp.current}% / 要件 {comp.required}%
                        </span>
                        {comp.current >= comp.required ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                            <CheckCircle className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                            {colors.label}
                          </span>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                            {colors.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${(comp.current / maxVal) * 100}%` }}
                      />
                      <div
                        className="absolute inset-y-0 w-0.5 bg-gray-600"
                        style={{ left: `${(comp.required / maxVal) * 100}%` }}
                        title={`要件: ${comp.required}%`}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                        <span className="text-xs text-gray-400">現在レベル</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-gray-600 inline-block" />
                        <span className="text-xs text-gray-400">要件ライン</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Section 2: 育成が必要なポイント */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">育成が必要なポイント</h2>
            <span className="ml-auto text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              {DEVELOPMENT_AREAS.length}件
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {DEVELOPMENT_AREAS.map((area, idx) => {
              const isExpanded = expandedAreas[idx] ?? false
              return (
                <div key={area.area}>
                  <button
                    onClick={() => toggleArea(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{area.area}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getSeverityStyle(area.severity)}`}
                      >
                        {area.severity}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            現状
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">{area.currentState}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                            内定レベルに必要なこと
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">{area.needed}</p>
                        </div>
                      </div>
                      <div className="bg-amber-50/50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                          推奨アクション
                        </p>
                        <ul className="space-y-1.5">
                          {area.suggestedActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 3: 候補者への伝え方ガイド */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">候補者への伝え方ガイド</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {DEVELOPMENT_AREAS.map((area) => (
              <div key={area.area} className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-gray-900">{area.area}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NG例 */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-red-500 font-bold text-sm">&#10005;</span>
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                        NG例
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 italic">&ldquo;{area.ngExample}&rdquo;</p>
                  </div>

                  {/* 推奨伝達例 */}
                  <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                        推奨伝達例
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">&ldquo;{area.recommendedPhrasing}&rdquo;</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-gray-500">伝えるタイミング:</span>
                    <span className="text-gray-700 font-medium">{area.timing}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-gray-500">伝える人:</span>
                    <span className="text-gray-700 font-medium">{area.communicator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: 面接官・リクルーター所感入力 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900">面接官・リクルーター所感</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {comments.map((c, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">{c.name[0]}</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className="text-xs text-gray-400">{c.role}</span>
                    </div>
                    <span className="text-xs text-gray-400">{c.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.comment}</p>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">所感を追加</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="面接での印象や追加の観察事項を入力してください..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={handleUpdateAnalysis}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  {analysisUpdating ? 'AI分析を更新中...' : 'AI分析を更新'}
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  所感を保存
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: アクションプラン */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">アクションプラン</h2>
          </div>
          <div className="px-6 py-5">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {ACTION_PLAN.map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        item.status === 'scheduled'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {item.status === 'scheduled' ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                          {item.status === 'scheduled' && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                              予定済み
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">分析結果を他のフローに反映できます</p>
            <div className="flex items-center gap-3">
              <Link
                href={`/candidates/${id}/brief`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                面接準備シートに反映
              </Link>
              <Link
                href={`/candidates/${id}/feedback-letter`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                合格・通過レターに反映
              </Link>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <FileText className="w-4 h-4" />
                PDF出力
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
