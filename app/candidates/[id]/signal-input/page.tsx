'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Sparkles,
  FileText,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Heart,
  MessageSquare,
  Brain,
  Target,
  ArrowRight,
  Upload,
  Mic,
  Headphones,
  Edit3,
  Info,
  Video,
  FileAudio,
  Loader2,
  ArrowLeft,
  Save,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

// AI抽出ステップアニメーション
const EXTRACTION_STEPS = [
  { label: '面接データを読み込んでいます...', icon: FileText, duration: 600 },
  { label: '事前資料を参照中...', icon: Upload, duration: 500 },
  { label: '発言パターンを解析中...', icon: Brain, duration: 800 },
  { label: '志向・価値観を抽出中...', icon: Heart, duration: 700 },
  { label: '懸念事項を識別中...', icon: AlertTriangle, duration: 600 },
  { label: 'アンケート内容とクロスリファレンス中...', icon: Target, duration: 700 },
  { label: 'シグナルを構造化しています...', icon: Sparkles, duration: 500 },
]

interface SignalData {
  candidateName: string
  stage: string
  careerValues: Array<{
    value: string
    strength: string
    evidence: string
    evpMatch: string
  }>
  positiveReactions: Array<{
    topic: string
    reaction: string
    matchStrength: string
  }>
  concerns: Array<{
    concern: string
    severity: string
    status: string
  }>
  questionsAsked: string[]
  energyLevel: number
  attractAngle: string
  urgentActions: Array<{
    action: string
    priority: string
  }>
  summary?: string
}

