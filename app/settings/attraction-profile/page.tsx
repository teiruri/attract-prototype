'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Building2, Rocket, Monitor, Heart, GraduationCap, Save, CheckCircle2, Loader2 } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const sectionDefs = [
  { key: 'business', dbField: 'business_appeal', title: '事業の魅力', icon: Rocket, color: '#6366F1', bg: '#EEF2FF',
    placeholder: '事業の魅力を記入してください。ミッション、成長性、市場でのポジション、プロダクトの特徴など。' },
  { key: 'environment', dbField: 'work_environment', title: '働く環境の魅力', icon: Monitor, color: '#0D9488', bg: '#F0FDFA',
    placeholder: 'リモートワーク、フレックス、チーム文化、オフィス環境など、働きやすさに関わる魅力を記入。' },
  { key: 'benefits', dbField: 'benefits', title: '制度・福利厚生', icon: Heart, color: '#D97706', bg: '#FFFBEB',
    placeholder: '育児支援、学習支援、ストックオプション、各種手当など、制度面の魅力を記入。' },
  { key: 'growth', dbField: 'growth_opportunities', title: '成長機会', icon: GraduationCap, color: '#8B5CF6', bg: '#F5F3FF',
    placeholder: 'キャリアパス、昇進実績、研修制度、勉強会、カンファレンス支援など成長に関わる魅力を記入。' },
]

export default function AttractionProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 企業概要
  const [companyInfo, setCompanyInfo] = useState({
    name: '', industry: '', size: '', mission: '', vision: '', values: '',
  })

  // 採用コンセプト
  const [hiringConcept, setHiringConcept] = useState('')

  // 魅力セクション
  const [contents, setContents] = useState<Record<string, string>>(
    Object.fromEntries(sectionDefs.map(s => [s.key, '']))
  )

  // カルチャーキーワード
  const [cultureKeywords, setCultureKeywords] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/company-profile')
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          setCompanyInfo({
            name: p.company_name || '',
            industry: p.industry || '',
            size: p.company_size || '',
            mission: p.mission || '',
            vision: p.vision || '',
            values: Array.isArray(p.values) ? p.values.join(', ') : (p.values || ''),
          })
          const evp = p.evp || {}
          setHiringConcept(evp.hiring_concept || p.mission || '')
          setContents({
            business: evp.business_appeal || '',
            environment: evp.work_environment || '',
            benefits: evp.benefits || '',
            growth: evp.growth_opportunities || '',
          })
          setCultureKeywords((p.culture_keywords || []).join(', '))
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
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          company_name: companyInfo.name,
          industry: companyInfo.industry,
          company_size: companyInfo.size,
          mission: companyInfo.mission,
          vision: companyInfo.vision,
          values: companyInfo.values,
          evp: {
            hiring_concept: hiringConcept,
            business_appeal: contents.business,
            work_environment: contents.environment,
            benefits: contents.benefits,
            growth_opportunities: contents.growth,
          },
          culture_keywords: cultureKeywords.split(',').map(k => k.trim()).filter(Boolean),
          attraction_points: [],
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">企業の魅力</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-gray-300'
  const textareaClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed transition placeholder:text-gray-300'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">企業の魅力</h1>
          </div>
          <p className="text-sm text-gray-500">
            AIのAttract生成の土台となります。ここの設定品質がすべてのAI出力品質を決定します。
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" />保存しました</>
          ) : (
            <><Save className="w-4 h-4" />変更を保存</>
          )}
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* 企業概要 */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-gray-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">企業概要</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">会社名</label>
              <input value={companyInfo.name} onChange={e => setCompanyInfo(p => ({...p, name: e.target.value}))}
                className={inputClass} placeholder="株式会社○○" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">業種</label>
              <input value={companyInfo.industry} onChange={e => setCompanyInfo(p => ({...p, industry: e.target.value}))}
                className={inputClass} placeholder="IT・テクノロジー" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">従業員数</label>
              <input value={companyInfo.size} onChange={e => setCompanyInfo(p => ({...p, size: e.target.value}))}
                className={inputClass} placeholder="100名" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">バリュー</label>
              <input value={companyInfo.values} onChange={e => setCompanyInfo(p => ({...p, values: e.target.value}))}
                className={inputClass} placeholder="会社の価値観" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">ミッション</label>
              <input value={companyInfo.mission} onChange={e => setCompanyInfo(p => ({...p, mission: e.target.value}))}
                className={inputClass} placeholder="会社のミッション" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">ビジョン</label>
              <input value={companyInfo.vision} onChange={e => setCompanyInfo(p => ({...p, vision: e.target.value}))}
                className={inputClass} placeholder="会社のビジョン" />
            </div>
          </div>
        </div>

        {/* 採用コンセプト */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">採用コンセプト</h2>
          </div>
          <p className="text-xs text-gray-400 mb-3 ml-10">
            「なぜこの会社で働くのか」を一言で定義します。AIはこれを軸に訴求を設計します。
          </p>
          <textarea
            value={hiringConcept}
            onChange={(e) => setHiringConcept(e.target.value)}
            placeholder='例: 「意思決定できるPMを、もっと速く」— 大企業で埋もれているプロダクト思考のある人材が、ここでは入社3ヶ月で担当プロダクトを持ち、自らの意思で動かせる。'
            rows={3}
            className={textareaClass}
          />
          <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            良い採用コンセプト例: 具体的なエピソード・数字を含み、ターゲットが「これは自分のことだ」と感じられる内容
          </p>
        </div>

        {/* 魅力セクション（事業・環境・福利厚生・成長） */}
        {sectionDefs.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.key} className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: section.bg }}>
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
              </div>
              <textarea
                value={contents[section.key]}
                onChange={e => setContents(prev => ({ ...prev, [section.key]: e.target.value }))}
                rows={4}
                placeholder={section.placeholder}
                className={textareaClass + ' mt-2'}
              />
            </div>
          )
        })}

        {/* カルチャーキーワード */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">カルチャーキーワード</h2>
          <p className="text-xs text-gray-400 mb-3">会社の文化・価値観を表すキーワードをカンマ区切りで入力します。</p>
          <input
            value={cultureKeywords}
            onChange={e => setCultureKeywords(e.target.value)}
            className={inputClass}
            placeholder="自律性, スピード, チームワーク, 挑戦"
          />
        </div>

        {/* 保存ボタン（下部） */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
            ) : saved ? (
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
