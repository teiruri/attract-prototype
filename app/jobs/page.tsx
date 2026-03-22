'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, Users, Sparkles, MapPin, Building2, Calendar, ChevronRight, ExternalLink, GraduationCap } from 'lucide-react'

const jobs = [
  {
    id: 'job_001',
    title: 'シニアプロダクトマネージャー',
    department: 'プロダクト部門',
    employmentType: '正社員（中途）',
    location: '東京（リモート可）',
    status: 'open' as const,
    applicantCount: 3,
    attractProfileSet: true,
    salary: '700〜1,100万円',
    publishedAt: '2025-01-15',
    hiringType: 'midcareer',
    description: '自社プロダクトの成長を牽引するPMを募集。ロードマップ策定から実行まで裁量を持って推進いただきます。',
  },
  {
    id: 'job_002',
    title: 'プロダクトマネージャー（新卒2026）',
    department: 'プロダクト部門',
    employmentType: '正社員（新卒）',
    location: '東京（リモート可）',
    status: 'open' as const,
    applicantCount: 1,
    attractProfileSet: true,
    salary: '450〜550万円',
    publishedAt: '2025-02-01',
    hiringType: 'newgrad',
    description: '2026年3月卒業予定の方を対象に、プロダクトマネージャーとしてのキャリアをスタートできるポジション。入社半年でリーダー機会あり。',
  },
  {
    id: 'job_003',
    title: 'UXデザイナー',
    department: 'デザイン部門',
    employmentType: '正社員（中途）',
    location: '東京（リモート可）',
    status: 'draft' as const,
    applicantCount: 0,
    attractProfileSet: false,
    salary: '600〜900万円',
    publishedAt: '',
    hiringType: 'midcareer',
    description: 'プロダクトのUX設計をリードしていただきます。ユーザーリサーチからUIデザインまで一貫して担当。',
  },
]

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const selected = jobs.find(j => j.id === selectedJob)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">求人管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            募集ポジションの登録・管理 — {jobs.filter(j => j.status === 'open').length}件 募集中 / {jobs.length}件 合計
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          求人を登録
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Job List */}
        <div className="col-span-2 space-y-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
              className={`card p-5 w-full text-left transition-all ${
                selectedJob === job.id ? 'ring-2 ring-indigo-400 ring-offset-1' : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  job.hiringType === 'newgrad' ? 'bg-pink-50' : 'bg-indigo-50'
                }`}>
                  {job.hiringType === 'newgrad' ? (
                    <GraduationCap className="w-5 h-5 text-pink-600" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                    {job.status === 'open' ? (
                      <span className="badge bg-emerald-100 text-emerald-700">募集中</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-500">下書き</span>
                    )}
                    {job.attractProfileSet && (
                      <span className="badge bg-indigo-50 text-indigo-600">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                        魅力設定済み
                      </span>
                    )}
                    {job.hiringType === 'newgrad' && (
                      <span className="badge bg-pink-50 text-pink-700">新卒</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{job.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      選考中 {job.applicantCount}名
                    </span>
                    <span>{job.salary}</span>
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
                      <p className="label mb-1">雇用形態</p>
                      <p className="text-sm text-gray-800">{job.employmentType}</p>
                    </div>
                    <div>
                      <p className="label mb-1">年収レンジ</p>
                      <p className="text-sm text-gray-800">{job.salary}</p>
                    </div>
                    <div>
                      <p className="label mb-1">掲載日</p>
                      <p className="text-sm text-gray-800">{job.publishedAt || '未掲載'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs">
                      求人を編集
                    </button>
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
          ))}
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">求人サマリー</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">募集中ポジション</span>
                <span className="text-lg font-bold text-gray-900">{jobs.filter(j => j.status === 'open').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">総応募者数</span>
                <span className="text-lg font-bold text-gray-900">{jobs.reduce((acc, j) => acc + j.applicantCount, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">魅力設定完了率</span>
                <span className="text-lg font-bold text-emerald-600">
                  {Math.round((jobs.filter(j => j.attractProfileSet).length / jobs.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-indigo-50 border-indigo-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-800 mb-1">カケハシOS の効果を最大化</p>
                <p className="text-xs text-indigo-600 leading-relaxed">
                  各求人に「企業魅力プロファイル」を設定することで、AIが生成するフィードバックレターやAttractプランの精度が大幅に向上します。
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
              <div className="flex items-center gap-3">
                <span className="badge bg-blue-50 text-blue-700">中途</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(jobs.filter(j => j.hiringType === 'midcareer').length / jobs.length) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700">{jobs.filter(j => j.hiringType === 'midcareer').length}件</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-pink-50 text-pink-700">新卒</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(jobs.filter(j => j.hiringType === 'newgrad').length / jobs.length) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700">{jobs.filter(j => j.hiringType === 'newgrad').length}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
