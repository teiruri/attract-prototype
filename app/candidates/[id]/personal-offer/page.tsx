'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, Copy, CheckCircle2 } from 'lucide-react'

export default function PersonalOfferPage() {
  const params = useParams()
  const id = params.id as string
  const [candidate, setCandidate] = useState<any>(null)
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetch(`/api/candidates/${id}`)
      .then(r => r.json())
      .then(d => { setCandidate(d.candidate); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleGenerate = async () => {
    if (!candidate) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/candidates/${id}/personal-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate }),
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
              <h1 className="text-xl font-bold text-gray-900">パーソナルオファー</h1>
            </div>
            {candidate && (
              <p className="text-sm text-gray-500 mt-1">
                {candidate.full_name} - {candidate.hiring_type === 'new_graduate' ? '新卒' : '中途'}
                {candidate.current_company ? ` / ${candidate.current_company}` : ''}
              </p>
            )}
          </div>
          {result && (
            <button onClick={handleCopy} className="btn-secondary flex items-center gap-2">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          )}
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
                  パーソナルオファーを生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  パーソナルオファーを生成
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
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-gray-400">AIが生成したパーソナルオファー</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400">
                このオファーはAIが候補者情報をもとに自動生成しました。内容を確認してご活用ください。
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
