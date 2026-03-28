'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Mail,
  Star,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  User,
  Brain,
  GraduationCap,
  Upload,
  Activity,
  Award,
  Plus,
  Save,
  Trash2,
  X,
  Loader2,
  Phone,
  Building2,
  Calendar,
  Zap,
  ArrowRight,
  MapPin,
  Eye,
} from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PredictionCard from './components/PredictionCard'

// ==================== Types ====================

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
  current_stage?: string
  university?: string
  faculty?: string
  graduation_year?: number
  work_experience?: Array<{ company: string; title: string; years: number }>
  created_at: string
  metadata?: Record<string, unknown>
  candidate_documents?: Array<{
    id: string
    document_type: string
    file_name: string
    file_size?: string
    uploaded_at?: string
    parse_status?: string
  }>
}

interface InterviewRecord {
  id?: string
  tenant_id?: string
  candidate_id?: string
  job_id?: string
  stage: string
  interviewer_name: string
  interviewer_role: string
  interview_date: string
  interview_text: string
  candidate_survey?: Record<string, unknown>
  interviewer_evaluation: {
    result: string
    criteria: Array<{ label: string; score: number }>
    pass_reason: string
    handoff_to_interviewer: string
    handoff_to_hr: string
  }
  temperature_score: number
  result: string
  created_at?: string
  updated_at?: string
}

interface EvaluationCriterion {
  label: string
  score: number
}

interface InterviewFormState {
  stage: string
  interviewer_name: string
  interviewer_role: string
  interview_date: string
  interview_text: string
  evaluation_result: string
  criteria: EvaluationCriterion[]
  pass_reason: string
  handoff_to_interviewer: string
  handoff_to_hr: string
  temperature_score: number
}

interface ScoresData {
  scores: { motivation: number; anxiety: number; acceptance: number; match: number }
  trend: { motivation: string; anxiety: string; acceptance: string }
  last_contact_days: number
  touchpoint_count: number
}

interface NextAction {
  id: string
  priority: 'urgent' | 'recommended' | 'optional'
  title: string
  description: string
  action_type: string
  action_url: string
  icon: string
}

interface SignalContent {
  summary?: string
  attractAngle?: string
  careerValues?: Array<{ value: string; strength: string; evidence: string; evpMatch?: string }>
  positiveReactions?: Array<{ topic: string; reaction: string; matchStrength?: string }>
  concerns?: Array<{ concern: string; severity: string; status: string }>
  energyLevel?: number
  questionsAsked?: string[]
  urgentActions?: Array<{ action: string; priority: string }>
  strengths?: Array<{ label: string; description: string }>
}

interface SignalRecord {
  id?: string
  content: SignalContent
  created_at?: string
}

// ==================== Constants ====================

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  { label: 'コミュニケーション力', score: 3 },
  { label: 'スキルマッチ', score: 3 },
  { label: 'カルチャーフィット', score: 3 },
  { label: '成長意欲', score: 3 },
]

const STAGE_OPTIONS = [
  { value: 'recruiter', label: 'リクルーター面談' },
  { value: 'casual', label: 'カジュアル面談' },
  { value: 'interview_1', label: '一次面接' },
  { value: 'interview_2', label: '二次面接' },
  { value: 'interview_3', label: '三次面接' },
  { value: 'interview_final', label: '最終面接' },
  { value: 'aptitude', label: '適性検査' },
  { value: 'gd', label: 'グループディスカッション' },
  { value: 'internship', label: 'インターン' },
  { value: 'trial', label: '体験入社・ワークサンプル' },
  { value: 'offer', label: 'オファー面談' },
]

const RESULT_OPTIONS = [
  { value: 'S', label: 'S', desc: 'ぜひ採用したい', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'A', label: 'A', desc: '能力高い', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'B', label: 'B', desc: '次回選考で要確認', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'C', label: 'C', desc: '不合格', color: 'bg-red-100 text-red-700 border-red-300' },
]

const ACCEPTED_FILE_TYPES = '.mp4,.webm,.mp3,.m4a,.txt,.pdf,.docx'

const JOURNEY_STAGES = [
  { key: 'applied', label: '応募' },
  { key: 'understanding', label: '理解' },
  { key: 'interview_1', label: '面接1' },
  { key: 'interview_2', label: '面接2' },
  { key: 'interview_final', label: '最終' },
  { key: 'offer', label: '内定' },
  { key: 'hired', label: '承諾' },
]

// ==================== Helpers ====================

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    recruiter: 'リクルーター面談', casual: 'カジュアル面談',
    interview_1: '一次面接', interview_2: '二次面接',
    interview_3: '三次面接', interview_final: '最終面接',
    final: '最終面接', offer: 'オファー面談', hired: '内定承諾',
    briefing: '説明会', es: 'ES選考', aptitude: '適性検査',
    gd: 'グループディスカッション', internship: 'インターン',
    trial: '体験入社・ワークサンプル', active: '選考中',
  }
  return labels[stage] || stage || '選考中'
}

