'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart3, Upload, Save, Sparkles, CheckCircle2, Plus, X, Loader2 } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

// REVP diagnostic categories
const REVP_CATEGORIES = [
  { key: 'philosophy', label: '理念・ビジョン', color: 'bg-blue-500', description: '企業の存在意義、社会的使命、将来の方向性' },
  { key: 'work_content', label: '仕事内容・やりがい', color: 'bg-indigo-500', description: '業務の面白さ、成長実感、社会貢献' },
  { key: 'organization', label: '組織・チーム', color: 'bg-purple-500', description: 'チームの雰囲気、多様性、協力体制' },
  { key: 'growth', label: '成長・キャリア', color: 'bg-emerald-500', description: 'スキルアップ、キャリアパス、研修制度' },
  { key: 'work_style', label: '働き方・環境', color: 'bg-amber-500', description: 'リモート、フレックス、オフィス環境' },
  { key: 'compensation', label: '報酬・福利厚生', color: 'bg-rose-500', description: '給与水準、評価制度、福利厚生' },
  { key: 'brand', label: '企業ブランド・知名度', color: 'bg-cyan-500', description: '業界でのポジション、社会的評価' },
  { key: 'people', label: '人・カルチャー', color: 'bg-orange-500', description: '社風、人間関係、ロールモデル' },
]

interface RevpData {
  scores: Record<string, number> // 0-100 score per category
  strengths: string[] // free text: company strengths/episodes
  messages: string[] // key messages for candidates
  episodes: string[] // concrete episodes/stories
  raw_text?: string // uploaded raw diagnosis text
  updated_at?: string
}

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Upload diagnosis file (PDF/text) and extract with AI
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/revp-analyze', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.revp_data) {
        setData(prev => ({
          ...prev,
          ...json.revp_data,
          raw_text: json.raw_text || prev.raw_text,
        }))
      }
    } catch {
      alert('ファイルの解析に失敗しました')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Save REVP data
  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/company-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          revp_data: { ...data, updated_at: new Date().toISOString() },
        }),
      })
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
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            REVP診断
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            採用における自社の魅力を可視化し、候補者へのメッセージに反映します
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? '解析中...' : '診断結果をアップロード'}
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? '保存しました' : saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* Score Bars */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">魅力カテゴリースコア</h2>
        <p className="text-xs text-gray-400 mb-4">各カテゴリーの自社の魅力度をスライダーで設定してください（0〜100）</p>
        <div className="space-y-4">
          {REVP_CATEGORIES.map(cat => {
            const score = data.scores[cat.key] || 0
            return (
              <div key={cat.key} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-800">{cat.label}</p>
                  <p className="text-[10px] text-gray-400">{cat.description}</p>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={e => updateScore(cat.key, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{score}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strengths */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">自社の強み・差別化ポイント</h2>
            <p className="text-xs text-gray-400">AIが候補者向けメッセージを作成する際に参照します</p>
          </div>
          <button onClick={() => addItem('strengths')} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> 追加
          </button>
        </div>
        <div className="space-y-2">
          {data.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={s}
                onChange={e => updateItem('strengths', i, e.target.value)}
                rows={2}
                className="input flex-1 text-sm"
                placeholder="例：業界トップクラスの技術力と、フラットな組織文化"
              />
              <button onClick={() => removeItem('strengths', i)} className="text-gray-400 hover:text-red-500 mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.strengths.length === 0 && (
            <p className="text-xs text-gray-400 py-2">まだ登録されていません。「追加」ボタンから入力してください。</p>
          )}
        </div>
      </div>

      {/* Key Messages */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">候補者への重要メッセージ</h2>
            <p className="text-xs text-gray-400">採用コミュニケーションで必ず伝えたいメッセージ</p>
          </div>
          <button onClick={() => addItem('messages')} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> 追加
          </button>
        </div>
        <div className="space-y-2">
          {data.messages.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={m}
                onChange={e => updateItem('messages', i, e.target.value)}
                rows={2}
                className="input flex-1 text-sm"
                placeholder="例：私たちは「人が育つ会社」を目指しています"
              />
              <button onClick={() => removeItem('messages', i)} className="text-gray-400 hover:text-red-500 mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.messages.length === 0 && (
            <p className="text-xs text-gray-400 py-2">まだ登録されていません。「追加」ボタンから入力してください。</p>
          )}
        </div>
      </div>

      {/* Episodes */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">魅力を伝えるエピソード</h2>
            <p className="text-xs text-gray-400">具体的なストーリーがあると候補者の共感を得やすくなります</p>
          </div>
          <button onClick={() => addItem('episodes')} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> 追加
          </button>
        </div>
        <div className="space-y-2">
          {data.episodes.map((ep, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={ep}
                onChange={e => updateItem('episodes', i, e.target.value)}
                rows={3}
                className="input flex-1 text-sm"
                placeholder="例：入社2年目のエンジニアが自主提案した新機能が全社MVPに選ばれた"
              />
              <button onClick={() => removeItem('episodes', i)} className="text-gray-400 hover:text-red-500 mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.episodes.length === 0 && (
            <p className="text-xs text-gray-400 py-2">まだ登録されていません。「追加」ボタンから入力してください。</p>
          )}
        </div>
      </div>

      {/* AI Integration Note */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">AIへの自動反映</p>
            <p className="text-xs text-indigo-600 leading-relaxed mt-1">
              ここで設定したREVP情報は、パーソナルオファー・惹きつけ戦略・合格通知レター・次回面接シナリオの各AI生成機能に自動で反映されます。
              情報が充実するほど、候補者に刺さるメッセージが生成されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
