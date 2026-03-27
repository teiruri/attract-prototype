'use client'

import { useState, useCallback, useEffect } from 'react'
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
  Award,
} from 'lucide-react'

type Tab = 'overview' | 'interviews' | 'signals' | 'card'

interface CandidateData {
  id: string
  full_name: string
  email: string
  phone?: string
  hiring_type: string
  status: string
  source: string
  job_id: string
  current_company?: string
  current_title?: string
  university?: string
  faculty?: string
  graduation_year?: number
  work_experience?: Array<{ company: string; title: string; years: number }>
  created_at: string
  candidate_documents?: Array<{
    id: string
    document_type: string
    file_name: string
    file_size?: string
    uploaded_at?: string
    parse_status?: string
  }>
  interviews?: Array<{
    id: string
    stage: string
    stage_label?: string
    scheduled_at?: string
    format?: string
    status: string
    result?: string
    interviewers?: string[]
    evaluation?: {
      overallScore: number
      skillScore: number
      cultureFitScore: number
      potentialScore: number
      comment: string
      concerns: string
      recommendation: string
      submittedBy: string
      submittedAt: string
    }
    signal?: {
      id: string
      interviewId: string
      stageLabel: string
      careerValues: Array<{ value: string; strength: string; evidence: string }>
      interests: string[]
      concerns: Array<{ concern: string; severity: string; response?: string }>
      positiveReactions: Array<{ topic: string; description: string }>
      questionsAsked: string[]
      energyLevel: number
      overallNote: string
      source: string
      createdAt: string
    }
    handoff_notes?: string[]
    feedback_letter?: { status: string }
    attract_plan?: object
  }>
}

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    casual: 'カジュアル面談', interview_1: '一次面接', interview_2: '二次面接',
    final: '最終面接', offer: 'オファー', hired: '内定承諾',
    briefing: '説明会', es: 'ES選考', aptitude: '適性検査', gd: 'GD', active: '選考中',
  }
  return labels[stage] || stage || '選考中'
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    casual: 'bg-gray-100 text-gray-600', interview_1: 'bg-blue-50 text-blue-600',
    interview_2: 'bg-indigo-50 text-indigo-600', final: 'bg-purple-50 text-purple-600',
    offer: 'bg-amber-50 text-amber-600', hired: 'bg-emerald-50 text-emerald-600',
  }
  return colors[stage] || 'bg-gray-100 text-gray-600'
}

function getSignalStrengthLabel(strength: string): string {
  return strength === 'high' ? '強' : strength === 'medium' ? '中' : '弱'
}

function getSignalStrengthColor(strength: string): string {
  return strength === 'high' ? 'bg-emerald-50 text-emerald-700'
    : strength === 'medium' ? 'bg-amber-50 text-amber-700'
    : 'bg-gray-100 text-gray-600'
}