function getResultBadge(result: string | undefined, evaluation?: InterviewRecord['interviewer_evaluation']): { label: string; color: string; short: string } {
  const evalResult = evaluation?.result || result
  switch (evalResult) {
    case 'S': return { label: 'S - ぜひ採用したい', color: 'bg-emerald-100 text-emerald-700', short: 'S' }
    case 'A': return { label: 'A - 能力高い', color: 'bg-blue-100 text-blue-700', short: 'A' }
    case 'B': return { label: 'B - 次回選考で要確認', color: 'bg-amber-100 text-amber-700', short: 'B' }
    case 'C': return { label: 'C - 不合格', color: 'bg-red-100 text-red-700', short: 'C' }
    case 'pass': return { label: '合格', color: 'bg-emerald-100 text-emerald-700', short: 'P' }
    case 'fail': return { label: '不合格', color: 'bg-red-100 text-red-700', short: 'F' }
    case 'hold': return { label: '保留', color: 'bg-amber-100 text-amber-700', short: 'H' }
    default: return { label: '評価待ち', color: 'bg-gray-100 text-gray-500', short: '-' }
  }
}

function mapEvalResultToDBResult(evalResult: string): string {
  switch (evalResult) {
    case 'S': case 'A': return 'pass'
    case 'B': return 'hold'
    case 'C': return 'fail'
    default: return 'pending'
  }
}

const STAGE_SUGGEST_ORDER = ['interview_1', 'interview_2', 'interview_3', 'interview_final']

function getNextStage(existingInterviews?: InterviewRecord[]): string {
  if (!existingInterviews || existingInterviews.length === 0) return 'interview_1'
  const existingStages = existingInterviews.map(iv => iv.stage)
  for (const stage of STAGE_SUGGEST_ORDER) {
    if (!existingStages.includes(stage)) return stage
  }
  return 'interview_final'
}

function createEmptyFormState(existingInterviews?: InterviewRecord[]): InterviewFormState {
  return {
    stage: getNextStage(existingInterviews),
    interviewer_name: '', interviewer_role: '',
    interview_date: new Date().toISOString().split('T')[0],
    interview_text: '', evaluation_result: '',
    criteria: DEFAULT_CRITERIA.map(c => ({ ...c })),
    pass_reason: '', handoff_to_interviewer: '', handoff_to_hr: '',
    temperature_score: 5,
  }
}

function interviewToFormState(iv: InterviewRecord): InterviewFormState {
  const eval_ = iv.interviewer_evaluation || {} as InterviewRecord['interviewer_evaluation']
  return {
    stage: iv.stage,
    interviewer_name: iv.interviewer_name || '',
    interviewer_role: iv.interviewer_role || '',
    interview_date: iv.interview_date || '',
    interview_text: iv.interview_text || '',
    evaluation_result: eval_?.result || '',
    criteria: eval_?.criteria?.length ? eval_.criteria : DEFAULT_CRITERIA.map(c => ({ ...c })),
    pass_reason: eval_?.pass_reason || '',
    handoff_to_interviewer: eval_?.handoff_to_interviewer || '',
    handoff_to_hr: eval_?.handoff_to_hr || '',
    temperature_score: iv.temperature_score || 5,
  }
}

function getScoreColor(score: number): string {
  if (score > 70) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function getScorePillBg(score: number): string {
  if (score > 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

function getScoreStroke(score: number): string {
  if (score > 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getTrendArrow(trend: string): { arrow: string; color: string } {
  switch (trend) {
    case 'rising': return { arrow: '\u2191', color: 'text-emerald-500' }
    case 'falling': return { arrow: '\u2193', color: 'text-red-500' }
    default: return { arrow: '\u2192', color: 'text-gray-400' }
  }
}

function resolveJourneyIndex(stage: string | undefined, interviews: InterviewRecord[]): number {
  if (!stage && interviews.length === 0) return 0
  const s = stage || ''
  if (s === 'hired') return 6
  if (s === 'offer' || s === 'offered') return 5
  if (s === 'interview_final' || s === 'final') return 4
  if (s === 'interview_3') return 3
  if (s === 'interview_2') return 3
  if (s === 'interview_1') return 2
  if (interviews.length > 0) {
    const stages = interviews.map(i => i.stage)
    if (stages.includes('interview_final') || stages.includes('final')) return 4
    if (stages.includes('interview_2') || stages.includes('interview_3')) return 3
    if (stages.includes('interview_1')) return 2
    return 1
  }
  return 0
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014'
  try { return new Date(dateStr).toLocaleDateString('ja-JP') } catch { return dateStr }
}

// ==================== Sub-components ====================

function StarRating({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className="p-0.5 hover:scale-110 transition-transform">
          <Star className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
        </button>
      ))}
      <span className="text-xs text-gray-500 ml-1">{value}/{max}</span>
    </div>
  )
}

function TemperatureSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const getColor = (v: number) => v <= 3 ? 'text-blue-500' : v <= 6 ? 'text-amber-500' : 'text-red-500'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">低い</span>
        <span className={`text-sm font-bold ${getColor(value)}`}>{value}/10</span>
        <span className="text-xs text-gray-500">高い</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
    </div>
  )
}

