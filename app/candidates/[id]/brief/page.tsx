'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lightbulb,
  Users,
  Sparkles,
  Send,
  Copy,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

export default function BriefPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)
  const app = candidate?.applications[0]
  const upcomingInterview = app?.interviews.find((i) => i.status === 'scheduled')
  const attractPlan = upcomingInterview?.attractPlan
  const card = app?.candidateCard
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!candidate) return <div className="p-8">候補者が見つかりません</div>

  const handleCopy = () => {
    const briefText = [
      `【面接官ブリーフィングシート】${candidate.fullName}`,
      `面接: ${upcomingInterview?.stageLabel ?? ''} — ${upcomingInterview?.scheduledAt ?? ''}`,
      `面接官: ${upcomingInterview?.interviewers.join('、') ?? ''}`,
      '',
      `■ 候補者: ${candidate.fullName}（${candidate.currentTitle} / ${candidate.currentCompany}）`,
      card ? `■ 推薦スコア: ${card.hiringScore}/100` : '',
      card ? `■ サマリー: ${card.profileSummary}` : '',
      '',
      attractPlan ? '■ 前回からの申し送り事項:' : '',
      ...(attractPlan?.continuityNotes.map((n, i) => `  ${i + 1}. ${n}`) ?? []),
      '',
      attractPlan ? '■ 今回伝えるべきキーメッセージ:' : '',
      ...(attractPlan?.keyMessages.map((m, i) => `  ${i + 1}. ${m.message}`) ?? []),
      '',
      attractPlan ? '■ 候補者への推薦質問:' : '',
      ...(attractPlan?.questionsToAsk.map((q, i) => `  Q${i + 1}. ${q}`) ?? []),
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(briefText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.fullName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">面接官ブリーフィングシート</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-bold text-gray-900">面接官ブリーフィングシート</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="btn-secondary">
              <Copy className="w-4 h-4" />
              {copied ? 'コピーしました！' : 'コピー'}
            </button>
            <button className="btn-secondary">
              <FileText className="w-4 h-4" />
              PDF出力
            </button>
            {!sent ? (
              <button onClick={() => setSent(true)} className="btn-primary">
                <Send className="w-4 h-4" />
                面接官に送付する
              </button>
            ) : (
              <span className="badge bg-emerald-100 text-emerald-700 px-3 py-1.5">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                送付済み
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {upcomingInterview ? (
          <div className="max-w-4xl">
            {/* Brief Header */}
            <div className="card p-6 mb-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-indigo-200 text-sm font-medium mb-1">面接官ブリーフィング</p>
                  <h2 className="text-xl font-bold mb-1">{upcomingInterview.stageLabel}</h2>
                  <p className="text-indigo-200 text-sm">{upcomingInterview.scheduledAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs mb-1">面接官</p>
                  {upcomingInterview.interviewers.map((iv, i) => (
                    <p key={i} className="text-white text-sm font-medium">{iv}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidate Profile (Quick) */}
            <div className="card p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${candidate.avatarColor} flex items-center justify-center`}>
                  <span className="text-lg font-bold text-white">{candidate.avatarInitials[0]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">{candidate.fullName}</h3>
                  <p className="text-sm text-gray-500">{candidate.currentTitle} / {candidate.currentCompany}（経験{candidate.yearsExperience}年）</p>
                  <p className="text-xs text-gray-400 mt-0.5">流入元: {candidate.source}</p>
                </div>
                {card && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">採用推薦スコア</p>
                    <p className="text-2xl font-bold text-indigo-600">{card.hiringScore}</p>
                    <p className="text-xs text-gray-400">/100</p>
                  </div>
                )}
              </div>
              {card && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{card.profileSummary}</p>
                </div>
              )}
            </div>

            {/* ⚡ Continuity Notes - MOST IMPORTANT */}
            {attractPlan && attractPlan.continuityNotes.length > 0 && (
              <div className="card p-5 mb-4 border-amber-300 border-2 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-semibold text-amber-800">
                    ⚡ 前回からの申し送り事項（必読）
                  </h3>
                </div>
                <p className="text-xs text-amber-600 mb-3">
                  これらを把握して面接に臨むことで、候補者に「きちんと連携されている会社」という印象を与えます
                </p>
                <div className="space-y-2">
                  {attractPlan.continuityNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3">
                      <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* This Candidate's Key Values */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-900">この候補者が大事にしていること</h3>
                </div>
                <div className="space-y-2">
                  {app?.interviews
                    .flatMap((i) => i.signal?.careerValues ?? [])
                    .filter((v) => v.strength === 'high')
                    .slice(0, 4)
                    .map((v, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="badge bg-indigo-100 text-indigo-700 text-[10px] flex-shrink-0">強</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{v.value}</p>
                          <p className="text-xs text-gray-400 italic">「{v.evidence}」</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-900">懸念・払拭が必要なこと</h3>
                </div>
                <div className="space-y-2">
                  {app?.interviews
                    .flatMap((i) => i.signal?.concerns ?? [])
                    .map((c, i) => (
                      <div key={i} className="bg-amber-50 rounded-lg p-2.5">
                        <p className="text-sm font-medium text-amber-800">{c.concern}</p>
                        {c.response && (
                          <p className="text-xs text-amber-600 mt-0.5">対応: {c.response}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Key Messages for This Interview */}
            {attractPlan && (
              <div className="card p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-900">今回の面接で伝えるべきキーメッセージ</h3>
                </div>
                <div className="space-y-3">
                  {attractPlan.keyMessages.map((msg, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 mb-1">{msg.message}</p>
                          <p className="text-xs text-gray-500">💡 理由: {msg.rationale}</p>
                          <p className="text-xs text-indigo-400 mt-0.5">📌 根拠: {msg.signalBasis}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Talk Tracks */}
            {attractPlan && (
              <div className="card p-5 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">推薦トーク例</h3>
                <div className="space-y-3">
                  {attractPlan.talkTracks.map((track, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">📍 シーン: {track.scenario}</p>
                      <p className="text-sm text-gray-700 leading-relaxed border-l-4 border-indigo-300 pl-3">
                        「{track.script}」
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions to Ask */}
            {attractPlan && (
              <div className="card p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-900">候補者への推薦質問</h3>
                </div>
                <div className="space-y-2">
                  {attractPlan.questionsToAsk.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-indigo-400 font-bold text-sm flex-shrink-0">Q{i + 1}</span>
                      <p className="text-sm text-gray-700">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opening Message */}
            {attractPlan?.openingMessage && (
              <div className="card p-5 mb-4 border-indigo-200 bg-indigo-50">
                <h3 className="text-sm font-semibold text-indigo-800 mb-2">💬 推薦オープニングメッセージ（面接冒頭）</h3>
                <p className="text-sm text-indigo-700 leading-relaxed italic">
                  {attractPlan.openingMessage}
                </p>
              </div>
            )}

            {/* Content to Send */}
            {attractPlan && attractPlan.contentToSend.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">📎 面接前に候補者へ送付する資料</h3>
                <div className="space-y-2">
                  {attractPlan.contentToSend.map((content, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">{content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                このブリーフはAIが生成しました（参照: 候補者シグナル × Attract戦略 × 企業魅力プロファイル）
                — 送付前に採用担当者が内容を確認してください
              </p>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-base font-semibold text-gray-600 mb-2">予定されている面接がありません</p>
            <p className="text-sm text-gray-400 mb-4">
              次の面接を登録すると、面接官ブリーフィングシートを生成できます
            </p>
            <button className="btn-primary">
              面接を登録する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
