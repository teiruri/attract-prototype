'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, Copy, CheckCircle2, Mail } from 'lucide-react'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const candidateRes = await fetch(`/api/candidates/${id}`)
        const candidateData = await candidateRes.json()
        setCandidate(candidateData.candidate)

        const jobsRes = await fetch(`/api/jobs?tenant_id=00000000-0000-0000-0000-000000000001`)
        const jobsData = await jobsRes.json()
        const matchedJob = (jobsData.jobs || []).find((j: any) => j.id === candidateData.candidate?.job_id)
        setJob(matchedJob || null)

        const profileRes = await fetch(`/api/company-profile?tenant_id=00000000-0000-0000-0000-000000000001`)
        const profileData = await profileRes.json()
        const revpData = profileData.profile?.revp_data || null
        setRevp(revpData)

        const interviewRes = await fetch(`/api/candidates/${id}/interviews`)
        const interviewData = await interviewRes.json()
        setInterviews(interviewData.interviews || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleGenerate = async () => {
    if (!candidate) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/candidates/${id}/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, job, revp, interviews }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (data.result) {
        setResult(data.result)
      }
    } catch {
      setError('生成中にエラーが発生しました')
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <Link href={`/candidates/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" />
          候補者詳細に戻る
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">次回面接シナリオ</h1>
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
        {/* Candidate Summary Card */}
        {candidate && (
          <div className="card p-5 mb-6">
            <h2 className="section-title mb-3">候補者情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="label">氏名</span>
                <p className="text-gray-800">{candidate.full_name}</p>
              </div>
              <div>
                <span className="label">採用タイプ</span>
                <p className="text-gray-800">
                  <span className="badge bg-indigo-100 text-indigo-700">
                    {candidate.hiring_type === 'new_graduate' ? '新卒' : '中途'}
                  </span>
                </p>
              </div>
              {candidate.current_company && (
                <div>
                  <span className="label">現職</span>
                  <p className="text-gray-800">{candidate.current_company} {candidate.current_title || ''}</p>
                </div>
              )}
              {candidate.university && (
                <div>
                  <span className="label">大学</span>
                  <p className="text-gray-800">{candidate.university} {candidate.faculty || ''}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!result && (
          <div className="text-center py-8">
            <button
              onClick={handleGenerate}
              disabled={generating || !candidate}
              className="btn-primary text-base px-8 py-3 flex items-center gap-3 mx-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  面接シナリオを作成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  面接シナリオを作成
                </>
              )}
            </button>
            {error && (
              <p className="text-red-500 text-sm mt-4">{error}</p>
            )}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="card overflow-hidden">
            {/* Email header bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">メールプレビュー</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} className="btn-secondary text-xs">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
              </div>
            </div>
            {/* Email body */}
            <div className="px-8 py-6 bg-white">
              <div className="max-w-2xl mx-auto text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Hiragino Sans', 'Meiryo', sans-serif" }}>
                {result}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-400">
                このブリーフィングはAIが候補者情報をもとに自動生成しました。内容を確認してご活用ください。
              </p>
              <button
                onClick={() => { setResult(''); handleGenerate() }}
                className="btn-secondary text-sm"
              >
                <Sparkles className="w-4 h-4" />
                再生成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
