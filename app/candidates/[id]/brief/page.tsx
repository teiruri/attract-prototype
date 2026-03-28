'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Sparkles, Loader2, Copy, CheckCircle2, FileText,
  MessageSquare, Clock, User, ChevronDown, ChevronRight,
  Briefcase, GraduationCap, Building2, HelpCircle,
} from 'lucide-react'

// ─── Stage labels (duplicated from parent page for self-containment) ─────────
const STAGE_LABELS: Record<string, string> = {
  recruiter: 'リクルーター面談', casual: 'カジュアル面談',
  interview_1: '一次面接', interview_2: '二次面接',
  interview_3: '三次面接', interview_final: '最終面接',
  final: '最終面接', offer: 'オファー面談', hired: '内定承諾',
  briefing: '説明会', es: 'ES選考', aptitude: '適性検査',
  gd: 'グループディスカッション', presentation: 'プレゼン選考',
  trial: '体験入社・ワークサンプル', active: '選考中',
}

// ─── Section icon mapping ────────────────────────────────────────────────────
function getSectionIcon(title: string) {
  if (/面接|質問|深掘|問い/.test(title)) return MessageSquare
  if (/時間|進行|タイムライン|配分|フェーズ/.test(title)) return Clock
  if (/候補者|経歴|プロフィール|人物/.test(title)) return User
  if (/企業|魅力|REVP|アピール|訴求/.test(title)) return Sparkles
  if (/フォローアップ|確認|まとめ|クロージング|次のステップ/.test(title)) return CheckCircle2
  return FileText
}

// ─── Section border color mapping ────────────────────────────────────────────
function getSectionColor(title: string): string {
  if (/面接|質問|深掘|問い/.test(title)) return 'border-l-blue-500'
  if (/時間|進行|タイムライン|配分|フェーズ/.test(title)) return 'border-l-amber-500'
  if (/候補者|経歴|プロフィール|人物/.test(title)) return 'border-l-violet-500'
  if (/企業|魅力|REVP|アピール|訴求/.test(title)) return 'border-l-emerald-500'
  if (/フォローアップ|確認|まとめ|クロージング|次のステップ/.test(title)) return 'border-l-rose-500'
  return 'border-l-gray-400'
}

// ─── Section icon bg color ───────────────────────────────────────────────────
function getSectionIconBg(title: string): string {
  if (/面接|質問|深掘|問い/.test(title)) return 'bg-blue-50 text-blue-600'
  if (/時間|進行|タイムライン|配分|フェーズ/.test(title)) return 'bg-amber-50 text-amber-600'
  if (/候補者|経歴|プロフィール|人物/.test(title)) return 'bg-violet-50 text-violet-600'
  if (/企業|魅力|REVP|アピール|訴求/.test(title)) return 'bg-emerald-50 text-emerald-600'
  if (/フォローアップ|確認|まとめ|クロージング|次のステップ/.test(title)) return 'bg-rose-50 text-rose-600'
  return 'bg-gray-50 text-gray-500'
}

// ─── Types ───────────────────────────────────────────────────────────────────
type ParsedLine =
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; num: string; text: string }
  | { type: 'question'; text: string }
  | { type: 'paragraph'; text: string }

interface ParsedSection {
  title: string
  lines: ParsedLine[]
}

// ─── Parse AI output into structured sections ────────────────────────────────
function parseResult(text: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  let current: ParsedSection | null = null

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    // Detect 【...】 section header
    const headerMatch = line.match(/^【(.+?)】(.*)$/)
    if (headerMatch) {
      current = { title: headerMatch[1], lines: [] }
      sections.push(current)
      // If there's text after the header on the same line, add it
      const trailing = headerMatch[2]?.trim()
      if (trailing) {
        current.lines.push({ type: 'paragraph', text: trailing })
      }
      continue
    }

    // If no section yet, create an implicit one
    if (!current) {
      current = { title: '', lines: [] }
      sections.push(current)
    }

    // Detect bullet items (・ or - )
    if (/^[・\-]\s*/.test(line)) {
      const bulletText = line.replace(/^[・\-]\s*/, '')
      // Check if the bullet is a question
      if (/？$|？」$|\?$/.test(bulletText)) {
        current.lines.push({ type: 'question', text: bulletText })
      } else {
        current.lines.push({ type: 'bullet', text: bulletText })
      }
      continue
    }

    // Detect numbered items (1. 2. etc)
    const numMatch = line.match(/^(\d+)[.．]\s*(.+)$/)
    if (numMatch) {
      const numText = numMatch[2]
      if (/？$|？」$|\?$/.test(numText)) {
        current.lines.push({ type: 'question', text: numText })
      } else {
        current.lines.push({ type: 'numbered', num: numMatch[1], text: numText })
      }
      continue
    }

    // Question detection for plain lines ending with ？
    if (/？$|？」$|\?$/.test(line)) {
      current.lines.push({ type: 'question', text: line })
      continue
    }

    // Default: paragraph
    current.lines.push({ type: 'paragraph', text: line })
  }

  return sections
}

