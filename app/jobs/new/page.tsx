'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Save, Loader2, ArrowLeft, UserSearch, Sparkles } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

export default function NewJobPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [positionType, setPositionType] = useState('')
  const [hiringType, setHiringType] = useState('mid_career')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [preferred, setPreferred] = useState('')

  // ターゲットペルソナ
  const [targetAgeRange, setTargetAgeRange] = useState('')
  const [targetExperience, setTargetExperience] = useState('')
  const [targetSkills, setTargetSkills] = useState('')
  const [targetPersonality, setTargetPersonality] = useState('')
  const [targetMotivation, setTargetMotivation] = useState('')

  const handleSave = async () => {
    if (!title.trim()) {
      setError('求人タイトルを入力してください')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          title: title.trim(),
          department: department.trim() || null,
          position_type: positionType.trim() || null,
          hiring_type: hiringType,
          description: description.trim() || null,
          requirements: requirements.trim()
            ? requirements.split('\n').map(r => r.trim()).filter(Boolean)
            : [],
          preferred: preferred.trim()
            ? preferred.split('\n').map(p => p.trim()).filter(Boolean)
            : [],
          target_persona: {
            target_age_range: targetAgeRange.trim() || null,
            target_experience: targetExperience.trim() || null,
            target_skills: targetSkills.trim() || null,
            target_personality: targetPersonality.trim() || null,
            target_motivation: targetMotivation.trim() || null,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '求人の作成に失敗しました')
        return
      }

      router.push('/jobs')
      router.refresh()
    } catch {
      setError('求人の作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/jobs')}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">求人を登録</h1>
          <p className="text-sm text-gray-500 mt-0.5">新しい求人ポジションを作成します</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本情報 */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-900">基本情報</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label mb-1 block">求人タイトル <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: フロントエンドエンジニア"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label mb-1 block">部署・チーム</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="例: プロダクト開発部"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="label mb-1 block">ポジション</label>
                <input
                  type="text"
                  value={positionType}
                  onChange={(e) => setPositionType(e.target.value)}
                  placeholder="例: リーダー候補"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="label mb-1 block">採用タイプ</label>
                <select
                  value={hiringType}
                  onChange={(e) => setHiringType(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="mid_career">中途</option>
                  <option value="new_graduate">新卒</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label mb-1 block">求人概要</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このポジションの概要・募集背景"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="label mb-1 block">必須要件（1行1項目）</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={"Webアプリケーション開発経験3年以上\nReact/TypeScriptの実務経験"}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="label mb-1 block">歓迎要件（1行1項目）</label>
              <textarea
                value={preferred}
                onChange={(e) => setPreferred(e.target.value)}
                placeholder={"チームリーダー経験\nアジャイル開発経験"}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ターゲットペルソナ */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <UserSearch className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-900">ターゲットペルソナ定義</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            この求人で採用したい人物像を具体的に定義します。AIはシグナルとの照合やAttract生成に使用します。
          </p>

          <div className="space-y-4">
            <div>
              <label className="label mb-1 block">年齢層</label>
              <input
                type="text"
                value={targetAgeRange}
                onChange={(e) => setTargetAgeRange(e.target.value)}
                placeholder="25-35歳"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="label mb-1 block">求める経験</label>
              <textarea
                value={targetExperience}
                onChange={(e) => setTargetExperience(e.target.value)}
                placeholder="3年以上のWebアプリケーション開発経験"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="label mb-1 block">求めるスキル</label>
              <textarea
                value={targetSkills}
                onChange={(e) => setTargetSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js など"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="label mb-1 block">求める人物像</label>
              <textarea
                value={targetPersonality}
                onChange={(e) => setTargetPersonality(e.target.value)}
                placeholder="自走力があり、チームワークを大切にする方"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="label mb-1 block">響くポイント</label>
              <textarea
                value={targetMotivation}
                onChange={(e) => setTargetMotivation(e.target.value)}
                placeholder="技術的チャレンジ、裁量権、成長環境 など"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <p className="text-xs text-indigo-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ペルソナが具体的であるほど、AIの候補者マッチングとAttract生成の精度が向上します
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/jobs')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Save className="w-4 h-4" />求人を作成</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