export default function SignalInputPage() {
  const params = useParams()
  const id = params.id as string

  const [candidate, setCandidate] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [revp, setRevp] = useState<any>(null)
  const [interviews, setInterviews] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [memo, setMemo] = useState('')
  const [surveyText, setSurveyText] = useState('')
  const [phase, setPhase] = useState<'input' | 'extracting' | 'result'>('input')
  const [extractionStep, setExtractionStep] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [expandedSection, setExpandedSection] = useState<string | null>('values')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<SignalData | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [candidateRes, jobsRes, profileRes, interviewRes] = await Promise.all([
          fetch(`/api/candidates/${id}`),
          fetch(`/api/jobs?tenant_id=${TENANT_ID}`),
          fetch(`/api/company-profile?tenant_id=${TENANT_ID}`),
          fetch(`/api/candidates/${id}/interviews`),
        ])

        const candidateData = await candidateRes.json()
        const cand = candidateData.candidate
        setCandidate(cand)
        setDocuments(cand?.candidate_documents || [])

        const jobsData = await jobsRes.json()
        const matchedJob = (jobsData.jobs || []).find((j: any) => j.id === cand?.job_id)
        setJob(matchedJob || null)

        const profileData = await profileRes.json()
        setRevp(profileData.profile?.revp_data || null)

        const interviewData = await interviewRes.json()
        setInterviews(interviewData.interviews || [])

        // Pre-fill memo with interview texts and survey data
        const ivs = interviewData.interviews || []
        const existingMemos = ivs
          .filter((iv: any) => iv.interview_text)
          .map((iv: any) => `【${iv.stage}】${iv.interviewer_name || ''}\n${iv.interview_text}`)
          .join('\n\n---\n\n')
        if (existingMemos) setMemo(existingMemos)

        // Pre-fill survey from interview candidate_survey
        const surveys = ivs
          .filter((iv: any) => iv.candidate_survey && Object.keys(iv.candidate_survey).length > 0)
          .map((iv: any) => `【${iv.stage} アンケート】\n${JSON.stringify(iv.candidate_survey, null, 2)}`)
          .join('\n\n')
        if (surveys) setSurveyText(surveys)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  // Handle file upload for recording/transcript
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file.name)
      // Read text content if applicable
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (['txt'].includes(ext || '')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const text = ev.target?.result as string
          setMemo(prev => prev ? `${prev}\n\n---\n\n【アップロードファイル: ${file.name}】\n${text}` : text)
        }
        reader.readAsText(file)
      }
    }
  }

  // Main extraction: call the AI API
  const handleExtract = async () => {
    setPhase('extracting')
    setExtractionStep(0)
    setError('')
    const startTime = Date.now()

    // Run step animation
    const animPromise = (async () => {
      for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
        await new Promise((r) => setTimeout(r, EXTRACTION_STEPS[i].duration))
        setExtractionStep(i + 1)
      }
    })()

    // Simultaneously call the API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    try {
      const apiPromise = fetch(`/api/candidates/${id}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          job,
          revp,
          interviews,
          documents: documents.map((d: any) => ({
            file_name: d.file_name,
            extracted_text: d.extracted_text || d.content || '',
          })),
          survey_text: surveyText,
          memo_text: memo,
        }),
        signal: controller.signal,
      })

      const [, res] = await Promise.all([animPromise, apiPromise])
      clearTimeout(timeoutId)

      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setPhase('input')
        return
      }

      setExtractedData(data.signal)
      setElapsedMs(Date.now() - startTime)
      setPhase('result')
      setSaved(true) // auto-saved by API
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('AI解析がタイムアウトしました。しばらく待ってから再度お試しください。')
      } else {
        setError('シグナル抽出中にエラーが発生しました。')
      }
      setPhase('input')
    }
  }

  const strengthColor = (s: string) =>
    s === 'high' ? 'text-emerald-700 bg-emerald-50' :
    s === 'medium' ? 'text-amber-700 bg-amber-50' :
    'text-gray-500 bg-gray-50'

  const strengthLabel = (s: string) =>
    s === 'high' ? '強' : s === 'medium' ? '中' : '低'

  const matchStrengthColor = (s: string) =>
    s === 'very_strong' ? 'border-l-4 border-emerald-400 bg-emerald-50' :
    s === 'strong' ? 'border-l-4 border-blue-400 bg-blue-50' :
    'border-l-4 border-gray-300 bg-gray-50'

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const candidateName = candidate?.full_name || '不明'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidateName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">候補者シグナル</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">候補者シグナル抽出</h1>
              <span className="badge bg-indigo-100 text-indigo-700">AI自動抽出</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {candidateName} — 面接録画/書き起こし・アンケート・事前資料から統合分析
            </p>
          </div>
          {phase === 'result' && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Zap className="w-3.5 h-3.5" />
              <span>AI抽出完了 — <strong>{(elapsedMs / 1000).toFixed(1)}秒</strong></span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* ============ INPUT PHASE ============ */}
        {phase === 'input' && (
          <div className="flex gap-8 max-w-7xl mx-auto">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">データソースの確認・追加</h2>
                  <p className="text-xs text-gray-500">面接データ・アンケート・事前資料を統合してAIがシグナルを抽出します</p>
                </div>
              </div>

              {/* Auto-loaded data sources */}
              <div className="card p-5 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  自動取得済みデータ
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-lg p-3 border ${interviews.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs font-medium text-gray-700">面接記録</p>
                    <p className={`text-lg font-bold ${interviews.length > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {interviews.length}件
                    </p>
                    {interviews.map((iv, i) => (
                      <p key={i} className="text-[10px] text-gray-500 truncate">{iv.stage}: {iv.interviewer_name || '面接官未設定'}</p>
                    ))}
                  </div>
                  <div className={`rounded-lg p-3 border ${documents.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs font-medium text-gray-700">事前資料</p>
                    <p className={`text-lg font-bold ${documents.length > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {documents.length}件
                    </p>
                    {documents.slice(0, 3).map((doc: any, i: number) => (
                      <p key={i} className="text-[10px] text-gray-500 truncate">{doc.file_name}</p>
                    ))}
                  </div>
                  <div className={`rounded-lg p-3 border ${job ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs font-medium text-gray-700">求人・REVP</p>
                    <p className={`text-lg font-bold ${job ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {job ? '連携済' : '未設定'}
                    </p>
                    {job && <p className="text-[10px] text-gray-500 truncate">{job.title}</p>}
                    {revp && <p className="text-[10px] text-gray-500 truncate">REVP: {revp.strengths?.length || 0}項目</p>}
                  </div>
                </div>
              </div>

              {/* Interview memo / transcript */}
              <div className="card p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    面接メモ・書き起こし
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.docx,.mp3,.wav,.m4a,.mp4,.webm"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      ファイル追加
                    </button>
                  </div>
                </div>
                {uploadedFile && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {uploadedFile} をアップロードしました
                  </div>
                )}
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="面接の録画書き起こし、議事録、メモを貼り付けてください。面接記録がある場合は自動で読み込まれます。"
                  rows={10}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">{memo.length}文字</p>
              </div>

              {/* Survey text */}
              <div className="card p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  選考後アンケート内容
                </h3>
                <textarea
                  value={surveyText}
                  onChange={(e) => setSurveyText(e.target.value)}
                  placeholder="選考後に候補者から回収したアンケート内容を貼り付けてください。&#10;例：当社の印象、志望度の変化、他社状況、不安に感じたこと など"
                  rows={5}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Extract button */}
              <button
                onClick={handleExtract}
                disabled={memo.length < 10 && interviews.length === 0}
                className={`btn-primary text-base px-8 py-3 w-full flex items-center justify-center gap-3 ${
                  memo.length < 10 && interviews.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles className="w-5 h-5" />
                AIでシグナルを抽出
              </button>
            </div>

            {/* Right sidebar */}
            <div className="w-72 flex-shrink-0 space-y-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-gray-800">シグナル抽出とは</h3>
                </div>
                <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                  <p>面接の録画/書き起こし、選考後アンケート、事前資料（履歴書等）を統合的にAIが分析し、以下を自動抽出します：</p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>候補者のキャリア価値観</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>ポジティブ反応・刺さったポイント</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>懸念事項と解消状況</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>最適な惹きつけ軸</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>緊急アクション</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-indigo-800">統合分析のメリット</h3>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  面接官のメモだけでは見落としがちな候補者の本音や価値観を、
                  アンケート結果と事前資料を掛け合わせることで高精度に抽出します。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============ EXTRACTING PHASE ============ */}
        {phase === 'extracting' && (
          <div className="max-w-lg mx-auto mt-20 text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-7 h-7 text-indigo-600" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">AIがシグナルを抽出中...</h2>
            <p className="text-sm text-gray-400 mb-8">
              面接データ・アンケート・事前資料を統合分析しています
            </p>

            <div className="text-left space-y-2 max-w-sm mx-auto">
              {EXTRACTION_STEPS.map((step, i) => {
                const StepIcon = step.icon
                const isDone = extractionStep > i
                const isCurrent = extractionStep === i
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isDone ? 'bg-emerald-50' : isCurrent ? 'bg-indigo-50' : 'bg-gray-50 opacity-40'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <StepIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${isDone ? 'text-emerald-700' : isCurrent ? 'text-indigo-700 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ============ RESULT PHASE ============ */}
        {phase === 'result' && extractedData && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <h2 className="text-base font-bold text-gray-900">AI抽出結果</h2>
                <p className="text-xs text-gray-500">面接データ・アンケート・事前資料から統合抽出されたシグナル</p>
              </div>
            </div>

            {/* Achievement banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">シグナル抽出完了！ 自動保存済み</p>
                  <p className="text-xs text-emerald-600">
                    {(elapsedMs / 1000).toFixed(1)}秒で完了 — 候補者詳細のシグナルタブで確認できます
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {extractedData.careerValues.length + extractedData.concerns.length + extractedData.positiveReactions.length}
                  </p>
                  <p className="text-xs text-emerald-600">抽出項目数</p>
                </div>
                <div className="w-px h-10 bg-emerald-200" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {extractedData.urgentActions.filter(a => a.priority === 'high').length}
                  </p>
                  <p className="text-xs text-emerald-600">高優先アクション</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {extractedData.summary && (
              <div className="card p-5 mb-6 border-l-4 border-gray-400">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">総合サマリー</p>
                <p className="text-sm text-gray-800 leading-relaxed">{extractedData.summary}</p>
              </div>
            )}

            {/* Attract Angle */}
            <div className="card p-5 mb-6 border-l-4 border-indigo-500 bg-indigo-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AIが特定した最適Attract軸</p>
              </div>
              <p className="text-sm font-semibold text-indigo-900 leading-relaxed">
                {extractedData.attractAngle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Career Values */}
              <div className="col-span-2 space-y-4">
                {/* Values */}
                <div className="card overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'values' ? null : 'values')}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-semibold text-gray-900">キャリア価値観</span>
                      <span className="badge bg-rose-50 text-rose-600">{extractedData.careerValues.length}</span>
                    </div>
                    {expandedSection === 'values' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSection === 'values' && (
                    <div className="px-5 pb-5 space-y-3">
                      {extractedData.careerValues.map((cv, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-gray-900">{cv.value}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${strengthColor(cv.strength)}`}>
                              {strengthLabel(cv.strength)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed mb-1.5">{cv.evidence}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                            <Target className="w-3 h-3" />
                            <span>EVPマッチ: {cv.evpMatch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Positive Reactions */}
                <div className="card overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'positive' ? null : 'positive')}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-900">ポジティブ反応</span>
                      <span className="badge bg-emerald-50 text-emerald-600">{extractedData.positiveReactions.length}</span>
                    </div>
                    {expandedSection === 'positive' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSection === 'positive' && (
                    <div className="px-5 pb-5 space-y-2">
                      {extractedData.positiveReactions.map((pr, i) => (
                        <div key={i} className={`rounded-xl p-4 ${matchStrengthColor(pr.matchStrength)}`}>
                          <p className="text-xs font-bold text-gray-800 mb-1">{pr.topic}</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{pr.reaction}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Concerns */}
                <div className="card overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'concerns' ? null : 'concerns')}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-900">懸念事項</span>
                      <span className="badge bg-amber-50 text-amber-600">{extractedData.concerns.length}</span>
                    </div>
                    {expandedSection === 'concerns' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSection === 'concerns' && (
                    <div className="px-5 pb-5 space-y-2">
                      {extractedData.concerns.map((c, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-800">{c.concern}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              c.severity === 'high' ? 'bg-red-100 text-red-700' :
                              c.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {c.severity === 'high' ? '高' : c.severity === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{c.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Energy Level */}
                <div className="card p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">エネルギーレベル</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div
                        key={n}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          n <= extractedData.energyLevel
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-300'
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {extractedData.energyLevel >= 4 ? '非常に高い熱量' : extractedData.energyLevel >= 3 ? '適度な関心' : '要フォロー'}
                  </p>
                </div>

                {/* Questions Asked */}
                {extractedData.questionsAsked.length > 0 && (
                  <div className="card p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">候補者からの質問</p>
                    <div className="space-y-2">
                      {extractedData.questionsAsked.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Urgent Actions */}
                <div className="card p-5">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    緊急アクション
                  </p>
                  <div className="space-y-2">
                    {extractedData.urgentActions.map((a, i) => (
                      <div key={i} className={`text-xs p-3 rounded-lg border ${priorityColor(a.priority)}`}>
                        <span className="font-bold">{a.priority === 'high' ? '🔴' : '🟡'}</span>{' '}
                        {a.action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between mt-6">
              <Link href={`/candidates/${id}?tab=signals`} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" />
                候補者詳細に戻る
              </Link>
              <button
                onClick={() => { setPhase('input'); setExtractedData(null) }}
                className="btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                再度抽出する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