function CircularGauge({ score, label, size = 100 }: { score: number; label: string; size?: number }) {
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const stroke = getScoreStroke(score)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="7" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={stroke} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
    </div>
  )
}

function SectionHeader({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-6 bg-indigo-500 rounded-full" />
      {icon}
      <h2 className="text-lg font-bold text-gray-900">{children}</h2>
    </div>
  )
}

// ==================== Main Component ====================

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const searchParams = useSearchParams()

  // Core data
  const [candidate, setCandidate] = useState<CandidateData | null>(null)
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [signals, setSignals] = useState<SignalRecord[]>([])
  const [scores, setScores] = useState<ScoresData | null>(null)
  const [nextActions, setNextActions] = useState<NextAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Interview editing state
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set())
  const [editingForms, setEditingForms] = useState<Record<string, InterviewFormState>>({})
  const [savingInterviews, setSavingInterviews] = useState<Set<string>>(new Set())
  const [saveMessages, setSaveMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({})

  // New interview modal
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormState, setNewFormState] = useState<InterviewFormState>(createEmptyFormState())
  const [savingNew, setSavingNew] = useState(false)

  // File upload
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Score basis collapsible
  const [showScoreBasis, setShowScoreBasis] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Refs for scroll-to
  const evaluationsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Scroll to evaluations section when URL has ?tab=interviews
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'interviews' && evaluationsRef.current) {
      setTimeout(() => evaluationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    }
  }, [searchParams, loading])

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [candidateRes, interviewRes, signalRes, scoresRes, actionsRes] = await Promise.all([
          fetch(`/api/candidates/${id}`),
          fetch(`/api/candidates/${id}/interviews`),
          fetch(`/api/candidates/${id}/signals`),
          fetch(`/api/candidates/${id}/scores`).catch(() => null),
          fetch(`/api/candidates/${id}/next-actions`).catch(() => null),
        ])

        const candidateData = await candidateRes.json()
        const interviewData = await interviewRes.json()
        const signalData = await signalRes.json()

        if (candidateRes.ok && candidateData.candidate) {
          setCandidate(candidateData.candidate)
        } else {
          setError(candidateData.error || '候補者が見つかりません')
        }

        if (interviewRes.ok && interviewData.interviews) {
          setInterviews(interviewData.interviews)
        }

        if (signalRes.ok && signalData.signals) {
          setSignals(signalData.signals)
        }

        if (scoresRes && scoresRes.ok) {
          const sd = await scoresRes.json()
          setScores(sd)
        }

        if (actionsRes && actionsRes.ok) {
          const ad = await actionsRes.json()
          setNextActions(ad.actions || [])
        }
      } catch {
        setError('データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Update new form default stage when interviews change
  useEffect(() => {
    if (!showNewForm) {
      setNewFormState(prev => ({ ...prev, stage: getNextStage(interviews) }))
    }
  }, [interviews, showNewForm])

  // Toggle interview expand/collapse
  const toggleExpand = (interviewKey: string) => {
    setExpandedInterviews(prev => {
      const next = new Set(prev)
      if (next.has(interviewKey)) {
        next.delete(interviewKey)
      } else {
        next.add(interviewKey)
        if (!editingForms[interviewKey]) {
          const iv = interviews.find(i => (i.id || i.stage) === interviewKey)
          if (iv) setEditingForms(p => ({ ...p, [interviewKey]: interviewToFormState(iv) }))
        }
      }
      return next
    })
  }

  // Update form field
  const updateForm = (key: string, field: keyof InterviewFormState, value: unknown) => {
    setEditingForms(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  // Save interview
  const saveInterview = async (interviewKey: string, formState: InterviewFormState) => {
    if (!candidate) return
    setSavingInterviews(prev => new Set(prev).add(interviewKey))
    setSaveMessages(prev => { const n = { ...prev }; delete n[interviewKey]; return n })

    try {
      const body = {
        tenant_id: TENANT_ID, candidate_id: id, job_id: candidate.job_id,
        stage: formState.stage, interviewer_name: formState.interviewer_name,
        interviewer_role: formState.interviewer_role, interview_date: formState.interview_date,
        interview_text: formState.interview_text,
        interviewer_evaluation: {
          result: formState.evaluation_result,
          criteria: formState.criteria.filter(c => c.label.trim()),
          pass_reason: formState.pass_reason,
          handoff_to_interviewer: formState.handoff_to_interviewer,
          handoff_to_hr: formState.handoff_to_hr,
        },
        temperature_score: formState.temperature_score,
        result: mapEvalResultToDBResult(formState.evaluation_result),
      }

      const res = await fetch(`/api/candidates/${id}/interviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok && data.interview) {
        const refreshRes = await fetch(`/api/candidates/${id}/interviews`)
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) setInterviews(refreshData.interviews || [])
        setSaveMessages(prev => ({ ...prev, [interviewKey]: { type: 'success', text: '保存しました' } }))
        setTimeout(() => setSaveMessages(prev => { const n = { ...prev }; delete n[interviewKey]; return n }), 3000)
      } else {
        setSaveMessages(prev => ({ ...prev, [interviewKey]: { type: 'error', text: data.error || '保存に失敗しました' } }))
      }
    } catch {
      setSaveMessages(prev => ({ ...prev, [interviewKey]: { type: 'error', text: '保存中にエラーが発生しました' } }))
    } finally {
      setSavingInterviews(prev => { const n = new Set(prev); n.delete(interviewKey); return n })
    }
  }

  // Save new interview
  const saveNewInterview = async () => {
    if (!candidate) return
    setSavingNew(true)
    try {
      const body = {
        tenant_id: TENANT_ID, candidate_id: id, job_id: candidate.job_id,
        stage: newFormState.stage, interviewer_name: newFormState.interviewer_name,
        interviewer_role: newFormState.interviewer_role, interview_date: newFormState.interview_date,
        interview_text: newFormState.interview_text,
        interviewer_evaluation: {
          result: newFormState.evaluation_result,
          criteria: newFormState.criteria.filter(c => c.label.trim()),
          pass_reason: newFormState.pass_reason,
          handoff_to_interviewer: newFormState.handoff_to_interviewer,
          handoff_to_hr: newFormState.handoff_to_hr,
        },
        temperature_score: newFormState.temperature_score,
        result: mapEvalResultToDBResult(newFormState.evaluation_result),
      }

      const res = await fetch(`/api/candidates/${id}/interviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok && data.interview) {
        const refreshRes = await fetch(`/api/candidates/${id}/interviews`)
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) setInterviews(refreshData.interviews || [])
        setShowNewForm(false)
        setNewFormState(createEmptyFormState(interviews))
      }
    } catch { /* silent */ } finally { setSavingNew(false) }
  }

  // File upload handler
  const handleFileUpload = async (interviewKey: string, files: FileList | null) => {
    if (!files || files.length === 0 || !candidate) return
    setUploadingFiles(prev => new Set(prev).add(interviewKey))
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('document_type', 'other')
        formData.append('tenant_id', TENANT_ID)

        const res = await fetch(`/api/candidates/${id}/documents`, { method: 'POST', body: formData })
        if (res.ok) {
          const ext = file.name.split('.').pop()?.toLowerCase()
          if (['txt', 'pdf', 'docx'].includes(ext || '')) {
            const form = editingForms[interviewKey] || newFormState
            const fileRef = `[添付ファイル: ${file.name}]`
            const updatedText = form.interview_text ? `${form.interview_text}\n${fileRef}` : fileRef
            if (interviewKey === '__new__') {
              setNewFormState(prev => ({ ...prev, interview_text: updatedText }))
            } else {
              updateForm(interviewKey, 'interview_text', updatedText)
            }
          }
        }
      }
      const candidateRes = await fetch(`/api/candidates/${id}`)
      const candidateData = await candidateRes.json()
      if (candidateRes.ok && candidateData.candidate) setCandidate(candidateData.candidate)
    } catch { /* silent */ } finally {
      setUploadingFiles(prev => { const n = new Set(prev); n.delete(interviewKey); return n })
    }
  }

  // Delete candidate
  const deleteCandidate = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/candidates')
    } catch { /* silent */ } finally { setDeleting(false) }
  }

  // ==================== Loading/Error states ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">候補者情報を読み込んでいます...</span>
        </div>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/candidates" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> 候補者一覧に戻る
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <p>{error || '候補者が見つかりません'}</p>
        </div>
      </div>
    )
  }

  const isNewgrad = candidate.hiring_type === 'new_graduate' || candidate.hiring_type === 'newgrad'
  const currentStage = candidate.current_stage || candidate.status
  const journeyIndex = resolveJourneyIndex(currentStage, interviews)
  const sortedInterviews = [...interviews].sort((a, b) => {
    const da = a.interview_date || a.created_at || ''
    const db2 = b.interview_date || b.created_at || ''
    return db2.localeCompare(da) // most recent first
  })

  const latestSignal = signals.length > 0 ? signals[0] : null
  const signalContent = latestSignal?.content

  const urgentAction = nextActions.find(a => a.priority === 'urgent') || nextActions[0]

  // ==================== Evaluation Form Renderer ====================
  const renderEvaluationForm = (formKey: string, form: InterviewFormState, onUpdate: (field: keyof InterviewFormState, value: unknown) => void, isNew: boolean) => (
    <div className="space-y-5 mt-4">
      {isNew && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">選考ステージ</label>
            <select value={form.stage} onChange={(e) => onUpdate('stage', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {STAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">面接日</label>
            <input type="date" value={form.interview_date} onChange={(e) => onUpdate('interview_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">面接官氏名</label>
            <input type="text" value={form.interviewer_name} onChange={(e) => onUpdate('interviewer_name', e.target.value)}
              placeholder="田中太郎" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">面接官役職</label>
            <input type="text" value={form.interviewer_role} onChange={(e) => onUpdate('interviewer_role', e.target.value)}
              placeholder="エンジニアリングマネージャー" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">総合評価</label>
        <div className="flex gap-2">
          {RESULT_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => onUpdate('evaluation_result', opt.value)}
              className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-center transition-all ${
                form.evaluation_result === opt.value ? opt.color + ' border-current font-bold' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span className="text-lg font-bold block">{opt.label}</span>
              <span className="text-[10px] block mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">評価項目</label>
        <div className="space-y-2">
          {form.criteria.map((criterion, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
              <input type="text" value={criterion.label}
                onChange={(e) => { const c = [...form.criteria]; c[idx] = { ...c[idx], label: e.target.value }; onUpdate('criteria', c) }}
                placeholder="評価項目名" className="flex-1 bg-transparent border-0 text-sm focus:outline-none" />
              <StarRating value={criterion.score}
                onChange={(v) => { const c = [...form.criteria]; c[idx] = { ...c[idx], score: v }; onUpdate('criteria', c) }} />
              <button type="button" onClick={() => onUpdate('criteria', form.criteria.filter((_, i) => i !== idx))}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onUpdate('criteria', [...form.criteria, { label: '', score: 3 }])}
          className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
          <Plus className="w-3 h-3" /> 評価項目を追加
        </button>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">合格理由 / 不合格理由</label>
        <p className="text-[10px] text-gray-400 mb-1">この内容が合格・通過レターに反映されます</p>
        <textarea value={form.pass_reason} onChange={(e) => onUpdate('pass_reason', e.target.value)}
          placeholder="評価の根拠や理由を記述..." rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">次回面接官への申し送り</label>
        <textarea value={form.handoff_to_interviewer} onChange={(e) => onUpdate('handoff_to_interviewer', e.target.value)}
          placeholder="次の面接官に伝えたい情報..." rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">人事への申し送り</label>
        <textarea value={form.handoff_to_hr} onChange={(e) => onUpdate('handoff_to_hr', e.target.value)}
          placeholder="年収希望、入社時期、特記事項など..." rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">候補者の志望度</label>
        <TemperatureSlider value={form.temperature_score} onChange={(v) => onUpdate('temperature_score', v)} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">面接メモ</label>
        <textarea value={form.interview_text} onChange={(e) => onUpdate('interview_text', e.target.value)}
          placeholder="面接中の気づきやメモ..." rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">録画・書き起こしアップロード</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.current[formKey]?.click()}>
          <input ref={el => { fileInputRefs.current[formKey] = el }} type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden"
            onChange={(e) => handleFileUpload(formKey, e.target.files)} />
          {uploadingFiles.has(formKey) ? (
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">アップロード中...</span>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">クリックしてファイルを選択</p>
              <p className="text-[10px] text-gray-400 mt-0.5">対応形式: mp4, webm, mp3, m4a, txt, pdf, docx</p>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ========== 1. HERO HEADER (sticky) ========== */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3">
            <Link href="/candidates" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs text-gray-400">候補者管理</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-xs text-gray-700 font-medium">{candidate.full_name}</span>
          </div>

          {/* Name + badges + journey */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-indigo-700">{(candidate.full_name || '?')[0]}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900 truncate">{candidate.full_name}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isNewgrad ? 'bg-pink-50 text-pink-700' : 'bg-indigo-50 text-indigo-700'}`}>
                    {isNewgrad ? '新卒' : '中途'}
                  </span>
                </div>
                {/* Journey timeline */}
                <div className="flex items-center gap-1 mt-2">
                  {JOURNEY_STAGES.map((st, i) => (
                    <div key={st.key} className="flex items-center">
                      {i > 0 && (
                        <div className={`w-4 h-0.5 ${i <= journeyIndex ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                      )}
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full flex items-center justify-center transition-all ${
                          i < journeyIndex ? 'w-3 h-3 bg-indigo-500' :
                          i === journeyIndex ? 'w-4 h-4 bg-indigo-600 ring-4 ring-indigo-100 animate-pulse' :
                          'w-3 h-3 border-2 border-gray-300 bg-white'
                        }`} />
                        <span className={`text-[9px] mt-0.5 ${i <= journeyIndex ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score pills + action button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {scores && (
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getScorePillBg(scores.scores.motivation)}`}>
                    志望度 {scores.scores.motivation}%
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getScorePillBg(scores.scores.acceptance)}`}>
                    承諾確率 {scores.scores.acceptance}%
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getScorePillBg(scores.scores.match)}`}>
                    マッチ度 {scores.scores.match}%
                  </span>
                </div>
              )}
              {urgentAction && (
                <Link href={urgentAction.action_url}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  <Zap className="w-4 h-4" />
                  次にやるべきこと
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== Page Content ========== */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ========== 2. BASIC PROFILE ========== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<User className="w-5 h-5 text-indigo-500" />}>基本プロフィール</SectionHeader>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {[
              { icon: <Mail className="w-3.5 h-3.5 text-gray-400" />, label: 'メール', value: candidate.email },
              { icon: <Phone className="w-3.5 h-3.5 text-gray-400" />, label: '電話番号', value: candidate.phone || '\u2014' },
              { icon: <Building2 className="w-3.5 h-3.5 text-gray-400" />, label: isNewgrad ? '大学' : '現職',
                value: isNewgrad
                  ? `${candidate.university || ''} ${candidate.faculty || ''}`.trim() || '\u2014'
                  : candidate.current_title ? `${candidate.current_company || ''} / ${candidate.current_title}` : '\u2014' },
              ...(isNewgrad ? [{ icon: <GraduationCap className="w-3.5 h-3.5 text-gray-400" />, label: '卒業予定', value: candidate.graduation_year ? `${candidate.graduation_year}年3月` : '\u2014' }] : []),
              { icon: <MapPin className="w-3.5 h-3.5 text-gray-400" />, label: '流入元', value: candidate.source || '\u2014' },
              { icon: <Calendar className="w-3.5 h-3.5 text-gray-400" />, label: '登録日', value: formatDate(candidate.created_at) },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Work Experience */}
          {candidate.work_experience && candidate.work_experience.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">職歴</p>
              <div className="flex flex-wrap gap-2">
                {candidate.work_experience.map((exp, i) => (
                  <span key={i} className="text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="font-medium">{exp.company}</span> / {exp.title} ({exp.years}年)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {candidate.candidate_documents && candidate.candidate_documents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">書類</p>
                <Link href={`/candidates/${id}/documents`} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium">
                  書類管理
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.candidate_documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs text-gray-700">{doc.file_name}</span>
                    {doc.parse_status === 'parsed' && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">AI解析済</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========== 3. AI-GENERATED UNDERSTANDING ========== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<Brain className="w-5 h-5 text-violet-500" />}>候補者理解サマリー</SectionHeader>
          {signalContent ? (
            <div className="space-y-4">
              {/* Career Values */}
              {signalContent.careerValues && signalContent.careerValues.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">キャリア価値観</p>
                  <div className="flex flex-wrap gap-2">
                    {signalContent.careerValues.map((cv, i) => (
                      <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        cv.strength === 'high' ? 'bg-violet-100 text-violet-700' :
                        cv.strength === 'medium' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{cv.value}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {signalContent.strengths && signalContent.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">強み</p>
                  <div className="grid grid-cols-2 gap-3">
                    {signalContent.strengths.map((s, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-800">{s.label}</p>
                        <p className="text-[11px] text-blue-600 mt-0.5">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concerns */}
              {signalContent.concerns && signalContent.concerns.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">不安・懸念</p>
                  <div className="space-y-2">
                    {signalContent.concerns.map((c, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-amber-800">{c.concern}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            c.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>{c.severity === 'high' ? '高' : c.severity === 'medium' ? '中' : '低'}</span>
                        </div>
                        <p className="text-[11px] text-amber-700 mt-1">{c.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Positive Reactions */}
              {signalContent.positiveReactions && signalContent.positiveReactions.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">ポジティブ反応</p>
                  <div className="grid grid-cols-2 gap-3">
                    {signalContent.positiveReactions.map((pr, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-emerald-800">{pr.topic}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">{pr.reaction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {signalContent.summary && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">{signalContent.summary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-violet-300" />
              <p className="text-sm text-violet-700 font-medium mb-1">候補者シグナルがまだありません</p>
              <p className="text-xs text-violet-500 mb-4">面接の録画/書き起こし・アンケートからAIがシグナルを抽出します</p>
              <Link href={`/candidates/${id}/signal-input`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
                <Sparkles className="w-4 h-4" /> 候補者シグナルを抽出する
              </Link>
            </div>
          )}
        </section>

        {/* ========== 4. SCORE DASHBOARD ========== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<Activity className="w-5 h-5 text-indigo-500" />}>スコアダッシュボード</SectionHeader>
          {scores ? (
            <>
              <div className="flex items-start justify-around py-4">
                <div className="flex flex-col items-center">
                  <CircularGauge score={scores.scores.motivation} label="志望度" />
                  {scores.trend.motivation && (() => {
                    const t = getTrendArrow(scores.trend.motivation)
                    return <span className={`text-sm font-bold mt-1 ${t.color}`}>{t.arrow}</span>
                  })()}
                </div>
                <div className="flex flex-col items-center">
                  <CircularGauge score={scores.scores.anxiety} label="不安度" />
                  {scores.trend.anxiety && (() => {
                    const t = getTrendArrow(scores.trend.anxiety === 'rising' ? 'falling' : scores.trend.anxiety === 'falling' ? 'rising' : 'stable')
                    return <span className={`text-sm font-bold mt-1 ${t.color}`}>{t.arrow}</span>
                  })()}
                </div>
                <div className="flex flex-col items-center">
                  <CircularGauge score={scores.scores.acceptance} label="承諾確率" />
                  {scores.trend.acceptance && (() => {
                    const t = getTrendArrow(scores.trend.acceptance)
                    return <span className={`text-sm font-bold mt-1 ${t.color}`}>{t.arrow}</span>
                  })()}
                </div>
                <CircularGauge score={scores.scores.match} label="マッチ度" />
              </div>

              {/* Score basis collapsible */}
              <div className="border-t border-gray-100 mt-4 pt-3">
                <button onClick={() => setShowScoreBasis(!showScoreBasis)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium">
                  {showScoreBasis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  スコアの根拠
                </button>
                {showScoreBasis && (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-gray-500 mb-1">最終接触</p>
                      <p className="text-sm text-gray-800">{scores.last_contact_days}日前</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-gray-500 mb-1">接触回数</p>
                      <p className="text-sm text-gray-800">{scores.touchpoint_count}回</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Activity className="w-6 h-6 mx-auto mb-2 text-gray-200" />
              <p className="text-xs">面接データが蓄積されるとスコアが算出されます</p>
            </div>
          )}
        </section>

        {/* ========== 5. JOURNEY TIMELINE ========== */}
        <section ref={timelineRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<Clock className="w-5 h-5 text-indigo-500" />}>ジャーニータイムライン</SectionHeader>
          {sortedInterviews.length > 0 ? (
            <div className="relative ml-4">
              {/* Vertical line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-100 rounded-full" />

              <div className="space-y-6">
                {sortedInterviews.map((iv) => {
                  const badge = getResultBadge(iv.result, iv.interviewer_evaluation)
                  const handoffNote = iv.interviewer_evaluation?.handoff_to_hr || iv.interviewer_evaluation?.handoff_to_interviewer || ''
                  const interviewText = iv.interview_text || ''
                  const summary = handoffNote || (interviewText.length > 80 ? interviewText.slice(0, 80) + '...' : interviewText)

                  return (
                    <div key={iv.id || iv.stage} className="relative pl-10">
                      {/* Dot */}
                      <div className={`absolute left-1 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                        iv.result === 'pass' ? 'bg-emerald-500' : iv.result === 'fail' ? 'bg-red-500' : iv.result === 'hold' ? 'bg-amber-500' : 'bg-indigo-400'
                      }`}>
                        <span className="text-[8px] font-bold text-white">{badge.short}</span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{getStageLabel(iv.stage)}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.short}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[11px] text-gray-400">{iv.interview_date || '日程未定'}</span>
                              {iv.interviewer_name && (
                                <span className="text-[11px] text-gray-500">{iv.interviewer_name}{iv.interviewer_role ? ` (${iv.interviewer_role})` : ''}</span>
                              )}
                            </div>
                          </div>
                          {iv.temperature_score > 0 && (
                            <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-100">
                              <Activity className="w-3 h-3 text-indigo-400" />
                              <span className="text-[11px] font-bold text-gray-700">{iv.temperature_score}/10</span>
                            </div>
                          )}
                        </div>

                        {summary && (
                          <p className="text-xs text-gray-600 leading-relaxed bg-white rounded-lg p-2.5 border border-gray-50 mt-2">
                            {summary}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => toggleExpand(iv.id || iv.stage)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" /> 詳細を見る
                          </button>
                          <Link href={`/candidates/${id}/brief`}
                            className="text-[11px] text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" /> 次回に活かす
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">タイムラインに表示するデータがありません</p>
              <p className="text-xs mt-1">面接を追加すると、候補者のジャーニーがここに表示されます</p>
            </div>
          )}
        </section>

        {/* ========== 6. NEXT ACTIONS ========== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<Zap className="w-5 h-5 text-rose-500" />}>次のアクション</SectionHeader>
          {nextActions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nextActions.map((action) => (
                <div key={action.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                      action.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                      action.priority === 'recommended' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{action.priority === 'urgent' ? '緊急' : action.priority === 'recommended' ? '推奨' : '任意'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link href={action.action_url}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      実行する <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
              <p className="text-sm text-emerald-700 font-medium">すべてのアクションが完了しています</p>
            </div>
          )}
        </section>

        {/* ========== 7. AI QUICK ACTIONS ========== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<Sparkles className="w-5 h-5 text-indigo-500" />}>AI クイックアクション</SectionHeader>
          <div className="grid grid-cols-2 gap-4">
            {[
              { href: `/candidates/${id}/attract`, icon: <Sparkles className="w-5 h-5" />, label: '惹きつけメモ', desc: '候補者に最適化された惹きつけストーリーを生成', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' },
              { href: `/candidates/${id}/personal-offer`, icon: <Award className="w-5 h-5" />, label: 'ファーストコンタクト', desc: '候補者の価値観に響くオファーレターを作成', color: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' },
              { href: `/candidates/${id}/feedback-letter`, icon: <Mail className="w-5 h-5" />, label: '合格・通過レター', desc: '評価理由を反映した合格・通過レター', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' },
              { href: `/candidates/${id}/brief`, icon: <FileText className="w-5 h-5" />, label: '面接準備シート', desc: '次回面接官のためのブリーフィング資料', color: 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${item.color}`}>
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== 8. INTERVIEW EVALUATIONS ========== */}
        <section ref={evaluationsRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={<ClipboardCheck className="w-5 h-5 text-indigo-500" />}>選考評価</SectionHeader>

          <div className="space-y-3">
            {interviews.length === 0 && !showNewForm && (
              <div className="py-6 text-center text-gray-400">
                <ClipboardCheck className="w-6 h-6 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">評価データがありません</p>
              </div>
            )}

            {interviews.map((interview) => {
              const key = interview.id || interview.stage
              const isExpanded = expandedInterviews.has(key)
              const form = editingForms[key]
              const badge = getResultBadge(interview.result, interview.interviewer_evaluation)
              const isSaving = savingInterviews.has(key)
              const saveMsg = saveMessages[key]

              return (
                <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(key)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        interview.result === 'pass' ? 'bg-emerald-500' :
                        interview.result === 'fail' ? 'bg-red-500' :
                        interview.result === 'hold' ? 'bg-amber-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{getStageLabel(interview.stage)}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {interview.interview_date || '日程未定'}
                          {interview.interviewer_name && ` / ${interview.interviewer_name}`}
                          {interview.interviewer_role && ` (${interview.interviewer_role})`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                      {interview.temperature_score > 0 && (
                        <span className="text-xs text-gray-400">志望度: {interview.temperature_score}/10</span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && form && (
                    <div className="border-t border-gray-100 p-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">面接官氏名</label>
                          <input type="text" value={form.interviewer_name} onChange={(e) => updateForm(key, 'interviewer_name', e.target.value)}
                            placeholder="面接官名" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">面接官役職</label>
                          <input type="text" value={form.interviewer_role} onChange={(e) => updateForm(key, 'interviewer_role', e.target.value)}
                            placeholder="役職" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">面接日</label>
                          <input type="date" value={form.interview_date} onChange={(e) => updateForm(key, 'interview_date', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                      </div>

                      {renderEvaluationForm(key, form, (field, value) => updateForm(key, field, value), false)}

                      <div className="mt-5 flex items-center gap-3">
                        <button onClick={() => saveInterview(key, form)} disabled={isSaving}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {isSaving ? '保存中...' : '保存する'}
                        </button>
                        {saveMsg && (
                          <span className={`text-sm ${saveMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{saveMsg.text}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* New Interview Modal */}
            {showNewForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewForm(false)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-2xl z-10">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-500" /> 新しい選考を追加
                    </h3>
                    <button onClick={() => { setShowNewForm(false); setNewFormState(createEmptyFormState(interviews)) }}
                      className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-5">
                    {renderEvaluationForm('__new__', newFormState, (field, value) => setNewFormState(prev => ({ ...prev, [field]: value })), true)}
                    <div className="mt-5 flex items-center gap-3">
                      <button onClick={saveNewInterview} disabled={savingNew}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {savingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {savingNew ? '保存中...' : '保存する'}
                      </button>
                      <button onClick={() => { setShowNewForm(false); setNewFormState(createEmptyFormState(interviews)) }}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">キャンセル</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add New Button */}
            <button onClick={() => setShowNewForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> 新しい選考を追加
            </button>
          </div>
        </section>

        {/* ========== 9. DANGER ZONE ========== */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-red-400 rounded-full" />
            <Trash2 className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-red-600">Danger Zone</h2>
          </div>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors">
              候補者を削除する
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700 mb-3">本当にこの候補者を削除しますか？この操作は取り消せません。</p>
              <div className="flex items-center gap-3">
                <button onClick={deleteCandidate} disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? '削除中...' : '削除する'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">キャンセル</button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
