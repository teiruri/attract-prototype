'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
  ChevronDown,
  X,
  Sparkles,
  Star,
  UserCheck,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string
  hiring_type: string
  status: string
  source: string
  job_id: string
  university?: string
  faculty?: string
  current_company?: string
  current_title?: string
  created_at: string
  interviews?: { id: string; stage: string; result: string }[]
}

interface MatchEmployee {
  id: string
  name: string
  department: string
  role: string
  title: string
  years_at_company: number
  skills: string[]
  personality_tags: string[]
  interview_style: string
  bio: string
  available_for: string[]
}

interface MatchResult {
  employee: MatchEmployee
  score: number
  reasons: string[]
  recommended_role: string
  recommended_reason: string
}

const STATUS_FILTERS = [
  { value: 'all', label: '全て' },
  { value: 'active', label: '選考中' },
  { value: 'offer', label: '内定' },
  { value: 'rejected', label: '不合格' },
  { value: 'withdrawn', label: '辞退' },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: '選考中', color: 'bg-blue-100 text-blue-700' },
  screening: { label: 'スクリーニング', color: 'bg-cyan-100 text-cyan-700' },
  interview: { label: '面接中', color: 'bg-indigo-100 text-indigo-700' },
  offer: { label: '内定', color: 'bg-green-100 text-green-700' },
  accepted: { label: '内定承諾', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: '不合格', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: '辞退', color: 'bg-gray-100 text-gray-600' },
}

const hiringTypeLabels: Record<string, string> = {
  new_graduate: '新卒',
  mid_career: '中途',
  contract: '契約',
  intern: 'インターン',
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-gray-600 bg-gray-50 border-gray-200'
}

function getScoreBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-gray-400'
}

export default function CandidateTalentPoolPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Matching modal state
  const [matchModalCandidate, setMatchModalCandidate] = useState<Candidate | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/candidates?tenant_id=${TENANT_ID}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setCandidates(json.candidates || [])
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const searchable = `${c.full_name}${c.email}${c.hiring_type}${c.university || ''}${c.current_company || ''}`
        return searchable.toLowerCase().includes(q)
      }
      return true
    })
  }, [candidates, searchQuery, statusFilter])

  const openMatchModal = async (candidate: Candidate) => {
    setMatchModalCandidate(candidate)
    setMatches([])
    setMatchError(null)
    setMatchLoading(true)
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/matching`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setMatches(json.matches || [])
    } catch (err) {
      setMatchError(String(err))
    } finally {
      setMatchLoading(false)
    }
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length }
    for (const c of candidates) {
      counts[c.status] = (counts[c.status] || 0) + 1
    }
    return counts
  }, [candidates])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          タレントプール（候補者）
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          過去の候補者を蓄積し、将来の採用に活かします
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setStatusFilter(sf.value)}
            className={`bg-white rounded-xl border shadow-sm px-4 py-3 text-left transition-all ${
              statusFilter === sf.value
                ? 'border-indigo-300 ring-1 ring-indigo-100'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-400">{sf.label}</p>
            <p className="text-xl font-bold text-gray-900">
              {statusCounts[sf.value] || 0}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="候補者名・メール・企業名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            {STATUS_FILTERS.map((sf) => (
              <option key={sf.value} value={sf.value}>{sf.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">データの取得に失敗しました</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && candidates.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            候補者データがありません
          </h3>
          <p className="text-sm text-gray-500">
            候補者を登録すると、ここに一覧が表示されます
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && candidates.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">該当する候補者が見つかりません</p>
        </div>
      )}

      {/* Candidate grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cand) => {
            const st = statusConfig[cand.status] || { label: cand.status, color: 'bg-gray-100 text-gray-600' }
            return (
              <div
                key={cand.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 p-5"
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {cand.full_name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{cand.full_name}</h3>
                      {cand.current_company && (
                        <p className="text-xs text-gray-500">{cand.current_company}</p>
                      )}
                      {cand.university && (
                        <p className="text-xs text-gray-400">{cand.university}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{hiringTypeLabels[cand.hiring_type] || cand.hiring_type}</span>
                  </div>
                  {cand.source && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>経路: {cand.source}</span>
                    </div>
                  )}
                  {cand.interviews && cand.interviews.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>面接 {cand.interviews.length}回</span>
                    </div>
                  )}
                </div>

                {/* Matching button */}
                <button
                  onClick={() => openMatchModal(cand)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  マッチング
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Matching Modal */}
      {matchModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  マッチング結果
                </h2>
                <p className="text-sm text-gray-500">
                  {matchModalCandidate.full_name} に最適な社員
                </p>
              </div>
              <button
                onClick={() => setMatchModalCandidate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {matchLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="ml-2 text-sm text-gray-500">マッチング計算中...</span>
                </div>
              )}

              {matchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">マッチングに失敗しました</p>
                    <p className="text-xs text-red-600 mt-1">{matchError}</p>
                  </div>
                </div>
              )}

              {!matchLoading && !matchError && matches.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">マッチする社員が見つかりません</p>
                  <p className="text-xs mt-1">先に社員をタレントプールに登録してください</p>
                </div>
              )}

              {!matchLoading && matches.length > 0 && (
                <div className="space-y-4">
                  {matches.map((m, idx) => (
                    <div
                      key={m.employee.id}
                      className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Rank */}
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getScoreColor(m.score)}`}>
                            {idx + 1}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {m.employee.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-sm font-bold text-gray-900">{m.score}</span>
                                <span className="text-xs text-gray-400">/ 100</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mb-2">
                            {m.employee.department} / {m.employee.title} / 在籍{m.employee.years_at_company}年
                          </p>

                          {/* Score bar */}
                          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                            <div
                              className={`h-full rounded-full ${getScoreBarColor(m.score)} transition-all`}
                              style={{ width: `${m.score}%` }}
                            />
                          </div>

                          {/* Recommended role */}
                          <div className="bg-indigo-50 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs font-medium text-indigo-700">
                              推奨: {m.recommended_role}
                            </p>
                            <p className="text-xs text-indigo-600 mt-0.5">
                              {m.recommended_reason}
                            </p>
                          </div>

                          {/* Reasons */}
                          <div className="space-y-1 mb-3">
                            {m.reasons.map((reason, ri) => (
                              <div key={ri} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                {reason}
                              </div>
                            ))}
                          </div>

                          {/* Skills preview */}
                          {m.employee.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {m.employee.skills.slice(0, 5).map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* CTA */}
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                            <CalendarPlus className="w-3.5 h-3.5" />
                            この組み合わせで面接を設定
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
