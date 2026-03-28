'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  BarChart3, Upload, Save, Sparkles, CheckCircle2, Plus, X, Loader2,
  Eye, Star, MessageSquare, BookOpen, TrendingUp, Clock, History,
  FileText, Target, Users, Briefcase, Award, Building2, Heart,
  Lightbulb, Shield, ChevronDown, ChevronUp, RefreshCw, Calendar,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const REVP_CATEGORIES = [
  { key: 'philosophy', label: '理念・ビジョン', color: 'bg-blue-500', hex: '#3b82f6', icon: Lightbulb, description: '企業の存在意義、社会的使命、将来の方向性' },
  { key: 'work_content', label: '仕事内容・やりがい', color: 'bg-indigo-500', hex: '#6366f1', icon: Briefcase, description: '業務の面白さ、成長実感、社会貢献' },
  { key: 'organization', label: '組織・チーム', color: 'bg-purple-500', hex: '#a855f7', icon: Users, description: 'チームの雰囲気、多様性、協力体制' },
  { key: 'growth', label: '成長・キャリア', color: 'bg-emerald-500', hex: '#10b981', icon: TrendingUp, description: 'スキルアップ、キャリアパス、研修制度' },
  { key: 'work_style', label: '働き方・環境', color: 'bg-amber-500', hex: '#f59e0b', icon: Building2, description: 'リモート、フレックス、オフィス環境' },
  { key: 'compensation', label: '報酬・福利厚生', color: 'bg-rose-500', hex: '#f43f5e', icon: Award, description: '給与水準、評価制度、福利厚生' },
  { key: 'brand', label: '企業ブランド・知名度', color: 'bg-cyan-500', hex: '#06b6d4', icon: Shield, description: '業界でのポジション、社会的評価' },
  { key: 'people', label: '人・カルチャー', color: 'bg-orange-500', hex: '#f97316', icon: Heart, description: '社風、人間関係、ロールモデル' },
]

// Recruitment journey stages with sample conversion data
const JOURNEY_STAGES = [
  { key: 'awareness', label: '認知', shortLabel: '認知', count: 1000 },
  { key: 'application', label: '応募', shortLabel: '応募', count: 320 },
  { key: 'document', label: '書類', shortLabel: '書類', count: 180 },
  { key: 'first_interview', label: '一次', shortLabel: '一次', count: 90 },
  { key: 'second_interview', label: '二次', shortLabel: '二次', count: 50 },
  { key: 'final_interview', label: '最終', shortLabel: '最終', count: 28 },
  { key: 'offer', label: '内定', shortLabel: '内定', count: 18 },
  { key: 'acceptance', label: '承諾', shortLabel: '承諾', count: 12 },
]

interface RevpHistoryEntry {
  date: string
  summary: string
  scores: Record<string, number>
}

interface RevpData {
  scores: Record<string, number>
  strengths: string[]
  messages: string[]
  episodes: string[]
  raw_text?: string
  pdf_url?: string
  updated_at?: string
  revp_history?: RevpHistoryEntry[]
}

