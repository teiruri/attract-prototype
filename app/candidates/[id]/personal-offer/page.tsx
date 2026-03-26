'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Copy,
  Send,
  Mail,
  Edit3,
  Eye,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

const STEP_OPTIONS = [
  { value: 'internship', label: 'インターンシップ' },
  { value: 'info_session', label: '説明会' },
  { value: 'casual_talk', label: 'カジュアル面談' },
  { value: 'office_visit', label: 'オフィス見学' },
  { value: 'workshop', label: 'ワークショップ' },
]

// Mock generated offer for demo
const MOCK_OFFER = {
  subject: '【テクノベーション株式会社】田中さんだけの特別なご案内',
  body: `田中 太郎 様

はじめまして。テクノベーション株式会社 採用担当の佐藤です。

田中さんのプロフィールを拝見し、特にフルスタック開発のご経験と、ユーザー体験への深い関心に大変感銘を受けました。

私たちは現在、次世代のHRテクノロジープラットフォームを開発しており、田中さんのスキルセットと志向性がまさに私たちのチームに必要な力だと確信しています。

ぜひ一度、カジュアルな場で私たちのビジョンと開発中のプロダクトについてお話しさせていただければと思います。

お忙しいところ恐縮ですが、ご都合のよいお日にちをお知らせいただけますと幸いです。`,
  appeal_points: [
    '最先端のAI技術を活用したプロダクト開発に携われる',
    'エンジニア主導の意思決定文化で裁量が大きい',
    'フルスタックの技術力を活かせるポジション',
  ],
  personalized_reason: '田中さんのフルスタック開発経験とUXへの関心が、当社のプロダクトビジョンと高い親和性があります。技術的なチャレンジと社会的インパクトの両方を求める田中さんにとって、理想的な環境です。',
  next_step_description: 'オンラインでの30分程度のカジュアル面談を予定しています。当社のCTOと現場エンジニアが参加し、技術スタックやチーム文化について率直にお話しします。',
  urgency_message: '現在、少数精鋭のチームで開発を進めており、このポジションは限定募集となっています。ぜひお早めにご検討ください。',
  tone: 'warm_professional',
}

