'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Sparkles,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  MousePointerClick,
  Zap,
  Tag,
  ExternalLink,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

// Mock REVP appeal points
const REVP_APPEAL_POINTS = [
  '急成長フェーズで裁量権の大きいポジション',
  'リモートワーク可・フレックスタイム制',
  '技術スタック刷新プロジェクトに参画可能',
  'CTO直下の少数精鋭チーム',
]

// Mock job positions
const JOB_POSITIONS = [
  { id: 'job_001', title: 'シニアフロントエンドエンジニア', department: 'プロダクト開発部' },
  { id: 'job_002', title: 'バックエンドエンジニア（Go/Python）', department: 'プラットフォームチーム' },
  { id: 'job_003', title: 'プロダクトマネージャー', department: '事業企画部' },
  { id: 'job_004', title: 'データサイエンティスト', department: 'AI推進室' },
]

// Mock scout mail templates
const TEMPLATES = [
  { id: 'tpl_001', name: 'エンジニア向け（技術訴求型）', description: '技術スタックや開発環境を中心にアピール' },
  { id: 'tpl_002', name: 'マネージャー向け（キャリア訴求型）', description: 'キャリアパスや裁量権を中心にアピール' },
  { id: 'tpl_003', name: '若手向け（成長機会訴求型）', description: '成長環境やメンター制度を中心にアピール' },
]

// Mock sent history
const SENT_HISTORY = [
  {
    id: 'sm_001',
    sentAt: '2025-12-15',
    subject: '【テクノベーション】あなたのご経験を活かせるポジションのご案内',
    status: 'applied' as const,
    openedAt: '2025-12-15',
    respondedAt: '2025-12-18',
    responseType: '応募' as const,
  },
  {
    id: 'sm_002',
    sentAt: '2025-10-03',
    subject: '【テクノベーション】プロダクト開発チームからのご案内',
    status: 'opened' as const,
    openedAt: '2025-10-04',
    respondedAt: null,
    responseType: null,
  },
]

// Mock positive reaction data
const POSITIVE_REACTIONS = [
  {
    id: 'pr_001',
    scoutMailId: 'sm_001',
    sentDate: '2025-12-15',
    subject: '【テクノベーション】あなたのご経験を活かせるポジションのご案内',
    firstLine: 'はじめまして。テクノベーション株式会社で採用を担当しております佐藤と申します。',
    responseType: '応募' as const,
    respondedAt: '2025-12-18',
  },
]

function getStatusLabel(status: 'sent' | 'opened' | 'applied') {
  switch (status) {
    case 'sent': return '送信済み'
    case 'opened': return '開封'
    case 'applied': return '応募あり'
  }
}

function getStatusColor(status: 'sent' | 'opened' | 'applied') {
  switch (status) {
    case 'sent': return 'bg-gray-100 text-gray-600'
    case 'opened': return 'bg-blue-50 text-blue-600'
    case 'applied': return 'bg-emerald-50 text-emerald-600'
  }
}

function getResponseIcon(type: '応募' | '返信' | 'クリック') {
  switch (type) {
    case '応募': return <Send className="w-3.5 h-3.5" />
    case '返信': return <Mail className="w-3.5 h-3.5" />
    case 'クリック': return <MousePointerClick className="w-3.5 h-3.5" />
  }
}

