'use client'

import Link from 'next/link'
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Mail,
  FileText,
  GraduationCap,
  Brain,
  Zap,
} from 'lucide-react'
import { candidates, getStageColor } from '@/lib/mock-data'

export default function Dashboard() {
  const totalActive = candidates.filter((c) =>
    c.applications.some((a) => a.status === 'active')
  ).length

  const actionItems = [
    {
      type: 'feedback_letter',
      candidate: '田中 美咲',
      candidateType: 'midcareer',
      action: '一次面接の合格フィードバックレターが未送付です',
      urgency: 'high',
      href: '/candidates/cand_001/feedback-letter?interview=int_002',
      icon: Mail,
    },
    {
      type: 'attract_plan',
      candidate: '田中 美咲',
      candidateType: 'midcareer',
      action: '二次面接（3/15）のAttractプランを確認してください',
      urgency: 'high',
      href: '/candidates/cand_001/attract',
      icon: Sparkles,
    },
    {
      type: 'signal_input',
      candidate: '田村 萌',
      candidateType: 'newgrad',
      action: '【新卒】カジュアル面談の面談メモを入力→シグナル抽出してください',
      urgency: 'high',
      href: '/candidates/cand_004/signal-input',
      icon: Brain,
    },
    {
      type: 'feedback_letter',
      candidate: '田村 萌',
      candidateType: 'newgrad',
      action: '【新卒】カジュアル面談の合格フィードバックレターを生成・送付してください（A社選考中）',
      urgency: 'high',
      href: '/candidates/cand_004/feedback-letter',
      icon: Mail,
    },
    {
      type: 'brief',
      candidate: '田中 美咲',
      candidateType: 'midcareer',
      action: '坂本代表・前田さんへの面接官ブリーフを送付してください',
      urgency: 'medium',
      href: '/candidates/cand_001/brief',
      icon: FileText,
    },
    {
      type: 'attract_plan',
      candidate: '山本 健太',
      candidateType: 'midcareer',
      action: '最終面接（3/18）のAttractプランを生成してください',
      urgency: 'medium',
      href: '/candidates/cand_002/attract',
      icon: Sparkles,
    },
  ]

  const stageStats = [
    { label: 'カジュアル面談', count: 2, color: 'bg-gray-400' },
    { label: '一次面接', count: 0, color: 'bg-blue-400' },
    { label: '二次面接', count: 1, color: 'bg-indigo-400' },
    { label: '最終面接', count: 1, color: 'bg-purple-400' },
    { label: 'オファー', count: 0, color: 'bg-amber-400' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">2025年3月15日（土）— 新卒・中途 採用 進捗概要</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">選考中</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalActive}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">新卒 1名</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">中途 3名</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">要対応</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{actionItems.filter(i => i.urgency === 'high').length}</p>
          <p className="text-xs text-gray-400 mt-1">高優先アクション</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">Attractプラン</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-400 mt-1">生成済み</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">フィードバックレター</span>
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-400 mt-1">送付済み</p>
        </div>
      </div>

      {/* Efficiency Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">今月のAI業務効率化レポート</p>
            <p className="text-xs text-indigo-200">ATTRACT AIによる自動化で採用担当の工数を削減しています</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'シグナル抽出', saved: '2.5時間', count: '5回' },
            { label: 'レター生成', saved: '4時間', count: '4通' },
            { label: 'ブリーフ作成', saved: '1.5時間', count: '3件' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-bold text-white">{item.saved}</p>
              <p className="text-[10px] text-indigo-200">{item.label}節約（{item.count}）</p>
            </div>
          ))}
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-300">8時間</p>
            <p className="text-[10px] text-indigo-200">今月の総節約時間</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Action Items */}
        <div className="col-span-2">
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">要対応アクション</h2>
              <span className="badge bg-amber-50 text-amber-600">{actionItems.length}件</span>
            </div>
            <div className="divide-y divide-gray-50">
              {actionItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.urgency === 'high' ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      <Icon className={`w-4 h-4 ${item.urgency === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-900">{item.candidate}</span>
                        {item.urgency === 'high' && (
                          <span className="badge bg-red-50 text-red-600">要対応</span>
                        )}
                        {item.candidateType === 'newgrad' && (
                          <span className="badge bg-pink-50 text-pink-700">
                            <GraduationCap className="w-2.5 h-2.5 mr-0.5" />新卒
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{item.action}</p>
                    </div>
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium flex-shrink-0"
                    >
                      対応する
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pipeline */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">選考パイプライン</h2>
            <div className="space-y-2.5">
              {stageStats.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
                  <span className="text-xs text-gray-600 flex-1">{s.label}</span>
                  <span className="text-sm font-semibold text-gray-900 w-5 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">候補者一覧</h2>
              <Link href="/candidates" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                すべて見る
              </Link>
            </div>
            <div className="space-y-3">
              {candidates.map((c) => {
                const app = c.applications[0]
                return (
                  <Link
                    key={c.id}
                    href={`/candidates/${c.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-8 h-8 rounded-full ${c.avatarColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-bold text-white">{c.avatarInitials[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{c.fullName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{c.currentTitle}</p>
                    </div>
                    {app && (
                      <span className={`badge text-[10px] ${getStageColor(app.currentStage)}`}>
                        {app.currentStage === 'casual' ? 'カジュアル' :
                         app.currentStage === 'interview_1' ? '一次' :
                         app.currentStage === 'interview_2' ? '二次' :
                         app.currentStage === 'final' ? '最終' : app.currentStage}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
