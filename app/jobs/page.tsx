'use client'

import { Plus, Briefcase } from 'lucide-react'

const jobs = [
  {
    id: 'job_001',
    title: 'シニアプロダクトマネージャー',
    department: 'プロダクト部門',
    employmentType: '正社員',
    location: '東京（リモート可）',
    status: 'open',
    applicantCount: 3,
    attractProfileSet: true,
  },
]

export default function JobsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">求人管理</h1>
          <p className="text-sm text-gray-500 mt-1">募集ポジションの登録・管理</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          求人を登録
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="card p-5 flex items-center gap-5">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                <span className="badge bg-emerald-100 text-emerald-700">募集中</span>
                {job.attractProfileSet && (
                  <span className="badge bg-indigo-100 text-indigo-600">魅力設定済み</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{job.department}</span>
                <span>{job.employmentType}</span>
                <span>{job.location}</span>
                <span>選考中: <strong className="text-gray-700">{job.applicantCount}名</strong></span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs">求人を編集</button>
              <button className="btn-ghost text-xs">候補者を見る</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
