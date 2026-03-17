'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Copy,
  Send,
  Edit3,
  Eye,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'
import type { FeedbackLetter } from '@/lib/types'

export default function FeedbackLetterPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const interviewId = searchParams.get('interview')

  const candidate = getCandidateById(id)
  const app = candidate?.applications[0]

  // Determine which interview to show
  const selectedInterview = interviewId
    ? app?.interviews.find((i) => i.id === interviewId)
    : app?.interviews.filter((i) => i.status === 'completed').pop()

  const allCompletedInterviews = app?.interviews.filter((i) => i.status === 'completed') ?? []

  const [selectedInterviewId, setSelectedInterviewId] = useState(
    selectedInterview?.id ?? allCompletedInterviews[0]?.id
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerated, setShowGenerated] = useState(false)
  const [letterStatus, setLetterStatus] = useState<'draft' | 'reviewed' | 'sent'>(
    selectedInterview?.feedbackLetter?.status ?? 'draft'
  )
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('preview')
  const [copied, setCopied] = useState(false)

  const currentInterview = app?.interviews.find((i) => i.id === selectedInterviewId)
  const currentLetter = currentInterview?.feedbackLetter

  // Mock letter for int_002 that is in 'reviewed' state (shows it's ready to send)
  const displayLetter: FeedbackLetter | null = currentLetter ?? null

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowGenerated(true)
    }, 2000)
  }

  const handleMarkSent = () => {
    setLetterStatus('sent')
  }

  const handleCopy = () => {
    if (displayLetter) {
      const text = `件名: ${displayLetter.subject}\n\n${displayLetter.salutation}\n\n${displayLetter.passReasonSection}\n\n${displayLetter.passReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n${displayLetter.attractSection}\n\n${displayLetter.nextStepSection}\n\n${displayLetter.closing}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!candidate) return <div className="p-8">候補者が見つかりません</div>

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.fullName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">フィードバックレター</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-bold text-gray-900">選考通過フィードバックレター</h1>
          </div>
          <div className="flex gap-2">
            {displayLetter && displayLetter.status !== 'sent' && (
              <>
                <button onClick={handleCopy} className="btn-secondary">
                  <Copy className="w-4 h-4" />
                  {copied ? 'コピーしました！' : 'テキストをコピー'}
                </button>
                <button onClick={handleMarkSent} className="btn-primary">
                  <Send className="w-4 h-4" />
                  送付済みにする
                </button>
              </>
            )}
            {displayLetter?.status === 'sent' && (
              <span className="badge bg-emerald-100 text-emerald-700 px-3 py-1.5">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                送付済み
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Interview Selector */}
          <div className="space-y-4">
            <div className="card p-4">
              <p className="label mb-3">面接ステージを選択</p>
              <div className="space-y-2">
                {allCompletedInterviews.map((iv) => {
                  const hasLetter = !!iv.feedbackLetter
                  const letterSent = iv.feedbackLetter?.status === 'sent'
                  return (
                    <button
                      key={iv.id}
                      onClick={() => setSelectedInterviewId(iv.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedInterviewId === iv.id
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800">{iv.stageLabel}</p>
                        {letterSent ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : hasLetter ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-400">{iv.conductedAt ?? iv.scheduledAt}</p>
                      <div className="mt-1.5">
                        {letterSent ? (
                          <span className="badge bg-emerald-50 text-emerald-600 text-[10px]">送付済み</span>
                        ) : hasLetter ? (
                          <span className="badge bg-amber-50 text-amber-600 text-[10px]">未送付</span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-500 text-[10px]">レターなし</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Info Box */}
            <div className="card p-4 bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800 mb-1">フィードバックレターの効果</p>
                  <ul className="space-y-1">
                    {[
                      '合格理由を伝えることで「理解されている」感を演出',
                      '候補者シグナルに基づいた企業訴求で「フィットしている」感を強化',
                      '次ステップへの期待醸成で離脱防止',
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

            {/* Generate Button (if no letter) */}
            {!displayLetter && !showGenerated && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full btn-primary justify-center py-3"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AIでレターを生成する
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: Letter Display */}
          <div className="col-span-2">
            {displayLetter || showGenerated ? (
              <div className="card overflow-hidden">
                {/* Letter Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">件名</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {displayLetter?.subject ?? '【テクノベーション株式会社】一次面接の結果と次のステップについて'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveView('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeView === 'preview' ? 'bg-white border border-gray-200 text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />プレビュー
                    </button>
                    <button
                      onClick={() => setActiveView('edit')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeView === 'edit' ? 'bg-white border border-gray-200 text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />編集
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                {displayLetter && (
                  <div className={`px-6 py-2 flex items-center gap-2 text-xs ${
                    letterStatus === 'sent' ? 'bg-emerald-50 text-emerald-700' :
                    letterStatus === 'reviewed' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {letterStatus === 'sent' ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> 送付済み — {displayLetter.sentAt ?? '本日'}</>
                    ) : letterStatus === 'reviewed' ? (
                      <><AlertCircle className="w-3.5 h-3.5" /> 確認済み — まだ送付されていません。内容を確認して送付してください。</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> AI下書き — 送付前に内容を必ずご確認ください</>
                    )}
                  </div>
                )}

                {/* Letter Body */}
                <div className="p-8">
                  {activeView === 'preview' ? (
                    <div className="max-w-2xl">
                      {/* Salutation */}
                      <p className="text-base font-medium text-gray-900 mb-6">
                        {displayLetter?.salutation ?? `${candidate.fullName} 様`}
                      </p>

                      {/* Pass Reason Section */}
                      <div className="mb-6">
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {displayLetter?.passReasonSection ?? '先日は面接にお越しいただきありがとうございました。選考結果についてご連絡いたします。'}
                        </p>

                        {/* Pass Reasons - Highlighted */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <p className="text-sm font-semibold text-emerald-800">ご通過の理由</p>
                          </div>
                          <ul className="space-y-2">
                            {(displayLetter?.passReasons ?? []).map((reason, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-800">
                                <span className="text-emerald-400 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Attract Section */}
                      <div className="mb-6">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                              田中さんへのメッセージ
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {displayLetter?.attractSection}
                          </p>
                        </div>
                      </div>

                      {/* Next Step */}
                      <div className="mb-6">
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                          {displayLetter?.nextStepSection}
                        </p>
                      </div>

                      {/* Closing */}
                      <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-6">
                          {displayLetter?.closing}
                        </p>
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-sm text-gray-600">テクノベーション株式会社</p>
                          <p className="text-sm text-gray-600">採用担当 佐藤 彩花</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Edit View */
                    <div className="space-y-4 max-w-2xl">
                      <div>
                        <label className="label mb-1 block">宛名</label>
                        <input
                          type="text"
                          defaultValue={displayLetter?.salutation ?? `${candidate.fullName} 様`}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="label mb-1 block">冒頭文</label>
                        <textarea
                          defaultValue={displayLetter?.passReasonSection}
                          rows={4}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="label mb-1 block">合格理由（1件ずつ編集）</label>
                        {(displayLetter?.passReasons ?? []).map((reason, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <span className="text-xs text-gray-400 mt-2 font-bold w-4">{i + 1}.</span>
                            <textarea
                              defaultValue={reason}
                              rows={2}
                              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="label mb-1 block">企業訴求（Attractセクション）</label>
                        <div className="mb-1 text-xs text-indigo-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          候補者シグナル（裁量・スピード重視）に基づいて生成
                        </div>
                        <textarea
                          defaultValue={displayLetter?.attractSection}
                          rows={5}
                          className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="label mb-1 block">次ステップ説明</label>
                        <textarea
                          defaultValue={displayLetter?.nextStepSection}
                          rows={3}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="label mb-1 block">結び</label>
                        <textarea
                          defaultValue={displayLetter?.closing}
                          rows={2}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button className="btn-primary">変更を保存</button>
                        <button className="btn-secondary" onClick={() => setActiveView('preview')}>プレビューで確認</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Generation Note */}
                <div className="px-8 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    このレターはAIが以下を参照して生成しました:
                    評価コメント（山田CPO）/ 候補者シグナル（志向: 裁量・スピード重視）/ Attract戦略 / 企業魅力プロファイル
                    — <strong>送付前に内容を必ずご確認ください</strong>
                  </p>
                </div>
              </div>
            ) : (
              /* No Letter State */
              <div className="card p-12 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <h3 className="text-base font-semibold text-gray-700 mb-2">
                  フィードバックレターを生成する
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                  AIが評価コメントと候補者シグナルを元に、合格理由の説明と個別の企業訴求を含むレターを自動生成します。生成後は内容を確認・編集してから送付してください。
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary text-base px-6 py-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      生成中... （数秒かかります）
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AIでレターを生成する
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
