'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
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
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
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
  Plus,
  Save,
  Trash2,
  X,
  Loader2,
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
  current_stage?: string
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

const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  { label: 'コミュニケーション力', score: 3 },
  { label: 'スキルマッチ', score: 3 },
  { label: 'カルチャーフィット', score: 3 },
  { label: '成長意欲', score: 3 },
]

const STAGE_OPTIONS = [
  { value: 'interview_1', label: '一次面接' },
  { value: 'interview_2', label: '二次面接' },
  { value: 'interview_3', label: '三次面接' },
  { value: 'interview_final', label: '最終面接' },
]

const RESULT_OPTIONS = [
  { value: 'S', label: 'S', desc: 'ぜひ採用したい', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'A', label: 'A', desc: '能力高い', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'B', label: 'B', desc: '次回選考で要確認', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'C', label: 'C', desc: '不合格', color: 'bg-red-100 text-red-700 border-red-300' },
]

const ACCEPTED_FILE_TYPES = '.mp4,.webm,.mp3,.m4a,.txt,.pdf,.docx'

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    casual: 'カジュアル面談', interview_1: '一次面接', interview_2: '二次面接',
    interview_3: '三次面接', interview_final: '最終面接',
    final: '最終面接', offer: 'オファー', hired: '内定承諾',
    briefing: '説明会', es: 'ES選考', aptitude: '適性検査', gd: 'GD', active: '選考中',
  }
  return labels[stage] || stage || '選考中'
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    casual: 'bg-gray-100 text-gray-600', interview_1: 'bg-blue-50 text-blue-600',
    interview_2: 'bg-indigo-50 text-indigo-600', interview_3: 'bg-violet-50 text-violet-600',
    interview_final: 'bg-purple-50 text-purple-600', final: 'bg-purple-50 text-purple-600',
    offer: 'bg-amber-50 text-amber-600', hired: 'bg-emerald-50 text-emerald-600',
  }
  return colors[stage] || 'bg-gray-100 text-gray-600'
}

function getResultBadge(result: string | undefined, evaluation?: InterviewRecord['interviewer_evaluation']): { label: string; color: string } {
  const evalResult = evaluation?.result || result
  switch (evalResult) {
    case 'S': return { label: 'S - ぜひ採用したい', color: 'bg-emerald-100 text-emerald-700' }
    case 'A': return { label: 'A - 能力高い', color: 'bg-blue-100 text-blue-700' }
    case 'B': return { label: 'B - 次回選考で要確認', color: 'bg-amber-100 text-amber-700' }
    case 'C': return { label: 'C - 不合格', color: 'bg-red-100 text-red-700' }
    case 'pass': return { label: '合格', color: 'bg-emerald-100 text-emerald-700' }
    case 'fail': return { label: '不合格', color: 'bg-red-100 text-red-700' }
    case 'hold': return { label: '保留', color: 'bg-amber-100 text-amber-700' }
    default: return { label: '評価待ち', color: 'bg-gray-100 text-gray-500' }
  }
}

function mapEvalResultToDBResult(evalResult: string): string {
  switch (evalResult) {
    case 'S': return 'pass'
    case 'A': return 'pass'
    case 'B': return 'hold'
    case 'C': return 'fail'
    default: return 'pending'
  }
}