// ─── Inline formatting: bold (**text** or text between 「」), time badges ────
function renderInlineText(text: string) {
  // Match time allocations like (5分), （10分）, 【5分】 etc
  const parts: (string | JSX.Element)[] = []
  // Pattern: **bold**, time expressions like (XX分), 「quoted」
  const regex = /(\*\*(.+?)\*\*|[（(](\d+[~〜～]?\d*分)[)）])/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      // Bold text
      parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[2]}</strong>)
    } else if (match[3]) {
      // Time badge
      parts.push(
        <span key={match.index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium mx-0.5">
          <Clock className="w-3 h-3" />
          {match[3]}
        </span>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length > 0 ? parts : text
}

// ─── Section Card component ─────────────────────────────────────────────────
function SectionCard({ section, defaultOpen = true }: { section: ParsedSection; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = getSectionIcon(section.title)
  const borderColor = getSectionColor(section.title)
  const iconBg = getSectionIconBg(section.title)

  // Untitled section (text before first 【】)
  if (!section.title) {
    return (
      <div className="mb-4">
        {section.lines.map((line, i) => (
          <LineRenderer key={i} line={line} />
        ))}
      </div>
    )
  }

  return (
    <div className={`mb-4 bg-white rounded-lg border border-gray-200 border-l-4 ${borderColor} shadow-sm overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="flex-1 font-bold text-gray-900 text-base">{section.title}</h3>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 space-y-1.5">
          {section.lines.map((line, i) => (
            <LineRenderer key={i} line={line} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Line renderer ───────────────────────────────────────────────────────────
function LineRenderer({ line }: { line: ParsedLine }) {
  switch (line.type) {
    case 'bullet':
      return (
        <div className="flex items-start gap-2.5 py-1 pl-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 leading-relaxed">{renderInlineText(line.text)}</span>
        </div>
      )
    case 'numbered':
      return (
        <div className="flex items-start gap-2.5 py-1 pl-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
            {line.num}
          </span>
          <span className="text-sm text-gray-700 leading-relaxed">{renderInlineText(line.text)}</span>
        </div>
      )
    case 'question':
      return (
        <div className="flex items-start gap-2.5 py-1.5 pl-3 ml-2 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-lg my-1">
          <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-blue-900 leading-relaxed font-medium">{renderInlineText(line.text)}</span>
        </div>
      )
    case 'paragraph':
    default:
      return (
        <p className="text-sm text-gray-700 leading-relaxed py-0.5 pl-2">{renderInlineText(line.text)}</p>
      )
  }
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function BriefPage() {
  const params = useParams()
  const id = params.id as string
  const [candidate, setCandidate] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [revp, setRevp] = useState<any>(null)
  const [interviews, setInterviews] = useState<any[]>([])
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidateRes, jobsRes, profileRes, interviewRes] = await Promise.all([
          fetch(`/api/candidates/${id}`),
          fetch(`/api/jobs?tenant_id=00000000-0000-0000-0000-000000000001`),
          fetch(`/api/company-profile?tenant_id=00000000-0000-0000-0000-000000000001`),
          fetch(`/api/candidates/${id}/interviews`),
        ])
        const candidateData = await candidateRes.json()
        setCandidate(candidateData.candidate)
        const jobsData = await jobsRes.json()
        setJob((jobsData.jobs || []).find((j: any) => j.id === candidateData.candidate?.job_id) || null)
        const profileData = await profileRes.json()
        setRevp(profileData.profile?.revp_data || null)
        const interviewData = await interviewRes.json()
        setInterviews(interviewData.interviews || [])
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const handleGenerate = async () => {
    if (!candidate) return
    setGenerating(true)
    setError('')
    setResult('')
    try {
      const res = await fetch(`/api/candidates/${id}/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, job, revp, interviews }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `生成に失敗しました (${res.status})`)
        setGenerating(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { setError('ストリームの取得に失敗しました'); setGenerating(false); return }

      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setResult(accumulated)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('AI生成がタイムアウトしました。しばらく待ってから再度お試しください。')
      } else {
        setError('生成中にエラーが発生しました。しばらく待ってから再度お試しください。')
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse result into sections (memoized, updates as text streams in)
  const parsedSections = useMemo(() => parseResult(result), [result])

  // Determine next stage label
  const currentStage = candidate?.current_stage || candidate?.status || ''
  const stageLabel = STAGE_LABELS[currentStage] || currentStage || '選考中'

  // Data source stats
  const documentCount = candidate?.documents?.length || 0
  const interviewCount = interviews.length
  const hasRevp = !!revp

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <Link href={`/candidates/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          候補者詳細に戻る
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">面接準備シート</h1>
                <p className="text-xs text-gray-500 mt-0.5">AIが候補者データをもとに面接準備シートを自動生成します</p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate summary bar */}
        {candidate && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">{candidate.full_name}</span>
            </div>
            {job && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{job.title}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-indigo-700">{stageLabel}</span>
            </div>
            {candidate.hiring_type && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                {candidate.hiring_type === 'new_graduate'
                  ? <><GraduationCap className="w-3 h-3" /> 新卒</>
                  : <><Building2 className="w-3 h-3" /> 中途</>
                }
              </span>
            )}
          </div>
        )}

        {/* Data sources */}
        {candidate && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>データソース:</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              書類 {documentCount}件
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              面接記録 {interviewCount}件
            </span>
            <span className={`flex items-center gap-1 ${hasRevp ? 'text-emerald-500' : ''}`}>
              <Sparkles className="w-3 h-3" />
              企業魅力情報 {hasRevp ? '有' : '無'}
            </span>
          </div>
        )}
      </div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="p-8 max-w-4xl mx-auto">

        {/* Generate button (before generation) */}
        {!result && !generating && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">面接準備シートを生成</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              候補者情報・過去の面接記録・企業魅力情報をもとに、次回面接のシナリオと質問案をAIが作成します。
            </p>
            <button
              onClick={handleGenerate}
              disabled={!candidate}
              className="btn-primary text-base px-8 py-3 flex items-center gap-3 mx-auto shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-shadow"
            >
              <Sparkles className="w-5 h-5" />
              面接準備シートを作成
            </button>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        )}

        {/* Result area */}
        {(result || generating) && (
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {generating && (
                  <span className="flex items-center gap-1.5 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    生成中...
                  </span>
                )}
                {!generating && result && (
                  <span className="text-xs text-gray-400">
                    {parsedSections.filter(s => s.title).length} セクション
                  </span>
                )}
              </div>
              {!generating && result && (
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} className="btn-secondary text-xs">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'コピー済み' : 'テキストをコピー'}
                  </button>
                  <button onClick={() => { setResult(''); handleGenerate() }} className="btn-secondary text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    再生成
                  </button>
                </div>
              )}
            </div>

            {/* Parsed sections */}
            <div ref={resultRef}>
              {parsedSections.map((section, i) => (
                <SectionCard key={i} section={section} defaultOpen={true} />
              ))}
              {generating && (
                <div className="flex items-center gap-2 px-5 py-3">
                  <span className="inline-block w-1.5 h-5 bg-indigo-400 animate-pulse rounded-sm" />
                </div>
              )}
            </div>

            {/* Footer */}
            {!generating && result && (
              <div className="mt-6 px-5 py-3 rounded-lg bg-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  この面接準備シートはAIが候補者情報・面接記録・企業魅力情報をもとに自動生成しました。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
