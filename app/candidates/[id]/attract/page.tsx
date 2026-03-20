'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, ChevronRight, AlertCircle, CheckCircle2, Target, TrendingUp, ArrowRight } from 'lucide-react'
import { getCandidateById, getStageLabel } from '@/lib/mock-data'

export default function AttractPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)
  const app = candidate?.applications[0]
  const strategy = app?.attractStrategy
  const gap = app?.gapAnalysis
  const upcomingInterview = app?.interviews.find((i) => i.status === 'scheduled')

  if (!candidate) return <div className="p-8 text-gray-500">候補者が見つかりません</div>

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.fullName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">Attract戦略ボード</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">Attract戦略ボード</h1>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{candidate.fullName} — {app?.jobTitle}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary">戦略を再生成</button>
            {upcomingInterview && (
              <Link href={`/candidates/${id}/brief`} className="btn-primary">
                <ArrowRight className="w-4 h-4" />
                面接官ブリーフを生成
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Strategy Version Info */}
        {strategy && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>v{strategy.version} — {strategy.generatedAt} 生成 / AIが全シグナルを元に自動生成。採用担当者が内容を確認・承認してください。</span>
          </div>
        )}

        {/* Core Attract Angle */}
        {strategy && (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-indigo-200" />
              <span className="text-sm font-medium text-indigo-200">メイン訴求軸（コアアングル）</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{strategy.coreAngle}</h2>
            <p className="text-sm text-indigo-100 leading-relaxed">{strategy.coreAngleRationale}</p>

            <div className="mt-4 pt-4 border-t border-indigo-500">
              <p className="text-xs text-indigo-300 mb-2">サブ訴求軸</p>
              <div className="flex flex-wrap gap-2">
                {strategy.subAngles.map((angle, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-500 rounded-full text-sm text-white">
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Gap Analysis - Matching Points */}
          {gap && (
            <div className="card p-5">
              <h2 className="section-title flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                刺さる訴求ポイント（フィット分析）
              </h2>
              <p className="text-xs text-gray-400 mb-4">候補者シグナルと企業魅力の照合結果</p>
              <div className="space-y-3">
                {gap.matching.map((item, i) => (
                  <div key={i} className="p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-emerald-900">{item.point}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-emerald-200 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${item.matchScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-700">{item.matchScore}</span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-700 italic">{item.signalEvidence}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gap Analysis - Untold Points */}
          {gap && (
            <div className="card p-5">
              <h2 className="section-title flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                まだ伝えられていないこと
              </h2>
              <p className="text-xs text-gray-400 mb-4">候補者に響く可能性があるが、まだ伝えていないポイント</p>
              <div className="space-y-3">
                {gap.untold.map((item, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900 mb-1">{item.point}</p>
                    <p className="text-xs text-amber-700">{item.recommendation}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-3">懸念への回答方針</p>
                <div className="space-y-2">
                  {gap.concernResponses.map((item, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs font-medium text-red-800 mb-1">懸念: {item.concern}</p>
                      <p className="text-xs text-red-700">対応: {item.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stepwise Approach */}
        {strategy && (
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              ステップ別Attractアプローチ
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
              <div className="space-y-4">
                {strategy.stepwiseApproach.map((step, i) => {
                  const completedCount = app?.interviews.filter(iv => iv.status === 'completed').length ?? 0
                  const isCompleted = i < completedCount
                  const isCurrent = i === completedCount
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-white">{i + 1}</span>
                        )}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg ${
                        isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{step.step}</p>
                          {isCurrent && <span className="badge bg-indigo-100 text-indigo-600">次のステップ</span>}
                          {isCompleted && <span className="badge bg-emerald-100 text-emerald-600">完了</span>}
                        </div>
                        <p className="text-sm text-gray-600">{step.focus}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Competitor Diff */}
        {strategy && (
          <div className="card p-5">
            <h2 className="section-title">競合差別化ポイント</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{strategy.competitorDiff}</p>
            </div>
          </div>
        )}

        {/* Next Step Attract Plan */}
        {upcomingInterview?.attractPlan && (
          <div className="card p-5 border-indigo-200 border-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-indigo-600 text-white">次回面接</span>
                  <h2 className="text-base font-semibold text-gray-900">{upcomingInterview.stageLabel} Attractプラン</h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{upcomingInterview.scheduledAt} / {upcomingInterview.interviewers.join('、')}</p>
              </div>
              <Link href={`/candidates/${id}/brief`} className="btn-primary">
                面接官ブリーフを生成 →
              </Link>
            </div>

            {/* Continuity Notes */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
                ⚡ 前回からの申し送り事項（感情③「連携されている」の核心）
              </p>
              <div className="space-y-1.5 bg-indigo-50 rounded-lg p-3">
                {upcomingInterview.attractPlan.continuityNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-indigo-800 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Messages */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">今回伝えるべきキーメッセージ</p>
              <div className="space-y-2">
                {upcomingInterview.attractPlan.keyMessages.map((msg, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">{msg.message}</p>
                    <p className="text-xs text-gray-500">理由: {msg.rationale}</p>
                    <p className="text-xs text-indigo-500 mt-1">根拠: {msg.signalBasis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Talk Tracks */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">推薦トーク例</p>
              <div className="space-y-3">
                {upcomingInterview.attractPlan.talkTracks.map((track, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">📍 {track.scenario}</p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">「{track.script}」</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