export default function PersonalOfferPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)

  const [selectedStep, setSelectedStep] = useState('info_session')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerated, setShowGenerated] = useState(false)
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('preview')
  const [copied, setCopied] = useState(false)
  const [offerStatus, setOfferStatus] = useState<'draft' | 'reviewed' | 'sent'>('draft')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  if (!candidate) return <div className="p-8 text-gray-500">候補者が見つかりません</div>

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowGenerated(true)
    }, 2000)
  }

  const handleCopy = () => {
    const text = `件名: ${MOCK_OFFER.subject}\n\n${MOCK_OFFER.body}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stepLabel = STEP_OPTIONS.find(s => s.value === selectedStep)?.label ?? selectedStep

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.fullName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">個別オファー</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">個別オファーメッセージ</h1>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{candidate.fullName} — 次ステップ参加率を高めるパーソナライズメッセージ</p>
          </div>
          <div className="flex gap-2">
            {showGenerated && offerStatus !== 'sent' && (
              <>
                <button onClick={handleCopy} className="btn-secondary">
                  <Copy className="w-4 h-4" />
                  {copied ? 'コピーしました！' : 'テキストをコピー'}
                </button>
                <button onClick={() => setShowEmailModal(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                  <Mail className="w-4 h-4" />
                  メールで送信
                </button>
                <button onClick={() => setOfferStatus('sent')} className="btn-secondary">
                  <Send className="w-4 h-4" />
                  送付済みにする
                </button>
              </>
            )}
            {offerStatus === 'sent' && (
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
          {/* Left: Settings */}
          <div className="space-y-4">
            <div className="card p-4">
              <p className="label mb-3">次ステップの種類</p>
              <div className="space-y-2">
                {STEP_OPTIONS.map((step) => (
                  <button
                    key={step.value}
                    onClick={() => setSelectedStep(step.value)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStep === step.value
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{step.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="card p-4 bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800 mb-1">個別オファーの効果</p>
                  <ul className="space-y-1">
                    {[
                      '候補者の経歴・志向に合わせたパーソナライズで「特別感」を演出',
                      '次ステップに参加すべき理由を明確に伝えて参加率を向上',
                      '企業の魅力を候補者の関心に紐づけて効果的に訴求',
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

            {/* Generate Button */}
            {!showGenerated && (
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
                    {stepLabel}向けオファーを生成
                  </>
                )}
              </button>
            )}

            {showGenerated && (
              <button
                onClick={() => { setShowGenerated(false); setOfferStatus('draft') }}
                className="w-full btn-secondary justify-center py-3"
              >
                <Sparkles className="w-4 h-4" />
                別のステップで再生成
              </button>
            )}
          </div>

          {/* Right: Offer Display */}
          <div className="col-span-2">
            {showGenerated ? (
              <div className="card overflow-hidden">
                {/* Offer Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">件名</p>
                    <p className="text-sm font-semibold text-gray-800">{MOCK_OFFER.subject}</p>
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
                <div className={`px-6 py-2 flex items-center gap-2 text-xs ${
                  offerStatus === 'sent' ? 'bg-emerald-50 text-emerald-700' :
                  offerStatus === 'reviewed' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {offerStatus === 'sent' ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> 送付済み</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> AI下書き — 送付前に内容を必ずご確認ください</>
                  )}
                </div>

                {/* Offer Body */}
                <div className="p-8">
                  {activeView === 'preview' ? (
                    <div className="max-w-2xl space-y-6">
                      {/* Message Body */}
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {MOCK_OFFER.body}
                      </div>

                      {/* Appeal Points */}
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <p className="text-sm font-semibold text-indigo-800">訴求ポイント</p>
                        </div>
                        <ul className="space-y-2">
                          {MOCK_OFFER.appeal_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-indigo-800">
                              <span className="text-indigo-400 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Personalized Reason */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">パーソナライズの根拠</p>
                        </div>
                        <p className="text-sm text-emerald-800 leading-relaxed">{MOCK_OFFER.personalized_reason}</p>
                      </div>

                      {/* Next Step Description */}
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">次ステップの内容</p>
                        </div>
                        <p className="text-sm text-amber-800 leading-relaxed">{MOCK_OFFER.next_step_description}</p>
                      </div>

                      {/* Urgency */}
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-sm text-red-800 leading-relaxed">{MOCK_OFFER.urgency_message}</p>
                      </div>
                    </div>
                  ) : (
                    /* Edit View */
                    <div className="space-y-4 max-w-2xl">
                      <div>
                        <label className="label mb-1 block">件名</label>
                        <input
                          type="text"
                          defaultValue={MOCK_OFFER.subject}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="label mb-1 block">本文</label>
                        <textarea
                          defaultValue={MOCK_OFFER.body}
                          rows={12}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="label mb-1 block">訴求ポイント</label>
                        {MOCK_OFFER.appeal_points.map((point, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <span className="text-xs text-gray-400 mt-2 font-bold w-4">{i + 1}.</span>
                            <input
                              type="text"
                              defaultValue={point}
                              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="label mb-1 block">次ステップの説明</label>
                        <textarea
                          defaultValue={MOCK_OFFER.next_step_description}
                          rows={3}
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

                {/* AI Note */}
                <div className="px-8 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    このオファーはAIが候補者プロフィール・求人情報・企業魅力プロファイルを元に生成しました
                    — <strong>送付前に内容を必ずご確認ください</strong>
                  </p>
                </div>
              </div>
            ) : (
              /* No Offer State */
              <div className="card p-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <h3 className="text-base font-semibold text-gray-700 mb-2">
                  個別オファーメッセージを生成する
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                  AIが候補者のプロフィールと志向に合わせて、{stepLabel}への参加を促すパーソナライズされたメッセージを自動生成します。生成後は内容を確認・編集してから送付してください。
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
                      {stepLabel}向けオファーを生成
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メール送信モーダル */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">個別オファーメールを送信</h3>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {!emailSent ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="label mb-1 block">宛先</label>
                  <input
                    type="email"
                    value={candidate?.email ?? 'candidate@example.com'}
                    readOnly
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="label mb-1 block">件名</label>
                  <input
                    type="text"
                    defaultValue={MOCK_OFFER.subject}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="label mb-1 block">本文プレビュー</label>
                  <div className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 h-32 overflow-y-auto leading-relaxed whitespace-pre-line">
                    {MOCK_OFFER.body.substring(0, 200)}...
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEmailSent(true)
                      setTimeout(() => setOfferStatus('sent'), 500)
                    }}
                    className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4" />
                    送信する
                  </button>
                  <button onClick={() => setShowEmailModal(false)} className="btn-secondary flex-1">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">メールを送信しました</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {candidate.fullName} 様へ個別オファーメールを送信しました。
                </p>
                <button
                  onClick={() => { setShowEmailModal(false); setEmailSent(false) }}
                  className="btn-primary"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
