'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

interface JobAppeal {
  appeal_points?: string
  work_environment?: string
  growth_path?: string
  team_culture?: string
}

interface TargetPersona {
  age_range?: string
  experience_years?: string
  skills?: string[]
  personality_traits?: string[]
  motivation?: string
  job_appeal?: JobAppeal
}

interface Job {
  id: string
  title: string
  department?: string
  position_type?: string
  description?: string
  requirements?: string[]
  preferred?: string[]
  hiring_type: string
  is_active: boolean
  target_persona?: TargetPersona
  created_at: string
}

export default function JobEditPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [positionType, setPositionType] = useState('')
  const [description, setDescription] = useState('')
  const [hiringType, setHiringType] = useState('new_graduate')
  const [requirements, setRequirements] = useState('')
  const [preferred, setPreferred] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Target persona
  const [ageRange, setAgeRange] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [skills, setSkills] = useState('')
  const [personalityTraits, setPersonalityTraits] = useState('')
  const [motivation, setMotivation] = useState('')

  // Job appeal
  const [appealPoints, setAppealPoints] = useState('')
  const [workEnvironment, setWorkEnvironment] = useState('')
  const [growthPath, setGrowthPath] = useState('')
  const [teamCulture, setTeamCulture] = useState('')

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs?tenant_id=${TENANT_ID}`)
        const data = await res.json()
        const job = (data.jobs || []).find((j: Job) => j.id === jobId)
        if (!job) return

        setTitle(job.title || '')
        setDepartment(job.department || '')
        setPositionType(job.position_type || '')
        setDescription(job.description || '')
        setHiringType(job.hiring_type || 'new_graduate')
        setRequirements((job.requirements || []).join('\n'))
        setPreferred((job.preferred || []).join('\n'))
        setIsActive(job.is_active ?? true)

        const persona = job.target_persona || {}
        setAgeRange(persona.age_range || '')
        setExperienceYears(persona.experience_years || '')
        setSkills((persona.skills || []).join(', '))
        setPersonalityTraits((persona.personality_traits || []).join(', '))
        setMotivation(persona.motivation || '')

        const appeal = persona.job_appeal || {}
        setAppealPoints(appeal.appeal_points || '')
        setWorkEnvironment(appeal.work_environment || '')
        setGrowthPath(appeal.growth_path || '')
        setTeamCulture(appeal.team_culture || '')
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {
        id: jobId,
        title,
        department,
        position_type: positionType,
        description,
        hiring_type: hiringType,
        requirements: requirements.split('\n').map(s => s.trim()).filter(Boolean),
        preferred: preferred.split('\n').map(s => s.trim()).filter(Boolean),
        is_active: isActive,
        target_persona: {
          age_range: ageRange,
          experience_years: experienceYears,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          personality_traits: personalityTraits.split(',').map(s => s.trim()).filter(Boolean),
          motivation,
          job_appeal: {
            appeal_points: appealPoints,
            work_environment: workEnvironment,
            growth_path: growthPath,
            team_culture: teamCulture,
          },
        },
      }

      const res = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        alert('保存しました')
      } else {
        alert('保存に失敗しました')
      }
    } catch {
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('この求人を削除しますか？')) return
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/jobs')
      } else {
        alert('削除に失敗しました')
      }
    } catch {
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">求人編集</h1>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/jobs" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">求人編集</h1>
          <p className="text-sm text-gray-500 mt-0.5">{title || 'ポジション詳細'}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="label mb-1">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">部署</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="label mb-1">ポジションタイプ</label>
                <input
                  type="text"
                  value={positionType}
                  onChange={e => setPositionType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="label mb-1">説明</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">採用タイプ</label>
                <select
                  value={hiringType}
                  onChange={e => setHiringType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="new_graduate">新卒</option>
                  <option value="mid_career">中途</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="label">募集中</label>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">要件</h2>
          <div className="space-y-4">
            <div>
              <label className="label mb-1">必須要件（1行に1つ）</label>
              <textarea
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                rows={4}
                placeholder="例：Java 3年以上&#10;チーム開発経験"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="label mb-1">歓迎要件（1行に1つ）</label>
              <textarea
                value={preferred}
                onChange={e => setPreferred(e.target.value)}
                rows={4}
                placeholder="例：マネジメント経験&#10;英語力"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Target Persona */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">ターゲットペルソナ</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">年齢層</label>
                <input
                  type="text"
                  value={ageRange}
                  onChange={e => setAgeRange(e.target.value)}
                  placeholder="例：25-35"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="label mb-1">経験年数</label>
                <input
                  type="text"
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  placeholder="例：3-5年"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="label mb-1">スキル（カンマ区切り）</label>
              <textarea
                value={skills}
                onChange={e => setSkills(e.target.value)}
                rows={2}
                placeholder="例：React, TypeScript, Node.js"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="label mb-1">性格特性（カンマ区切り）</label>
              <textarea
                value={personalityTraits}
                onChange={e => setPersonalityTraits(e.target.value)}
                rows={2}
                placeholder="例：主体性, コミュニケーション力, 学習意欲"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="label mb-1">志向性・モチベーション</label>
              <textarea
                value={motivation}
                onChange={e => setMotivation(e.target.value)}
                rows={3}
                placeholder="例：成長環境を求める、社会貢献に関心がある"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Job Appeal */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">求人の魅力</h2>
          <p className="text-xs text-gray-400 mb-4">候補者への惹きつけに活用されます。AIが生成するメッセージの精度が向上します。</p>
          <div className="space-y-4">
            <div>
              <label className="label mb-1">この求人の魅力ポイント</label>
              <textarea
                value={appealPoints}
                onChange={e => setAppealPoints(e.target.value)}
                rows={3}
                placeholder="例：業界トップクラスのプロダクト開発に携われる、裁量が大きい"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="label mb-1">働き方・環境の特徴</label>
              <textarea
                value={workEnvironment}
                onChange={e => setWorkEnvironment(e.target.value)}
                rows={3}
                placeholder="例：フルリモート可、フレックスタイム制、最新のMacBook支給"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="label mb-1">成長・キャリアパス</label>
              <textarea
                value={growthPath}
                onChange={e => setGrowthPath(e.target.value)}
                rows={3}
                placeholder="例：入社2年でリードエンジニアへの昇格実績あり、社内勉強会が活発"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="label mb-1">チーム・カルチャー</label>
              <textarea
                value={teamCulture}
                onChange={e => setTeamCulture(e.target.value)}
                rows={3}
                placeholder="例：心理的安全性を重視、1on1ミーティング週1回、チーム全員がコードレビュー"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            この求人を削除
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
