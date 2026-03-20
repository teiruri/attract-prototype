'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Mail,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  User,
  Brain,
  GraduationCap,
  Upload,
  Target,
  ThumbsUp,
  Activity,
} from 'lucide-react'
import { getCandidateById, getStageColor, getStageLabel, getSignalStrengthColor, getSignalStrengthLabel } from '@/lib/mock-data'

const PREDICTIONS: Record<string, { offerProb: number; acceptProb: number; passProb: number }> = {
  cand_001: { offerProb: 78, acceptProb: 85, passProb: 92 },
  cand_002: { offerProb: 45, acceptProb: 62, passProb: 58 },
  cand_003: { offerProb: 82, acceptProb: 88, passProb: 90 },
  cand_004: { offerProb: 61, acceptProb: 72, passProb: 78 },
}

type Tab = 'overview' | 'interviews' | 'signals' | 'card'

export default function CandidateDetailPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!candidate) {
    return <div className="p-8 text-gray-500">候補者が見つかりません</div>
  }

  const app = candidate.applications[0]
  const completedInterviews = app?.interviews.filter((i) => i.status === 'completed') ?? []
  const upcomingInterviews = app?.interviews.filter((i) => i.status === 'scheduled') ?? []
  const allSignals = completedInterviews.flatMap((i) => (i.signal ? [i.signal] : []))

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '概要・カルテ' },
    { id: 'interviews', label: `面接（${app?.interviews.length ?? 0}）` },
    { id: 'signals', label: `シグナル（${allSignals.length}）` },
    { id: 'card', label: 'AIカルテ' },
  ]

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/candidates" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-400">候補者管理</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-sm text-gray-700 font-medium">{candidate.fullName}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${candidate.avatarColor} flex items-center justify-center`}>
              <span className="text-xl font-bold text-white">{candidate.avatarInitials[0]}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{candidate.fullName}</h1>
              <p className="text-sm text-gray-500">{candidate.currentTitle} / {candidate.currentCompany}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {app && (
                  <span className={`badge ${getStageColor(app.currentStage)}`}>
                    {getStageLabel(app.currentStage)}
                  </span>
                )}
                <span className="badge bg-gray-100 text-gray-600">
                  {candidate.source}
                </span>
                {app?.attractStrategy && (
                  <span className="badge bg-indigo-50 text-indigo-600">
                    Attract戦略あり
                  </span>
                )}
                {candidate.hiringType === 'newgrad' && (
                  <span className="badge bg-pink-50 text-pink-700">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    新卒{candidate.graduationYear}年卒
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link href={`/candidates/${id}/documents`} className="btn-secondary">
              <Upload className="w-4 h-4 text-teal-500" />
              書類管理
            </Link>
            <Link href={`/candidates/${id}/signal-input`} className="btn-secondary">
              <Brain className="w-4 h-4 text-violet-500" />
              シグナル入力
            </Link>
            <Link href={`/candidates/${id}/attract`} className="btn-secondary">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Attract戦略
            </Link>
            <Link href={`/candidates/${id}/brief`} className="btn-secondary">
              <FileText className="w-4 h-4" />
              面接官ブリーフ
            </Link>
            <Link href={`/candidates/${id}/feedback-letter`} className="btn-primary">
              <Mail className="w-4 h-4" />
              フィードバックレター
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : 'inactive'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* ======================== OVERVIEW TAB ======================== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Main Info */}
            <div className="col-span-2 space-y-6">
              {/* Candidate Info */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="section-title mb-0">候補者情報</h2>
                  {candidate.hiringType === 'newgrad' && (
                    <span className="badge bg-pink-50 text-pink-700">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      新卒採用 {candidate.graduationYear}年3月卒予定
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {candidate.hiringType === 'newgrad' ? (
                    <>
                      {[
                        { label: '氏名', value: candidate.fullName },
                        { label: 'メール', value: candidate.email },
                        { label: '電話番号', value: candidate.phone },
                        { label: '大学・学部', value: `${candidate.university ?? ''} ${candidate.faculty ?? ''}` },
                        { label: '卒業予定', value: `${candidate.graduationYear}年3月` },
                        { label: '流入元', value: candidate.source },
                        { label: '登録日', value: candidate.createdAt },
                        { label: '同意取得', value: candidate.consentGiven ? `済（${candidate.consentDate}）` : '未取得' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="label mb-1">{item.label}</p>
                          <p className="text-sm text-gray-800">{item.value}</p>
                        </div>
                      ))}
                      {candidate.internship && (
                        <div className="col-span-2">
                          <p className="label mb-1">インターン経験</p>
                          <p className="text-sm text-gray-800">{candidate.internship}</p>
                        </div>
                      )}
                      {candidate.clubActivities && (
                        <div className="col-span-2">
                          <p className="label mb-1">課外活動・実績</p>
                          <p className="text-sm text-gray-800">{candidate.clubActivities}</p>
                        </div>
                      )}
                      {candidate.jobHuntingAxis && (
                        <div className="col-span-2">
                          <p className="label mb-1">就活の軸</p>
                          <p className="text-sm text-gray-800 leading-relaxed">{candidate.jobHuntingAxis}</p>
                        </div>
                      )}
                      {candidate.toeicScore && (
                        <div>
                          <p className="label mb-1">TOEIC</p>
                          <p className="text-sm text-gray-800">{candidate.toeicScore}点</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {[
                        { label: '氏名', value: candidate.fullName },
                        { label: 'メール', value: candidate.email },
                        { label: '電話番号', value: candidate.phone },
                        { label: '現職', value: `${candidate.currentCompany} / ${candidate.currentTitle}` },
                        { label: '経験年数', value: `${candidate.yearsExperience}年` },
                        { label: '流入元', value: candidate.source },
                        { label: '登録日', value: candidate.createdAt },
                        { label: '同意取得', value: candidate.consentGiven ? `済（${candidate.consentDate}）` : '未取得' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="label mb-1">{item.label}</p>
                          <p className="text-sm text-gray-800">{item.value}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Upcoming Interview Alert */}
              {upcomingInterviews.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">次回面接が予定されています</p>
                      {upcomingInterviews.map((iv) => (
                        <div key={iv.id} className="mt-2">
                          <p className="text-sm text-amber-700">
                            <strong>{iv.stageLabel}</strong> — {iv.scheduledAt}
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            面接官: {iv.interviewers.join('、')}
                          </p>
                          {iv.attractPlan ? (
                            <div className="flex gap-2 mt-2">
                              <span className="badge bg-indigo-100 text-indigo-700">Attractプラン生成済</span>
                              <Link href={`/candidates/${id}/brief`} className="badge bg-white text-amber-700 border border-amber-300 hover:bg-amber-50">
                                → ブリーフを送付する
                              </Link>
                            </div>
                          ) : (
                            <Link href={`/candidates/${id}/attract`} className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 font-medium hover:text-amber-800">
                              <Sparkles className="w-3 h-3" />
                              Attractプランを生成する
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {candidate.documents && candidate.documents.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="section-title mb-0 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-teal-500" />
                      アップロード書類
                    </h2>
                    <Link href={`/candidates/${id}/documents`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      書類管理 →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {candidate.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{doc.fileName}</p>
                          <p className="text-[10px] text-gray-400">{doc.fileSize} — {doc.uploadedAt}</p>
                        </div>
                        {doc.parseStatus === 'parsed' && (
                          <span className="badge bg-emerald-50 text-emerald-600 text-[10px]">AI解析済</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* AI抽出スキル（書類から） */}
                  {candidate.documents.some(d => d.parsedData) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="label mb-1.5">書類から抽出したスキル</p>
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(candidate.documents.flatMap(d => d.parsedData?.keySkills ?? []))].slice(0, 8).map((skill, i) => (
                          <span key={i} className="badge bg-blue-50 text-blue-600 text-[10px]">{skill}</span>
                        ))}
                        {[...new Set(candidate.documents.flatMap(d => d.parsedData?.keySkills ?? []))].length > 8 && (
                          <Link href={`/candidates/${id}/documents`} className="badge bg-gray-50 text-gray-500 text-[10px]">
                            +{[...new Set(candidate.documents.flatMap(d => d.parsedData?.keySkills ?? []))].length - 8}件
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attract Strategy Summary */}
              {app?.attractStrategy && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="section-title mb-0">Attract戦略サマリー</h2>
                    <Link href={`/candidates/${id}/attract`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      詳細を見る →
                    </Link>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-medium text-indigo-500 mb-1">メイン訴求軸</p>
                    <p className="text-sm font-semibold text-indigo-900">{app.attractStrategy.coreAngle}</p>
                    <p className="text-xs text-indigo-700 mt-1.5 leading-relaxed">{app.attractStrategy.coreAngleRationale}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">サブ訴求軸</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.attractStrategy.subAngles.map((angle, i) => (
                        <span key={i} className="badge bg-gray-100 text-gray-700">{angle}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Quick Stats & Actions */}
            <div className="space-y-4">
              {/* Hiring Score */}
              {app?.candidateCard && (
                <div className="card p-5">
                  <p className="label mb-3">採用推薦スコア</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{app.candidateCard.hiringScore}</span>
                    <span className="text-gray-400 mb-1">/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${app.candidateCard.hiringScore}%` }}
                    />
                  </div>
                  <span className={`badge ${
                    app.candidateCard.recommendation === 'strong_yes' ? 'bg-emerald-100 text-emerald-700' :
                    app.candidateCard.recommendation === 'yes' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {app.candidateCard.recommendation === 'strong_yes' ? '強く推薦' :
                     app.candidateCard.recommendation === 'yes' ? '推薦' : '要検討'}
                  </span>
                </div>
              )}

              {/* AI予測分析 */}
              {(() => {
                const pred = PREDICTIONS[id] || { offerProb: 55, acceptProb: 65, passProb: 70 }
                const metrics = [
                  { label: '内定確率', value: pred.offerProb, icon: Target, color: 'indigo' },
                  { label: '内定承諾確率', value: pred.acceptProb, icon: ThumbsUp, color: 'emerald' },
                  { label: '次ステップ通過', value: pred.passProb, icon: Activity, color: 'violet' },
                ]
                return (
                  <div className="card p-5">
                    <p className="label mb-3">AI予測分析</p>
                    <div className="space-y-3">
                      {metrics.map((m, i) => {
                        const Icon = m.icon
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-3 h-3 text-${m.color}-500`} />
                                <span className="text-[10px] text-gray-500">{m.label}</span>
                              </div>
                              <span className={`text-xs font-bold text-${m.color}-600`}>{m.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`bg-${m.color}-500 h-1.5 rounded-full`} style={{ width: `${m.value}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">過去の類似候補者データから算出</p>
                  </div>
                )
              })()}

              {/* Quick Actions */}
              <div className="card p-5">
                <p className="label mb-3">クイックアクション</p>
                <div className="space-y-2">
                  <Link href={`/candidates/${id}/attract`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">Attract戦略ボード</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/feedback-letter`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">フィードバックレター</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/brief`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">面接官ブリーフ</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/documents`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">書類管理・AI解析</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                </div>
              </div>

              {/* Concerns */}
              {app?.candidateCard?.remainingConcerns && (
                <div className="card p-5">
                  <p className="label mb-3">払拭すべき懸念</p>
                  <div className="space-y-2">
                    {app.candidateCard.remainingConcerns.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{c}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================== INTERVIEWS TAB ======================== */}
        {activeTab === 'interviews' && (
          <div className="space-y-4">
            {app?.interviews.map((interview) => (
              <div key={interview.id} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {interview.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{interview.stageLabel}</h3>
                      <p className="text-xs text-gray-400">{interview.scheduledAt} / {interview.format === 'online' ? 'オンライン' : '対面'}</p>
                    </div>
                  </div>
                  <span className={`badge ${interview.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {interview.status === 'completed' ? '完了' : '予定'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="label mb-1">面接官</p>
                    <div className="flex flex-wrap gap-1">
                      {interview.interviewers.map((iv, i) => (
                        <span key={i} className="badge bg-gray-100 text-gray-600">{iv}</span>
                      ))}
                    </div>
                  </div>
                  {interview.evaluation && (
                    <div>
                      <p className="label mb-1">総合評価</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= interview.evaluation!.overallScore ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{interview.evaluation.overallScore}/5</span>
                      </div>
                    </div>
                  )}
                </div>

                {interview.evaluation && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">評価コメント</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{interview.evaluation.comment}</p>
                    {interview.evaluation.concerns && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">{interview.evaluation.concerns}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Handoff Notes */}
                {interview.handoffNotes && interview.handoffNotes.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">次ステップへの申し送り事項</p>
                    <div className="space-y-1.5">
                      {interview.handoffNotes.map((note, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Letter Status */}
                {interview.feedbackLetter && (
                  <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">フィードバックレター:</span>
                      <span className={`badge ${
                        interview.feedbackLetter.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                        interview.feedbackLetter.status === 'reviewed' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {interview.feedbackLetter.status === 'sent' ? '送付済み' :
                         interview.feedbackLetter.status === 'reviewed' ? '確認済み・未送付' :
                         '下書き'}
                      </span>
                    </div>
                    <Link
                      href={`/candidates/${id}/feedback-letter?interview=${interview.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {interview.feedbackLetter.status === 'sent' ? '内容を確認' : '送付する →'}
                    </Link>
                  </div>
                )}

                {interview.status === 'completed' && !interview.feedbackLetter && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <Link
                      href={`/candidates/${id}/feedback-letter?interview=${interview.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      フィードバックレターを生成する
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ======================== SIGNALS TAB ======================== */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            {allSignals.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">シグナルデータがありません</p>
              </div>
            ) : (
              <>
                {/* Aggregated Career Values */}
                <div className="card p-5">
                  <h2 className="section-title">累積シグナル — キャリア価値観</h2>
                  <div className="space-y-3">
                    {allSignals.flatMap((s) => s.careerValues).map((cv, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <span className={`badge ${getSignalStrengthColor(cv.strength)}`}>
                          {getSignalStrengthLabel(cv.strength)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{cv.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5 italic">「{cv.evidence}」</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-Stage Signals */}
                {allSignals.map((signal) => (
                  <div key={signal.id} className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="section-title mb-0">{signal.stageLabel}</h2>
                      <div className="flex items-center gap-2">
                        <span className="label">熱量</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div
                              key={s}
                              className={`w-3 h-3 rounded-full ${s <= signal.energyLevel ? 'bg-indigo-500' : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Positive Reactions */}
                      <div>
                        <p className="label mb-2 text-emerald-600">好反応トピック</p>
                        <div className="space-y-2">
                          {signal.positiveReactions.map((r, i) => (
                            <div key={i} className="bg-emerald-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-emerald-800">{r.topic}</p>
                              <p className="text-xs text-emerald-600 mt-0.5">{r.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Concerns */}
                      <div>
                        <p className="label mb-2 text-amber-600">懸念・不安</p>
                        <div className="space-y-2">
                          {signal.concerns.map((c, i) => (
                            <div key={i} className="bg-amber-50 rounded-lg p-3">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`badge ${getSignalStrengthColor(c.severity)}`}>
                                  {getSignalStrengthLabel(c.severity)}
                                </span>
                                <p className="text-xs font-medium text-amber-800">{c.concern}</p>
                              </div>
                              {c.response && (
                                <p className="text-xs text-amber-600">対応: {c.response}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Questions Asked */}
                    {signal.questionsAsked.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="label mb-2">候補者からの質問</p>
                        <div className="space-y-1.5">
                          {signal.questionsAsked.map((q, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-indigo-400 text-xs mt-0.5 font-bold">Q</span>
                              <p className="text-sm text-gray-600">{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="label mb-1">面接官メモ</p>
                      <p className="text-sm text-gray-600 italic">{signal.overallNote}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ======================== CARD TAB ======================== */}
        {activeTab === 'card' && (
          <div>
            {app?.candidateCard ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">候補者カルテ</h2>
                    <p className="text-xs text-gray-400">v{app.candidateCard.version} — {app.candidateCard.generatedAt} 生成</p>
                  </div>
                  <button className="btn-secondary text-sm">
                    <FileText className="w-4 h-4" />
                    PDF出力
                  </button>
                </div>

                <div className="card p-6">
                  <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className={`w-16 h-16 rounded-full ${candidate.avatarColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl font-bold text-white">{candidate.avatarInitials[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{candidate.fullName}</h3>
                      <p className="text-sm text-gray-500">{candidate.currentTitle} / {candidate.currentCompany}（{candidate.yearsExperience}年）</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`badge ${
                          app.candidateCard.recommendation === 'strong_yes' ? 'bg-emerald-100 text-emerald-700' :
                          app.candidateCard.recommendation === 'yes' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {app.candidateCard.recommendation === 'strong_yes' ? '強く推薦' :
                           app.candidateCard.recommendation === 'yes' ? '推薦' : '要検討'}
                        </span>
                        <span className="badge bg-indigo-100 text-indigo-700">
                          スコア: {app.candidateCard.hiringScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="label mb-2">プロフィールサマリー</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{app.candidateCard.profileSummary}</p>
                    </div>

                    <div>
                      <p className="label mb-2">経歴ハイライト</p>
                      <ul className="space-y-1.5">
                        {app.candidateCard.careerHighlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="label mb-2">ステージ別印象</p>
                      <div className="space-y-3">
                        {app.candidateCard.impressionByStage.map((item, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="badge bg-white border border-gray-200 text-gray-600 text-[10px] flex-shrink-0 h-fit">
                              {item.stage}
                            </span>
                            <p className="text-sm text-gray-700">{item.impression}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-indigo-500 mb-1">最も効く訴求角度</p>
                      <p className="text-sm font-semibold text-indigo-900">{app.candidateCard.bestAttractAngle}</p>
                    </div>

                    <div>
                      <p className="label mb-2 text-amber-600">残存懸念と払拭方針</p>
                      <div className="space-y-2">
                        {app.candidateCard.remainingConcerns.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <p className="label mb-2">オファー推薦</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{app.candidateCard.offerRecommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-500 mb-4">まだカルテが生成されていません</p>
                <button className="btn-primary">
                  <Sparkles className="w-4 h-4" />
                  AIカルテを生成する
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