export default function ScoutMailPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)

  const [selectedJob, setSelectedJob] = useState('')
  const [selectedAppealPoints, setSelectedAppealPoints] = useState<string[]>(REVP_APPEAL_POINTS.slice(0, 2))
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showJobDropdown, setShowJobDropdown] = useState(false)

  if (!candidate) {
    return <div className="p-8 text-gray-500">候補者が見つかりません</div>
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setHasGenerated(true)
      const job = JOB_POSITIONS.find((j) => j.id === selectedJob)
      setSubject(
        `【テクノベーション株式会社】${job?.title ?? 'エンジニアポジション'}のご案内 — ${candidate.fullName}様のご経験を拝見して`
      )
      setBody(
        `${candidate.fullName} 様\n\nはじめまして。テクノベーション株式会社で採用を担当しております佐藤と申します。\n\n${candidate.fullName}様のご経歴を拝見し、現在募集しております${job?.title ?? 'ポジション'}に非常にマッチすると感じ、ご連絡いたしました。\n\n▼ あなたにお伝えしたい当社の魅力\n${selectedAppealPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n現在、当社は急成長フェーズにあり、${job?.department ?? 'プロダクト開発部'}では中核メンバーとしてご活躍いただける方を求めております。\n\n${candidate.fullName}様の${candidate.currentTitle}としてのご経験は、まさに当社が求めているスキルセットと合致しており、ぜひ一度カジュアルにお話しできればと考えております。\n\nご興味をお持ちいただけましたら、下記よりご都合の良い日時をお選びください。\n\n何卒よろしくお願いいたします。\n\nテクノベーション株式会社\n採用担当 佐藤 彩花`
      )
    }, 2000)
  }

  const toggleAppealPoint = (point: string) => {
    setSelectedAppealPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    )
  }

  const hasPositiveReactions = POSITIVE_REACTIONS.length > 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.fullName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">スカウトメール</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-bold text-gray-900">スカウトメール作成</h1>
            <span className="text-sm text-gray-500">— {candidate.fullName}</span>
            {/* TRAY連携 badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
              <Zap className="w-3 h-3" />
              TRAY連携
            </span>
          </div>
          <Link href={`/candidates/${id}`} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            候補者に戻る
          </Link>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Composition Area (2 cols) */}
          <div className="col-span-2 space-y-6">
            {/* Job Position Selector */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                求人ポジション選択
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowJobDropdown(!showJobDropdown)}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors flex items-center justify-between"
                >
                  <span className={`text-sm ${selectedJob ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedJob
                      ? JOB_POSITIONS.find((j) => j.id === selectedJob)?.title
                      : 'ポジションを選択してください'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showJobDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                    {JOB_POSITIONS.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSelectedJob(job.id)
                          setShowJobDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-gray-800">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.department}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Appeal Points */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                訴求ポイント
              </h2>
              <p className="text-xs text-gray-400 mb-3">REVPデータからAIが提案 — クリックで選択/解除</p>
              <div className="flex flex-wrap gap-2">
                {REVP_APPEAL_POINTS.map((point) => {
                  const isSelected = selectedAppealPoints.includes(point)
                  return (
                    <button
                      key={point}
                      onClick={() => toggleAppealPoint(point)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      {point}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject & Body */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  メール本文
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    テンプレートから選択
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        AI生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AIで生成
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generation animation */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">スカウトメールを生成しています...</p>
                    <p className="text-xs text-gray-400 mt-1">REVP + 候補者プロフィールを参照中</p>
                  </div>
                </div>
              )}

              {!isGenerating && (
                <>
                  <div>
                    <label className="label mb-1.5 block">件名</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={hasGenerated ? '' : 'AIで生成すると自動入力されます'}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {hasGenerated && (
                      <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI自動生成 — 編集可能です
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label mb-1.5 block">本文</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={hasGenerated ? '' : 'AIで生成すると自動入力されます'}
                      rows={16}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
                    />
                  </div>

                  {hasGenerated && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        参照データ: REVP訴求ポイント / 候補者プロフィール / 求人情報 — <strong>送信前に内容を必ずご確認ください</strong>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleGenerate}
                          className="btn-secondary text-xs px-3 py-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          再生成
                        </button>
                        <button className="btn-primary text-xs px-4 py-2">
                          <Send className="w-3.5 h-3.5" />
                          TRAYで送信
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* TRAY連携 Info */}
            <div className="card p-4 bg-violet-50 border-violet-200">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-violet-800 mb-1">TRAY配信サービス連携</p>
                  <p className="text-xs text-violet-600 leading-relaxed">
                    スカウトメールはTRAYの配信エンジンを通じて送信されます。開封率・クリック率の計測、配信最適化が自動で行われます。
                  </p>
                </div>
              </div>
            </div>

            {/* Positive Reaction History */}
            {hasPositiveReactions && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ポジティブ反応履歴
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                    スカウト経由
                  </span>
                </div>
                <div className="space-y-3">
                  {POSITIVE_REACTIONS.map((reaction) => (
                    <div key={reaction.id} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {getResponseIcon(reaction.responseType)}
                        <span className="text-xs font-semibold text-emerald-700">{reaction.responseType}</span>
                        <span className="text-[10px] text-emerald-500">{reaction.respondedAt}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mb-1">{reaction.subject}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{reaction.firstLine}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">送信日: {reaction.sentDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <p className="text-[11px] text-indigo-600 leading-relaxed">
                    この反応履歴は選考設計・合格レター・カルテに自動反映されます
                  </p>
                </div>
              </div>
            )}

            {/* 送信履歴 */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                送信履歴
              </h3>
              {SENT_HISTORY.length > 0 ? (
                <div className="space-y-2">
                  {SENT_HISTORY.map((mail) => (
                    <div
                      key={mail.id}
                      className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-400">{mail.sentAt}</span>
                        <span className={`badge text-[10px] ${getStatusColor(mail.status)}`}>
                          {getStatusLabel(mail.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">{mail.subject}</p>
                      {mail.openedAt && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <Eye className="w-3 h-3 text-gray-300" />
                          <span className="text-[10px] text-gray-400">開封: {mail.openedAt}</span>
                        </div>
                      )}
                      {mail.respondedAt && (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Send className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-600 font-medium">{mail.responseType}: {mail.respondedAt}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">送信履歴はありません</p>
              )}
            </div>

            {/* Tips */}
            <div className="card p-4 bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800 mb-1">スカウトメールのコツ</p>
                  <ul className="space-y-1">
                    {[
                      '候補者の経歴に触れたパーソナライズが開封率を向上',
                      'REVPに基づく訴求で応募率が平均1.8倍に',
                      '簡潔な件名（30文字以内）が最も高い開封率',
                    ].map((t, i) => (
                      <li key={i} className="text-xs text-indigo-700 flex items-start gap-1">
                        <span className="text-indigo-400">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">テンプレートから選択</h3>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setShowTemplateModal(false)
                    setSubject(`【テクノベーション株式会社】${candidate.fullName}様へのご案内`)
                    setBody(`${candidate.fullName} 様\n\nはじめまして。テクノベーション株式会社 採用担当の佐藤です。\n\n[${tpl.name}テンプレートの内容がここに入ります]\n\nぜひ一度お話しできればと思います。\n\n何卒よろしくお願いいたします。\n\nテクノベーション株式会社\n採用担当 佐藤 彩花`)
                    setHasGenerated(true)
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">{tpl.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