export default function CandidateDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [candidate, setCandidate] = useState<CandidateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/candidates/${id}`)
        const data = await res.json()
        if (res.ok && data.candidate) {
          setCandidate(data.candidate)
        } else {
          setError(data.error || '候補者が見つかりません')
        }
      } catch {
        setError('データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchCandidate()
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="p-8">
        <Link href="/candidates" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" />
          候補者一覧に戻る
        </Link>
        <div className="card p-8 text-center text-gray-500">
          <p>{error || '候補者が見つかりません'}</p>
        </div>
      </div>
    )
  }

  const interviews = candidate.interviews || []
  const completedInterviews = interviews.filter((i) => i.status === 'completed')
  const upcomingInterviews = interviews.filter((i) => i.status === 'scheduled')
  const allSignals = completedInterviews.flatMap((i) => (i.signal ? [i.signal] : []))

  // Determine current stage from latest interview
  const latestInterview = interviews.length ? interviews[interviews.length - 1] : null
  const currentStage = latestInterview?.stage || candidate.status
  const isNewgrad = candidate.hiring_type === 'new_graduate' || candidate.hiring_type === 'newgrad'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '概要' },
    { id: 'interviews', label: `面接（${interviews.length}）` },
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
          <span className="text-sm text-gray-700 font-medium">{candidate.full_name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-700">{(candidate.full_name || '?')[0]}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{candidate.full_name}</h1>
              <p className="text-sm text-gray-500">
                {candidate.current_title ? `${candidate.current_title} / ${candidate.current_company || ''}` : candidate.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`badge ${getStageColor(currentStage)}`}>
                  {getStageLabel(currentStage)}
                </span>
                {candidate.source && (
                  <span className="badge bg-gray-100 text-gray-600">
                    {candidate.source}
                  </span>
                )}
                {isNewgrad && (
                  <span className="badge bg-pink-50 text-pink-700">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    新卒{candidate.graduation_year ? `${candidate.graduation_year}年卒` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - only show API-connected features */}
          <div className="flex items-center gap-2">
            <Link href={`/candidates/${id}/documents`} className="btn-secondary">
              <Upload className="w-4 h-4 text-teal-500" />
              書類管理
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
                  {isNewgrad && (
                    <span className="badge bg-pink-50 text-pink-700">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      新卒採用 {candidate.graduation_year ? `${candidate.graduation_year}年3月卒予定` : ''}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {isNewgrad ? (
                    <>
                      {[
                        { label: '氏名', value: candidate.full_name },
                        { label: 'メール', value: candidate.email },
                        { label: '電話番号', value: candidate.phone || '—' },
                        { label: '大学・学部', value: `${candidate.university || ''} ${candidate.faculty || ''}`.trim() || '—' },
                        { label: '卒業予定', value: candidate.graduation_year ? `${candidate.graduation_year}年3月` : '—' },
                        { label: '流入元', value: candidate.source || '—' },
                        { label: '登録日', value: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('ja-JP') : '—' },
                        { label: 'ステータス', value: candidate.status || '—' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="label mb-1">{item.label}</p>
                          <p className="text-sm text-gray-800">{item.value}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { label: '氏名', value: candidate.full_name },
                        { label: 'メール', value: candidate.email },
                        { label: '電話番号', value: candidate.phone || '—' },
                        { label: '現職', value: candidate.current_title ? `${candidate.current_company || ''} / ${candidate.current_title}` : '—' },
                        { label: '流入元', value: candidate.source || '—' },
                        { label: '登録日', value: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('ja-JP') : '—' },
                        { label: 'ステータス', value: candidate.status || '—' },
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
                            <strong>{iv.stage_label || getStageLabel(iv.stage)}</strong> — {iv.scheduled_at || '日程未定'}
                          </p>
                          {iv.interviewers && iv.interviewers.length > 0 && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              面接官: {iv.interviewers.join(', ')}
                            </p>
                          )}
                          <Link href={`/candidates/${id}/attract`} className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 font-medium hover:text-amber-800">
                            <Sparkles className="w-3 h-3" />
                            Attractプランを確認する
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {candidate.candidate_documents && candidate.candidate_documents.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="section-title mb-0 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-teal-500" />
                      アップロード書類
                    </h2>
                    <Link href={`/candidates/${id}/documents`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      書類管理
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {candidate.candidate_documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{doc.file_name}</p>
                          <p className="text-[10px] text-gray-400">
                            {doc.file_size || ''} {doc.uploaded_at ? `— ${new Date(doc.uploaded_at).toLocaleDateString('ja-JP')}` : ''}
                          </p>
                        </div>
                        {doc.parse_status === 'parsed' && (
                          <span className="badge bg-emerald-50 text-emerald-600 text-[10px]">AI解析済</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Quick Stats & Actions */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="card p-5">
                <p className="label mb-3">クイックアクション</p>
                <div className="space-y-2">
                  <Link href={`/candidates/${id}/attract`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">惹きつけ戦略</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/personal-offer`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-700">パーソナルオファー</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/feedback-letter`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">合格通知レター</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/brief`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">次回面接シナリオ</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                  <Link href={`/candidates/${id}/documents`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">書類管理・AI解析</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>
                </div>
              </div>

              {/* Work Experience */}
              {candidate.work_experience && candidate.work_experience.length > 0 && (
                <div className="card p-5">
                  <p className="label mb-3">職歴</p>
                  <div className="space-y-2">
                    {candidate.work_experience.map((exp, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium text-gray-800">{exp.company}</p>
                        <p className="text-xs text-gray-500">{exp.title} ({exp.years}年)</p>
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
            {interviews.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">面接データがありません</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <div key={interview.id} className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {interview.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {interview.stage_label || getStageLabel(interview.stage)}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {interview.scheduled_at || '日程未定'} / {interview.format === 'online' ? 'オンライン' : interview.format === 'offline' ? '対面' : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${interview.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {interview.status === 'completed' ? '完了' : '予定'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {interview.interviewers && interview.interviewers.length > 0 && (
                      <div>
                        <p className="label mb-1">面接官</p>
                        <div className="flex flex-wrap gap-1">
                          {interview.interviewers.map((iv, i) => (
                            <span key={i} className="badge bg-gray-100 text-gray-600">{iv}</span>
                          ))}
                        </div>
                      </div>
                    )}
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
                  {interview.handoff_notes && interview.handoff_notes.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">次ステップへの申し送り事項</p>
                      <div className="space-y-1.5">
                        {interview.handoff_notes.map((note, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600">{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Letter Status */}
                  {interview.feedback_letter && (
                    <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">フィードバックレター:</span>
                        <span className={`badge ${
                          interview.feedback_letter.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                          interview.feedback_letter.status === 'reviewed' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {interview.feedback_letter.status === 'sent' ? '送付済み' :
                           interview.feedback_letter.status === 'reviewed' ? '確認済み' :
                           '下書き'}
                        </span>
                      </div>
                      <Link
                        href={`/candidates/${id}/feedback-letter?interview=${interview.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {interview.feedback_letter.status === 'sent' ? '内容を確認' : '送付する'}
                      </Link>
                    </div>
                  )}

                  {interview.status === 'completed' && !interview.feedback_letter && (
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
              ))
            )}
          </div>
        )}

        {/* ======================== SIGNALS TAB ======================== */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            {allSignals.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">シグナルデータがありません</p>
                <p className="text-xs mt-1">面接後にシグナル入力を行うと、ここに表示されます</p>
              </div>
            ) : (
              <>
                {/* Aggregated Career Values */}
                <div className="card p-5">
                  <h2 className="section-title">累積シグナル &#8212; キャリア価値観</h2>
                  <div className="space-y-3">
                    {allSignals.flatMap((s) => s.careerValues || []).map((cv, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <span className={`badge ${getSignalStrengthColor(cv.strength)}`}>
                          {getSignalStrengthLabel(cv.strength)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{cv.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5 italic">{cv.evidence}</p>
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
                          {(signal.positiveReactions || []).map((r, i) => (
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
                          {(signal.concerns || []).map((c, i) => (
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
                    {signal.questionsAsked && signal.questionsAsked.length > 0 && (
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
          <div className="card p-8 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-500 mb-4">
              AIカルテは面接データが蓄積されると自動生成されます
            </p>
            <Link href={`/candidates/${id}/signal-input`} className="btn-primary inline-flex">
              <Sparkles className="w-4 h-4" />
              シグナル入力を行う
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