// --- Radar Chart Component (SVG) ---
function RadarChart({ scores, size = 320 }: { scores: Record<string, number>; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 40
  const levels = 5
  const count = REVP_CATEGORIES.length
  const angleSlice = (Math.PI * 2) / count

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2
    const r = (value / 100) * radius
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1)
    const points = REVP_CATEGORIES.map((_, idx) => {
      const angle = angleSlice * idx - Math.PI / 2
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(' ')
    return points
  })

  const dataPoints = REVP_CATEGORIES.map((cat, i) => getPoint(i, scores[cat.key] || 0))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Grid levels */}
      {gridLevels.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          opacity={0.6}
        />
      ))}
      {/* Axis lines */}
      {REVP_CATEGORIES.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(angle)}
            y2={cy + radius * Math.sin(angle)}
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity={0.5}
          />
        )
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="url(#radarFill)" stroke="#6366f1" strokeWidth="2.5" filter="url(#glow)" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={REVP_CATEGORIES[i].hex} stroke="white" strokeWidth="2" />
        </g>
      ))}
      {/* Labels */}
      {REVP_CATEGORIES.map((cat, i) => {
        const angle = angleSlice * i - Math.PI / 2
        const labelR = radius + 26
        const x = cx + labelR * Math.cos(angle)
        const y = cy + labelR * Math.sin(angle)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={cat.hex}
            fontSize="10"
            fontWeight="600"
          >
            {cat.label.length > 6 ? cat.label.slice(0, 6) + '...' : cat.label}
          </text>
        )
      })}
      {/* Level labels */}
      {Array.from({ length: levels }, (_, i) => {
        const val = ((i + 1) * 100) / levels
        const r = (radius / levels) * (i + 1)
        return (
          <text key={i} x={cx + 4} y={cy - r - 2} fill="#9ca3af" fontSize="8" textAnchor="start">
            {val}
          </text>
        )
      })}
    </svg>
  )
}

