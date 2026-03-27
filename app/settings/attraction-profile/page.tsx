'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Plus, Trash2, CheckCircle2, Save, BarChart3, ArrowRight } from 'lucide-react'

interface CompanyProfile {
  id?: string
  company_name?: string
  industry?: string
  company_size?: string
  mission?: string
  vision?: string
  values?: string[]
  evp?: {
    hiring_concept?: string
    target_persona?: string
    items?: Array<{ category: string; content: string; icon: string }>
  }
  culture_keywords?: string[]
  attraction_points?: Array<{
    point: string
    evidence: string
    target_segments: string[]
  }>
}

export default function AttractionProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [hiringConcept, setHiringConcept] = useState('')
  const [targetPersona, setTargetPersona] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/company-profile')
        const data = await res.json()
        if (data.profile) {
          setProfile(data.profile)
          setHiringConcept(data.profile.evp?.hiring_concept || data.profile.mission || '')
          setTargetPersona(data.profile.evp?.target_persona || '')
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      const body = {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        company_name: profile?.company_name || '',
        industry: profile?.industry || '',
        company_size: profile?.company_size || '',
        mission: profile?.mission || '',
        vision: profile?.vision || '',
        values: profile?.values || [],
        evp: {
          ...(profile?.evp || {}),
          hiring_concept: hiringConcept,
          target_persona: targetPersona,
        },
        culture_keywords: profile?.culture_keywords || [],
        attraction_points: profile?.attraction_points || [],
      }
      await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">企業魅力・採用コンセプト設定</h1>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">企業魅力・採用コンセプト設定</h1>
          </div>
          <p className="text-sm text-gray-500">
            AIのAttract生成の土台となります。ここの設定品質がすべてのAI出力品質を決定します。
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-primary">
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" />保存しました</>
            ) : (
              <><Save className="w-4 h-4" />変更を保存</>
            )}
          </button>
        </div>
      </div>

      {!profile ? (
        <div className="card p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">企業プロフィールが未設定です</h2>
          <p className="text-sm text-gray-500 mb-6">
            採用コンセプトとEVPを設定して、AIの出力品質を高めましょう
          </p>
        </div>
      ) : null}

      <div className="space-y-6 max-w-4xl">
        {/* Hiring Concept */}
        <div className="card p-6">
          <h2 className="section-title">採用コンセプト</h2>
          <p className="text-xs text-gray-400 mb-3">
            「なぜこの会社で働くのか」を一言で定義します。AIはこれを軸に訴求を設計します。
          </p>
          <textarea
            value={hiringConcept}
            onChange={(e) => setHiringConcept(e.target.value)}
            placeholder="例: 「意思決定できるPMを、もっと速く」— 大企業で埋もれているプロダクト思考のある人材が、ここでは入社3ヶ月で担当プロダクトを持ち、自らの意思で動かせる。"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            良い採用コンセプト例: 具体的なエピソード・数字を含み、ターゲットが「これは自分のことだ」と感じられる内容
          </p>
        </div>

        {/* Target Persona */}
        <div className="card p-6">
          <h2 className="section-title">ターゲットペルソナ定義</h2>
          <p className="text-xs text-gray-400 mb-3">
            採用したい人物像を具体的に記述します。AIはシグナルとの照合に使用します。
          </p>
          <textarea
            value={targetPersona}
            onChange={(e) => setTargetPersona(e.target.value)}
            placeholder="例: 事業会社でのプロダクトマネジメント経験3年以上。戦略思考と実行力を両立できる人材。"
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* EVP Items */}
        {profile?.evp?.items && profile.evp.items.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title mb-0">EVP（従業員価値提案）</h2>
                <p className="text-xs text-gray-400 mt-0.5">企業が従業員に提供できる価値を項目別に整理します</p>
              </div>
            </div>
            <div className="space-y-3">
              {profile.evp.items.map((evp, i) => (
                <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-xl">{evp.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 mb-1.5">{evp.category}</p>
                    <p className="text-sm text-gray-600">{evp.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appeal Points */}
        {profile?.attraction_points && profile.attraction_points.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title mb-0">アピールポイント</h2>
                <p className="text-xs text-gray-400 mt-0.5">候補者に訴求できる具体的な魅力と、それを裏付ける証拠を整理します</p>
              </div>
            </div>
            <div className="space-y-3">
              {profile.attraction_points.map((point, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="mb-2">
                    <label className="label mb-1 block">アピールポイント</label>
                    <p className="text-sm text-gray-800">{point.point}</p>
                  </div>
                  <div className="mb-2">
                    <label className="label mb-1 block">根拠・エビデンス</label>
                    <p className="text-sm text-gray-700">{point.evidence}</p>
                  </div>
                  {point.target_segments && point.target_segments.length > 0 && (
                    <div>
                      <label className="label mb-1 block">対象セグメント</label>
                      <div className="flex flex-wrap gap-1.5">
                        {point.target_segments.map((seg, j) => (
                          <span key={j} className="badge bg-indigo-50 text-indigo-600">
                            {seg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Culture Keywords */}
        {profile?.culture_keywords && profile.culture_keywords.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title">カルチャーキーワード</h2>
            <p className="text-xs text-gray-400 mb-3">会社の文化・価値観を表すキーワードを設定します。</p>
            <div className="flex flex-wrap gap-2">
              {profile.culture_keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary px-8">
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" />保存しました</>
            ) : (
              <><Save className="w-4 h-4" />変更を保存する</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
