'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, Users, Sparkles, MapPin, Building2, Calendar, ChevronRight, ExternalLink, GraduationCap, Pencil } from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

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
  target_persona?: object
  created_at: string
}

interface Candidate {
  id: string
  job_id: string
  status: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, candRes] = await Promise.all([
          fetch(`/api/jobs?tenant_id=${TENANT_ID}`),
          fetch(`/api/candidates?tenant_id=${TENANT_ID}`),
        ])
        const jobsData = await jobsRes.json()
        const candData = await candRes.json()
        setJobs(jobsData.jobs || [])
        setCandidates(candData.candidates || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const selected = jobs.find(j => j.id === selectedJob)

  const getApplicantCount = (jobId: string) =>
    candidates.filter(c => c.job_id === jobId && c.status === 'active').length

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">求人管理</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">求人管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            募集ポジションの登録・管理 — {jobs.filter(j => j.is_active).length}件 募集中 / {jobs.length}件 合計
          </p>
        </div>
        <Link href="/jobs/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          求人を登録
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">求人がありません</h2>
          <p className="text-sm text-gray-500 mb-6">求人を登録して採用活動を始めましょう</p>
          <Link href="/jobs/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" />
            求人を登録
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Job List */}
          <div className="col-span-2 space-y-3">
            {jobs.map((job) => {
              const isNewgrad = job.hiring_type === 'new_graduate' || job.hiring_type === 'newgrad'
              const applicantCount = getApplicantCount(job.id)
              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                  className={`card p-5 w-full text-left transition-all ${
                    selectedJob === job.id ? 'ring-2 ring-indigo-400 ring-offset-1' : 'hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isNewgrad ? 'bg-pink-50' : 'bg-indigo-50'
                    }`}>
                      {isNewgrad ? (
                        <GraduationCap className="w-5 h-5 text-pink-600" />
                      ) : (
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                        {job.is_active ? (
                          <span className="badge bg-emerald-100 text-emerald-700">募集中</span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-500">停止</span>
                        )}
                        {isNewgrad && (
                          <span className="badge bg-pink-50 text-pink-700">新卒</span>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-xs text-gray-500 mb-2">{job.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          選考中 {applicantCount}名
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                      selectedJob === job.id ? 'rotate-90' : ''
                    }`} />
                  </div>

                  {/* Expanded Detail */}
                  {selectedJob === job.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="label mb-1">採用タイプ</p>
                          <p className="text-sm text-gray-800">{isNewgrad ? '新卒' : '中途'}</p>
                        </div>
                        {job.position_type && (
                          <div>
                            <p className="label mb-1">ポジション</p>
                            <p className="text-sm text-gray-800">{job.position_type}</p>
                          </div>
                        )}
                        <div>
                          <p className="label mb-1">作成日</p>
                          <p className="text-sm text-gray-800">
                            {job.created_at ? new Date(job.created_at).toLocaleDateString('ja-JP') : '—'}
                          </p>
                        </div>
                      </div>
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-4">
                          <p className="label mb-1">必須要件</p>
                          <ul className="text-sm text-gray-700 list-disc list-inside">
                            {job.requirements.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job.id}`} className="btn-secondary text-xs">
                          <Pencil className="w-3.5 h-3.5" />
                          編集
                        </Link>
                        <Link href="/candidates" className="btn-secondary text-xs">
                          <Users className="w-3.5 h-3.5" />
                          候補者を見る
                        </Link>
                        <Link href="/settings/attraction-profile" className="btn-secondary text-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          魅力設定
                        </Link>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Stats */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">求人サマリー</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">募集中ポジション</span>
                  <span className="text-lg font-bold text-gray-900">{jobs.filter(j => j.is_active).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">総応募者数</span>
                  <span className="text-lg font-bold text-gray-900">
                    {candidates.filter(c => c.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5 bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800 mb-1">HR FARM の効果を最大化</p>
                  <p className="text-xs text-indigo-600 leading-relaxed">
                    各求人に「企業魅力プロファイル」を設定することで、AIが生成するフィードバックレターやひきつけプランの精度が大幅に向上します。
                  </p>
                  <Link href="/settings/attraction-profile" className="text-xs text-indigo-700 font-medium mt-2 inline-flex items-center gap-1 hover:text-indigo-800">
                    企業魅力設定を確認する
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">採用タイプ別</h3>
              <div className="space-y-2">
                {(() => {
                  const midcareerCount = jobs.filter(j => j.hiring_type !== 'new_graduate' && j.hiring_type !== 'newgrad').length
                  const newgradCount = jobs.length - midcareerCount
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-blue-50 text-blue-700">中途</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${jobs.length > 0 ? (midcareerCount / jobs.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{midcareerCount}件</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-pink-50 text-pink-700">新卒</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-pink-500 rounded-full" style={{ width: `${jobs.length > 0 ? (newgradCount / jobs.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{newgradCount}件</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
