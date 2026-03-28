'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, Copy, CheckCircle2, Mail } from 'lucide-react'

export default function PersonalOfferPage() {
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
      const res = await fetch(`/api/candidates/${id}/personal-offer`, {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <Link href={`/candidates/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" />
          候補者詳細に戻る
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">パーソナルオファー</h1>
            </div>
            {candidate && (
              <p className="text-sm text-gray-500 mt-1">
                {candidate.full_name} - {candidate.hiring_type === 'new_graduate' ? '新卒' : '中途'}
                {candidate.current_company ? ` / ${candidate.current_company}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        {candidate && (
          <div className="card p-5 mb-6">
            <h2 className="section-title mb-3">候補者情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="label">氏名</span><p className="text-gray-800">{candidate.full_name}</p></div>
              <div><span className="label">採用タイプ</span><p className="text-gray-800"><span className="badge bg-indigo-100 text-indigo-700">{candidate.hiring_type === 'new_graduate' ? '新卒' : '中途'}</span></p></div>
              {candidate.current_company && <div><span className="label">現職</span><p className="text-gray-800">{candidate.current_company} {candidate.current_title || ''}</p></div>}
              {candidate.university && <div><span className="label">大学</span><p className="text-gray-800">{candidate.university} {candidate.faculty || ''}</p></div>}
            </div>
          </div>
        )}

        {!result && !generating && (
          <div className="text-center py-8">
            <button onClick={handleGenerate} disabled={!candidate} className="btn-primary text-base px-8 py-3 flex items-center gap-3 mx-auto">
              <Sparkles className="w-5 h-5" />
              パーソナルオファーを作成
            </button>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        )}

        {(result || generating) && (
          <div className="card overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">メールプレビュー</span>
                  {generating && (
                    <span className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      生成中...
                    </span>
                  )}
                </div>
                {!generating && result && (
                  <button onClick={handleCopy} className="btn-secondary text-xs">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'コピー済み' : 'コピー'}
                  </button>
                )}
              </div>
            </div>
            <div className="px-8 py-6 bg-white" ref={resultRef}>
              <div className="max-w-2xl mx-auto text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Hiragino Sans', 'Meiryo', sans-serif" }}>
                {result}
                {generating && <span className="inline-block w-1.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-text-bottom rounded-sm" />}
              </div>
            </div>
            {!generating && result && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-400">このオファーはAIが候補者情報をもとに自動生成しました。内容を確認してご活用ください。</p>
                <button onClick={() => { setResult(''); handleGenerate() }} className="btn-secondary text-sm">
                  <Sparkles className="w-4 h-4" />再生成
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