function createEmptyFormState(): InterviewFormState {
  return {
    stage: 'interview_1',
    interviewer_name: '',
    interviewer_role: '',
    interview_date: new Date().toISOString().split('T')[0],
    interview_text: '',
    evaluation_result: '',
    criteria: DEFAULT_CRITERIA.map(c => ({ ...c })),
    pass_reason: '',
    handoff_to_interviewer: '',
    handoff_to_hr: '',
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

function getSignalStrengthLabel(strength: string): string {
  return strength === 'high' ? '強' : strength === 'medium' ? '中' : '弱'
}

function getSignalStrengthColor(strength: string): string {
  return strength === 'high' ? 'bg-emerald-50 text-emerald-700'
    : strength === 'medium' ? 'bg-amber-50 text-amber-700'
    : 'bg-gray-100 text-gray-600'
}

// ============ Star Rating Component ============
function StarRating({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            className={`w-4 h-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          />
        </button>
      ))}
      <span className="text-xs text-gray-500 ml-1">{value}/{max}</span>
    </div>
  )
}

// ============ Temperature Slider Component ============
function TemperatureSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const getColor = (v: number) => {
    if (v <= 3) return 'text-blue-500'
    if (v <= 6) return 'text-amber-500'
    return 'text-red-500'
  }
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">低い</span>
        <span className={`text-sm font-bold ${getColor(value)}`}>{value}/10</span>
        <span className="text-xs text-gray-500">高い</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  )
}

export default function CandidateDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [candidate, setCandidate] = useState<CandidateData | null>(null)
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const searchParams = useSearchParams()

  // Read tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'interviews') setActiveTab('interviews')
    else if (tab === 'signals') setActiveTab('signals')
    else if (tab === 'card') setActiveTab('card')
  }, [searchParams])

  // Interview editing state
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set())
  const [editingForms, setEditingForms] = useState<Record<string, InterviewFormState>>({})
  const [savingInterviews, setSavingInterviews] = useState<Set<string>>(new Set())
  const [saveMessages, setSaveMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({})

  // New interview form
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormState, setNewFormState] = useState<InterviewFormState>(createEmptyFormState())
  const [savingNew, setSavingNew] = useState(false)

  // File upload
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const [candidateRes, interviewRes] = await Promise.all([
          fetch(`/api/candidates/${id}`),
          fetch(`/api/candidates/${id}/interviews`),
        ])
        const candidateData = await candidateRes.json()
        const interviewData = await interviewRes.json()

        if (candidateRes.ok && candidateData.candidate) {
          setCandidate(candidateData.candidate)
        } else {
          setError(candidateData.error || '候補者が見つかりません')
        }

        if (interviewRes.ok && interviewData.interviews) {
          setInterviews(interviewData.interviews)
        }
      } catch {
        setError('データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Toggle interview expand/collapse
  const toggleExpand = (interviewKey: string) => {
    setExpandedInterviews(prev => {
      const next = new Set(prev)
      if (next.has(interviewKey)) {
        next.delete(interviewKey)
      } else {
        next.add(interviewKey)
        // Initialize form state if not yet
        if (!editingForms[interviewKey]) {
          const iv = interviews.find(i => (i.id || i.stage) === interviewKey)
          if (iv) {
            setEditingForms(prev => ({ ...prev, [interviewKey]: interviewToFormState(iv) }))
          }
        }
      }
      return next
    })
  }

  // Update form field
  const updateForm = (key: string, field: keyof InterviewFormState, value: unknown) => {
    setEditingForms(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  // Update criterion
  const updateCriterion = (key: string, index: number, field: 'label' | 'score', value: string | number) => {
    setEditingForms(prev => {
      const form = { ...prev[key] }
      const criteria = [...form.criteria]
      criteria[index] = { ...criteria[index], [field]: value }
      return { ...prev, [key]: { ...form, criteria } }
    })
  }

  // Add criterion
  const addCriterion = (key: string) => {
    setEditingForms(prev => {
      const form = { ...prev[key] }
      return { ...prev, [key]: { ...form, criteria: [...form.criteria, { label: '', score: 3 }] } }
    })
  }

  // Remove criterion
  const removeCriterion = (key: string, index: number) => {
    setEditingForms(prev => {
      const form = { ...prev[key] }
      const criteria = form.criteria.filter((_, i) => i !== index)
      return { ...prev, [key]: { ...form, criteria } }
    })
  }

  // Save interview
  const saveInterview = async (interviewKey: string, formState: InterviewFormState) => {
    if (!candidate) return
    setSavingInterviews(prev => new Set(prev).add(interviewKey))
    setSaveMessages(prev => { const n = { ...prev }; delete n[interviewKey]; return n })

    try {
      const body = {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        candidate_id: id,
        job_id: candidate.job_id,
        stage: formState.stage,
        interviewer_name: formState.interviewer_name,
        interviewer_role: formState.interviewer_role,
        interview_date: formState.interview_date,
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok && data.interview) {
        // Refresh interviews
        const refreshRes = await fetch(`/api/candidates/${id}/interviews`)
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) {
          setInterviews(refreshData.interviews || [])
        }
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
        tenant_id: '00000000-0000-0000-0000-000000000001',
        candidate_id: id,
        job_id: candidate.job_id,
        stage: newFormState.stage,
        interviewer_name: newFormState.interviewer_name,
        interviewer_role: newFormState.interviewer_role,
        interview_date: newFormState.interview_date,
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok && data.interview) {
        const refreshRes = await fetch(`/api/candidates/${id}/interviews`)
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) {
          setInterviews(refreshData.interviews || [])
        }
        setShowNewForm(false)
        setNewFormState(createEmptyFormState())
      }
    } catch {
      // show error inline
    } finally {
      setSavingNew(false)
    }
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
        formData.append('tenant_id', '00000000-0000-0000-0000-000000000001')

        const res = await fetch(`/api/candidates/${id}/documents`, {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          // If it's a transcript file, update the interview_text field
          const ext = file.name.split('.').pop()?.toLowerCase()
          if (['txt', 'pdf', 'docx'].includes(ext || '')) {
            // Store file reference in interview_text
            const form = editingForms[interviewKey] || newFormState
            const currentText = form.interview_text
            const fileRef = `[添付ファイル: ${file.name}]`
            const updatedText = currentText ? `${currentText}\n${fileRef}` : fileRef

            if (interviewKey === '__new__') {
              setNewFormState(prev => ({ ...prev, interview_text: updatedText }))
            } else {
              updateForm(interviewKey, 'interview_text', updatedText)
            }
          }
        }
      }

      // Refresh candidate data to get updated documents
      const candidateRes = await fetch(`/api/candidates/${id}`)
      const candidateData = await candidateRes.json()
      if (candidateRes.ok && candidateData.candidate) {
        setCandidate(candidateData.candidate)
      }
    } catch {
      // silently handle
    } finally {
      setUploadingFiles(prev => { const n = new Set(prev); n.delete(interviewKey); return n })
    }
  }

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

  const currentStage = candidate.current_stage || candidate.status
  const isNewgrad = candidate.hiring_type === 'new_graduate' || candidate.hiring_type === 'newgrad'
  const completedInterviews = interviews.filter(i => i.result && i.result !== 'pending')
  const allSignals: any[] = [] // signals not loaded from interviews API

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '概要' },
    { id: 'interviews', label: `面接（${interviews.length}）` },
    { id: 'signals', label: 'シグナル' },
    { id: 'card', label: 'AIカルテ' },
  ]

  // ============ Render Interview Evaluation Form ============
  const renderEvaluationForm = (formKey: string, form: InterviewFormState, onUpdate: (field: keyof InterviewFormState, value: unknown) => void, isNew: boolean) => (
    <div className="space-y-5 mt-4">
      {/* Basic info (only for new) */}
      {isNew && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label mb-1 block">選考ステージ</label>
            <select
              value={form.stage}
              onChange={(e) => onUpdate('stage', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">面接日</label>
            <input
              type="date"
              value={form.interview_date}
              onChange={(e) => onUpdate('interview_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="label mb-1 block">面接官氏名</label>
            <input
              type="text"
              value={form.interviewer_name}
              onChange={(e) => onUpdate('interviewer_name', e.target.value)}
              placeholder="田中太郎"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="label mb-1 block">面接官役職</label>
            <input
              type="text"
              value={form.interviewer_role}
              onChange={(e) => onUpdate('interviewer_role', e.target.value)}
              placeholder="エンジニアリングマネージャー"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Overall Evaluation - S/A/B/C */}
      <div>
        <label className="label mb-2 block">総合評価</label>
        <div className="flex gap-2">
          {RESULT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onUpdate('evaluation_result', opt.value)}
              className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-center transition-all ${
                form.evaluation_result === opt.value
                  ? opt.color + ' border-current font-bold'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-lg font-bold block">{opt.label}</span>
              <span className="text-[10px] block mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div>
        <label className="label mb-2 block">評価項目</label>
        <div className="space-y-2">
          {form.criteria.map((criterion, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
              <input
                type="text"
                value={criterion.label}
                onChange={(e) => {
                  const criteria = [...form.criteria]
                  criteria[idx] = { ...criteria[idx], label: e.target.value }
                  onUpdate('criteria', criteria)
                }}
                placeholder="評価項目名"
                className="flex-1 bg-transparent border-0 text-sm focus:outline-none"
              />
              <StarRating
                value={criterion.score}
                onChange={(v) => {
                  const criteria = [...form.criteria]
                  criteria[idx] = { ...criteria[idx], score: v }
                  onUpdate('criteria', criteria)
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const criteria = form.criteria.filter((_, i) => i !== idx)
                  onUpdate('criteria', criteria)
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onUpdate('criteria', [...form.criteria, { label: '', score: 3 }])}
          className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          評価項目を追加
        </button>
      </div>

      {/* Pass/Fail Reason */}
      <div>
        <label className="label mb-1 block">合格理由 / 不合格理由</label>
        <p className="text-[10px] text-gray-400 mb-1">この内容が合格通知レターに反映されます</p>
        <textarea
          value={form.pass_reason}
          onChange={(e) => onUpdate('pass_reason', e.target.value)}
          placeholder="評価の根拠や理由を記述..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Handoff to Interviewer */}
      <div>
        <label className="label mb-1 block">次回面接官への申し送り</label>
        <p className="text-[10px] text-gray-400 mb-1">面接で話した内容、気になったポイント、次回面接で確認してほしいこと</p>
        <textarea
          value={form.handoff_to_interviewer}
          onChange={(e) => onUpdate('handoff_to_interviewer', e.target.value)}
          placeholder="次の面接官に伝えたい情報..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Handoff to HR */}
      <div>
        <label className="label mb-1 block">人事への申し送り</label>
        <textarea
          value={form.handoff_to_hr}
          onChange={(e) => onUpdate('handoff_to_hr', e.target.value)}
          placeholder="年収希望、入社時期、特記事項など..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Temperature Score */}
      <div>
        <label className="label mb-2 block">候補者の志望度</label>
        <TemperatureSlider
          value={form.temperature_score}
          onChange={(v) => onUpdate('temperature_score', v)}
        />
      </div>

      {/* Interview Text / Memo */}
      <div>
        <label className="label mb-1 block">面接メモ</label>
        <textarea
          value={form.interview_text}
          onChange={(e) => onUpdate('interview_text', e.target.value)}
          placeholder="面接中の気づきやメモ..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="label mb-2 block">録画・書き起こしアップロード</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.current[formKey]?.click()}
        >
          <input
            ref={el => { fileInputRefs.current[formKey] = el }}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(formKey, e.target.files)}
          />
          {uploadingFiles.has(formKey) ? (
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">アップロード中...</span>
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
                <span className={`badge ${getStageColor(currentStage || '')}`}>
                  {getStageLabel(currentStage || '')}
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

          {/* Action Buttons */}
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
                        { label: '電話番号', value: candidate.phone || '\u2014' },
                        { label: '大学・学部', value: `${candidate.university || ''} ${candidate.faculty || ''}`.trim() || '\u2014' },
                        { label: '卒業予定', value: candidate.graduation_year ? `${candidate.graduation_year}年3月` : '\u2014' },
                        { label: '流入元', value: candidate.source || '\u2014' },
                        { label: '登録日', value: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('ja-JP') : '\u2014' },
                        { label: 'ステータス', value: candidate.status || '\u2014' },
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
                        { label: '電話番号', value: candidate.phone || '\u2014' },
                        { label: '現職', value: candidate.current_title ? `${candidate.current_company || ''} / ${candidate.current_title}` : '\u2014' },
                        { label: '流入元', value: candidate.source || '\u2014' },
                        { label: '登録日', value: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('ja-JP') : '\u2014' },
                        { label: 'ステータス', value: candidate.status || '\u2014' },
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

              {/* Interview Summary */}
              <div className="card p-5">
                <h2 className="section-title mb-3">面接進捗サマリー</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStageColor(currentStage || '')}`}>
                      {getStageLabel(currentStage || '')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {completedInterviews.length}/{interviews.length} 完了
                    </span>
                  </div>
                </div>
                {interviews.length > 0 ? (
                  <div className="space-y-2">
                    {interviews.map((iv) => {
                      const badge = getResultBadge(iv.result, iv.interviewer_evaluation)
                      return (
                        <div key={iv.id || iv.stage} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-800">{getStageLabel(iv.stage)}</span>
                            {iv.interview_date && (
                              <span className="text-xs text-gray-400">{iv.interview_date}</span>
                            )}
                          </div>
                          <span className={`badge ${badge.color}`}>{badge.label}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">面接データはまだありません</p>
                )}
              </div>

              {/* Interview Evaluation CTA */}
              <div className="card p-5 border-l-4 border-l-indigo-500">
                {interviews.length === 0 || interviews.every(i => !i.result || i.result === 'pending') ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-sm font-bold text-gray-900">面接評価</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {interviews.length === 0
                        ? 'まだ評価が入力されていません。'
                        : '評価待ちの面接があります。'}
                      面接後に評価を入力することで、合格通知やシナリオの精度が向上します。
                    </p>
                    <button
                      onClick={() => setActiveTab('interviews')}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      面接評価を入力する
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-sm font-bold text-gray-900">最新の面接評価</h2>
                    </div>
                    {(() => {
                      const latestIv = [...interviews].reverse().find(i => i.result && i.result !== 'pending')
                      if (!latestIv) return null
                      const badge = getResultBadge(latestIv.result, latestIv.interviewer_evaluation)
                      return (
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 font-medium">{getStageLabel(latestIv.stage)}:</span>
                            <span className={`badge ${badge.color}`}>{badge.label}</span>
                            {latestIv.interview_date && (
                              <span className="text-xs text-gray-400">({latestIv.interview_date})</span>
                            )}
                          </div>
                          {latestIv.interviewer_name && (
                            <p className="text-xs text-gray-500">面接官: {latestIv.interviewer_name}</p>
                          )}
                        </div>
                      )
                    })()}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { setShowNewForm(true); setActiveTab('interviews') }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        次の選考を追加する
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveTab('interviews')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        評価詳細を見る
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

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
                            {doc.file_size || ''} {doc.uploaded_at ? `\u2014 ${new Date(doc.uploaded_at).toLocaleDateString('ja-JP')}` : ''}
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
          <div className="space-y-4 max-w-4xl">
            {interviews.length === 0 && !showNewForm ? (
              <div className="card p-8 text-center text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">面接データがありません</p>
              </div>
            ) : (
              interviews.map((interview) => {
                const key = interview.id || interview.stage
                const isExpanded = expandedInterviews.has(key)
                const form = editingForms[key]
                const badge = getResultBadge(interview.result, interview.interviewer_evaluation)
                const isSaving = savingInterviews.has(key)
                const saveMsg = saveMessages[key]

                return (
                  <div key={key} className="card overflow-hidden">
                    {/* Stage Header */}
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          interview.result === 'pass' ? 'bg-emerald-500' :
                          interview.result === 'fail' ? 'bg-red-500' :
                          interview.result === 'hold' ? 'bg-amber-500' :
                          'bg-gray-300'
                        }`} />
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {getStageLabel(interview.stage)}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {interview.interview_date || '日程未定'}
                            {interview.interviewer_name && ` / ${interview.interviewer_name}`}
                            {interview.interviewer_role && ` (${interview.interviewer_role})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${badge.color}`}>{badge.label}</span>
                        {interview.temperature_score && (
                          <span className="text-xs text-gray-400">志望度: {interview.temperature_score}/10</span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && form && (
                      <div className="border-t border-gray-100 p-5">
                        {/* Interviewer Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="label mb-1 block">面接官氏名</label>
                            <input
                              type="text"
                              value={form.interviewer_name}
                              onChange={(e) => updateForm(key, 'interviewer_name', e.target.value)}
                              placeholder="面接官名"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="label mb-1 block">面接官役職</label>
                            <input
                              type="text"
                              value={form.interviewer_role}
                              onChange={(e) => updateForm(key, 'interviewer_role', e.target.value)}
                              placeholder="役職"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="label mb-1 block">面接日</label>
                            <input
                              type="date"
                              value={form.interview_date}
                              onChange={(e) => updateForm(key, 'interview_date', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Evaluation Form */}
                        {renderEvaluationForm(
                          key,
                          form,
                          (field, value) => updateForm(key, field, value),
                          false
                        )}

                        {/* Save Button */}
                        <div className="mt-5 flex items-center gap-3">
                          <button
                            onClick={() => saveInterview(key, form)}
                            disabled={isSaving}
                            className="btn-primary flex items-center gap-2"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {isSaving ? '保存中...' : '保存する'}
                          </button>
                          {saveMsg && (
                            <span className={`text-sm ${saveMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                              {saveMsg.text}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* New Interview Form */}
            {showNewForm && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-500" />
                    新しい選考を追加
                  </h3>
                  <button
                    onClick={() => { setShowNewForm(false); setNewFormState(createEmptyFormState()) }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {renderEvaluationForm(
                  '__new__',
                  newFormState,
                  (field, value) => setNewFormState(prev => ({ ...prev, [field]: value })),
                  true
                )}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={saveNewInterview}
                    disabled={savingNew}
                    className="btn-primary flex items-center gap-2"
                  >
                    {savingNew ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingNew ? '保存中...' : '保存する'}
                  </button>
                  <button
                    onClick={() => { setShowNewForm(false); setNewFormState(createEmptyFormState()) }}
                    className="btn-secondary"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {/* Add New Interview Button */}
            {!showNewForm && (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新しい選考を追加
              </button>
            )}
          </div>
        )}

        {/* ======================== SIGNALS TAB ======================== */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="card p-8 text-center text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">シグナルデータがありません</p>
              <p className="text-xs mt-1">面接後にシグナル入力を行うと、ここに表示されます</p>
            </div>
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