// --- Journey Line Chart Component (SVG) ---
function JourneyLineChart({ stages }: { stages: typeof JOURNEY_STAGES }) {
  const width = 700
  const height = 280
  const padding = { top: 40, right: 40, bottom: 60, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxCount = Math.max(...stages.map(s => s.count))
  const points = stages.map((s, i) => ({
    x: padding.left + (chartW / (stages.length - 1)) * i,
    y: padding.top + chartH - (s.count / maxCount) * chartH,
    ...s,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = linePath + ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = padding.top + chartH - frac * chartH
        const val = Math.round(frac * maxCount)
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">{val}</text>
          </g>
        )
      })}
      {/* Area fill */}
      <path d={areaPath} fill="url(#lineGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points & labels */}
      {points.map((p, i) => {
        const rate = i > 0 ? Math.round((p.count / stages[i - 1].count) * 100) : 100
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="#6366f1" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="3" fill="#6366f1" />
            {/* Count */}
            <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#1f2937" fontSize="11" fontWeight="700">{p.count}</text>
            {/* Conversion rate */}
            {i > 0 && (
              <text x={p.x} y={p.y - 26} textAnchor="middle" fill={rate >= 50 ? '#10b981' : rate >= 30 ? '#f59e0b' : '#ef4444'} fontSize="9" fontWeight="600">
                {rate}%
              </text>
            )}
            {/* Stage label */}
            <text x={p.x} y={padding.top + chartH + 20} textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="500">{p.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// --- Score Card Component ---
function ScoreCard({ cat, score, onScoreChange }: {
  cat: typeof REVP_CATEGORIES[0]
  score: number
  onScoreChange: (val: number) => void
}) {
  const Icon = cat.icon
  const getScoreLabel = (s: number) => {
    if (s >= 80) return { text: '優秀', textColor: 'text-emerald-600' }
    if (s >= 60) return { text: '良好', textColor: 'text-blue-600' }
    if (s >= 40) return { text: '普通', textColor: 'text-amber-600' }
    return { text: '要改善', textColor: 'text-rose-600' }
  }
  const sl = getScoreLabel(score)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${cat.color} bg-opacity-15 flex items-center justify-center`}>
          <Icon className="w-4.5 h-4.5" style={{ color: cat.hex }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{cat.label}</p>
          <p className="text-[10px] text-gray-400 truncate">{cat.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: cat.hex }}>{score}</p>
          <p className={`text-[10px] font-medium ${sl.textColor}`}>{sl.text}</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: cat.hex }}
        />
      </div>
      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={score}
        onChange={e => onScoreChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  )
}

// --- Collapsible Section ---
function CollapsibleSection({ title, subtitle, icon: IconComp, iconColor, children, defaultOpen = true }: {
  title: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-lg bg-opacity-15 flex items-center justify-center`} style={{ backgroundColor: iconColor + '20' }}>
          <IconComp className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  )
}

// --- Raw Text Modal ---
function RawTextModal({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">REVPの詳細結果</h3>
              <p className="text-xs text-gray-400">アップロードされた診断結果の全文</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">{text}</pre>
        </div>
      </div>
    </div>
  )
}

// --- History Panel ---
function HistoryPanel({ history, onClose }: { history: RevpHistoryEntry[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">REVP更新履歴</h3>
              <p className="text-xs text-gray-400">過去の診断結果の履歴</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">まだ更新履歴がありません</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(entry.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{entry.summary || '手動更新'}</p>
                  {/* Mini score bar */}
                  <div className="flex gap-1">
                    {REVP_CATEGORIES.map(cat => {
                      const s = entry.scores?.[cat.key] || 0
                      return (
                        <div key={cat.key} className="flex-1">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" title={`${cat.label}: ${s}`}>
                            <div className="h-full rounded-full" style={{ width: `${s}%`, backgroundColor: cat.hex }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ======= MAIN PAGE =======

export default function RevpReportPage() {
  const [data, setData] = useState<RevpData>({
    scores: {},
    strengths: [],
    messages: [],
    episodes: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showRawText, setShowRawText] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateFileInputRef = useRef<HTMLInputElement>(null)

  // Computed average score
  const avgScore = useMemo(() => {
    const vals = REVP_CATEGORIES.map(c => data.scores[c.key] || 0)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [data.scores])

  // Fetch existing REVP data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/company-profile?tenant_id=${TENANT_ID}`)
        const json = await res.json()
        const revp = json.profile?.metadata?.revp_data || json.profile?.revp_data
        if (revp) {
          setData(revp)
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const updateScore = (key: string, value: number) => {
    setData(prev => ({
      ...prev,
      scores: { ...prev.scores, [key]: value }
    }))
  }

  const addItem = (field: 'strengths' | 'messages' | 'episodes') => {
    setData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const updateItem = (field: 'strengths' | 'messages' | 'episodes', index: number, value: string) => {
    setData(prev => {
      const arr = [...prev[field]]
      arr[index] = value
      return { ...prev, [field]: arr }
    })
  }

  const removeItem = (field: 'strengths' | 'messages' | 'episodes', index: number) => {
    setData(prev => {
      const arr = [...prev[field]]
      arr.splice(index, 1)
      return { ...prev, [field]: arr }
    })
  }

  // Upload / re-upload diagnosis file (PDF/text) and extract with AI
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isUpdate = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const res = await fetch('/api/revp-analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const json = await res.json()
      if (!res.ok) {
        console.error('REVP analyze error:', json)
        alert(`解析エラー: ${json.error || '不明なエラー'}`)
        return
      }
      if (json.revp_data) {
        setData(prev => {
          // If this is an update, push old data to history
          const historyEntry: RevpHistoryEntry = {
            date: prev.updated_at || new Date().toISOString(),
            summary: isUpdate ? '更新前のデータ' : '初回アップロード',
            scores: { ...prev.scores },
          }
          const existingHistory = prev.revp_history || []
          const newHistory = isUpdate && Object.keys(prev.scores).length > 0
            ? [historyEntry, ...existingHistory]
            : existingHistory

          return {
            ...prev,
            ...json.revp_data,
            raw_text: json.raw_text || prev.raw_text,
            pdf_url: json.pdf_url || prev.pdf_url,
            revp_history: newHistory,
          }
        })
        alert(isUpdate
          ? '更新データを読み込みました。内容を確認して「保存」を押してください。'
          : '診断結果を読み込みました。内容を確認して「保存」を押してください。'
        )
      }
    } catch (err) {
      console.error('REVP upload error:', err)
      if (err instanceof DOMException && err.name === 'AbortError') {
        alert('AI解析がタイムアウトしました。ファイルサイズが大きすぎる可能性があります。')
      } else {
        alert('ファイルの解析に失敗しました。もう一度お試しください。')
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (updateFileInputRef.current) updateFileInputRef.current.value = ''
    }
  }

  // Save REVP data
  const handleSave = async () => {
    setSaving(true)
    try {
      const saveData = { ...data, updated_at: new Date().toISOString() }
      await fetch('/api/company-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          revp_data: saveData,
        }),
      })
      setData(saveData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">REVP診断データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={e => handleFileUpload(e, false)} className="hidden" />
      <input ref={updateFileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={e => handleFileUpload(e, true)} className="hidden" />

      {/* ====== HEADER ====== */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">REVP診断レポート</h1>
            </div>
            <p className="text-indigo-200 text-sm leading-relaxed">
              採用における自社の魅力（Recruitment Employee Value Proposition）を可視化し、候補者へのメッセージに反映します
            </p>
            {/* Last updated */}
            {data.updated_at && (
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-xs text-indigo-200">
                  最終更新日: {new Date(data.updated_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* View full REVP results */}
            {data.raw_text && (
              <button
                onClick={() => setShowRawText(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
              >
                <Eye className="w-4 h-4" />
                REVPの詳細結果を見る
              </button>
            )}
            {/* History */}
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
            >
              <History className="w-4 h-4" />
              履歴
              {(data.revp_history?.length || 0) > 0 && (
                <span className="ml-1 bg-white/30 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{data.revp_history?.length}</span>
              )}
            </button>
            {/* Update upload */}
            <button
              onClick={() => updateFileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              更新アップロード
            </button>
            {/* First upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm border border-white/20"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? '解析中...' : '診断結果をアップロード'}
            </button>
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? '保存しました' : saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
        {/* Summary stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-indigo-200">総合スコア</p>
            <p className="text-2xl font-bold mt-1">{avgScore}<span className="text-sm font-normal text-indigo-300">/100</span></p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-indigo-200">強みの数</p>
            <p className="text-2xl font-bold mt-1">{data.strengths.filter(s => s.trim()).length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-indigo-200">メッセージ数</p>
            <p className="text-2xl font-bold mt-1">{data.messages.filter(m => m.trim()).length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-indigo-200">エピソード数</p>
            <p className="text-2xl font-bold mt-1">{data.episodes.filter(e => e.trim()).length}</p>
          </div>
        </div>
      </div>

      {/* ====== RADAR CHART + SCORE CARDS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">魅力レーダーチャート</h2>
          </div>
          <div className="flex justify-center">
            <RadarChart scores={data.scores} size={320} />
          </div>
        </div>
        {/* Score Cards Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">カテゴリースコア</h2>
            <span className="text-xs text-gray-400 ml-2">ホバーしてスライダーで調整</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REVP_CATEGORIES.map(cat => (
              <ScoreCard
                key={cat.key}
                cat={cat}
                score={data.scores[cat.key] || 0}
                onScoreChange={val => updateScore(cat.key, val)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ====== RECRUITMENT JOURNEY LINE CHART ====== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-gray-900">採用成功ジャーニー</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">認知から承諾までの各ステージにおける通過人数と転換率（サンプルデータ）</p>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <JourneyLineChart stages={JOURNEY_STAGES} />
          </div>
        </div>
        {/* Stage conversion summary */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
          {JOURNEY_STAGES.map((s, i) => {
            const rate = i > 0 ? Math.round((s.count / JOURNEY_STAGES[i - 1].count) * 100) : 100
            return (
              <div key={s.key} className="text-center p-2 rounded-lg bg-gray-50">
                <p className="text-[10px] text-gray-400">{s.label}</p>
                <p className="text-sm font-bold text-gray-800">{s.count}</p>
                {i > 0 && (
                  <p className={`text-[10px] font-semibold ${rate >= 50 ? 'text-emerald-600' : rate >= 30 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {rate}%
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ====== STRENGTHS ====== */}
      <CollapsibleSection
        title="自社の強み・差別化ポイント"
        subtitle="AIが候補者向けメッセージを作成する際に参照します"
        icon={Star}
        iconColor="#f59e0b"
      >
        <div className="pt-4 space-y-3">
          {data.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[10px] font-bold text-amber-600">{i + 1}</span>
              </div>
              <textarea
                value={s}
                onChange={e => updateItem('strengths', i, e.target.value)}
                rows={2}
                className="input flex-1 text-sm"
                placeholder="例：業界トップクラスの技術力と、フラットな組織文化"
              />
              <button onClick={() => removeItem('strengths', i)} className="text-gray-300 hover:text-red-500 mt-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.strengths.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">まだ登録されていません。「追加」ボタンから入力してください。</p>
          )}
          <button onClick={() => addItem('strengths')} className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium mt-2 transition-colors">
            <Plus className="w-3.5 h-3.5" /> 強みを追加
          </button>
        </div>
      </CollapsibleSection>

      {/* ====== MESSAGES ====== */}
      <CollapsibleSection
        title="候補者への重要メッセージ"
        subtitle="採用コミュニケーションで必ず伝えたいメッセージ"
        icon={MessageSquare}
        iconColor="#6366f1"
      >
        <div className="pt-4 space-y-3">
          {data.messages.map((m, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[10px] font-bold text-indigo-600">{i + 1}</span>
              </div>
              <textarea
                value={m}
                onChange={e => updateItem('messages', i, e.target.value)}
                rows={2}
                className="input flex-1 text-sm"
                placeholder="例：私たちは「人が育つ会社」を目指しています"
              />
              <button onClick={() => removeItem('messages', i)} className="text-gray-300 hover:text-red-500 mt-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.messages.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">まだ登録されていません。「追加」ボタンから入力してください。</p>
          )}
          <button onClick={() => addItem('messages')} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 transition-colors">
            <Plus className="w-3.5 h-3.5" /> メッセージを追加
          </button>
        </div>
      </CollapsibleSection>

      {/* ====== EPISODES ====== */}
      <CollapsibleSection
        title="魅力を伝えるエピソード"
        subtitle="具体的なストーリーがあると候補者の共感を得やすくなります"
        icon={BookOpen}
        iconColor="#a855f7"
      >
        <div className="pt-4 space-y-3">
          {data.episodes.map((ep, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[10px] font-bold text-purple-600">{i + 1}</span>
              </div>
              <textarea
                value={ep}
                onChange={e => updateItem('episodes', i, e.target.value)}
                rows={3}
                className="input flex-1 text-sm"
                placeholder="例：入社2年目のエンジニアが自主提案した新機能が全社MVPに選ばれた"
              />
              <button onClick={() => removeItem('episodes', i)} className="text-gray-300 hover:text-red-500 mt-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.episodes.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">まだ登録されていません。「追加」ボタンから入力してください。</p>
          )}
          <button onClick={() => addItem('episodes')} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium mt-2 transition-colors">
            <Plus className="w-3.5 h-3.5" /> エピソードを追加
          </button>
        </div>
      </CollapsibleSection>

      {/* ====== AI NOTE ====== */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">AIへの自動反映</p>
            <p className="text-xs text-indigo-600 leading-relaxed mt-1">
              ここで設定したREVP情報は、パーソナルオファー・惹きつけ戦略・合格通知レター・次回面接シナリオの各AI生成機能に自動で反映されます。
              情報が充実するほど、候補者に刺さるメッセージが生成されます。
            </p>
          </div>
        </div>
      </div>

      {/* ====== MODALS ====== */}
      {showRawText && data.raw_text && (
        <RawTextModal text={data.raw_text} onClose={() => setShowRawText(false)} />
      )}
      {showHistory && (
        <HistoryPanel history={data.revp_history || []} onClose={() => setShowHistory(false)} />
      )}
    </div>
  )
}
