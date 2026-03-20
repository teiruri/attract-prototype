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
  BarChart3,
  Target,
  UserCheck,
  ThumbsUp,
  Activity,
} from 'lucide-react'
import { candidates, getStageColor } from '@/lib/mock-data'

// 候補者ごとの予測データ（デモ）
// offerProb: 内定予測（志望度×ターゲットペルソナマッチ度から算出）
// acceptProb: 内定承諾確率（過去傾向・ターゲット一致率・興味度・理解度・志望度から算出）
// motivationScore: 志望度
// personaMatch: ターゲットペルソナマッチ度
const PREDICTIONS: Record<string, {
  offerProb: number; acceptProb: number;
  motivationScore: number; personaMatch: number;
  interestLevel: number; understandingLevel: number;
}> = {
  cand_001: { offerProb: 78, acceptProb: 85, motivationScore: 82, personaMatch: 91, interestLevel: 88, understandingLevel: 75 },
  cand_002: { offerProb: 45, acceptProb: 52, motivationScore: 55, personaMatch: 68, interestLevel: 60, understandingLevel: 48 },
  cand_003: { offerProb: 82, acceptProb: 88, motivationScore: 85, personaMatch: 94, interestLevel: 90, understandingLevel: 82 },
  cand_004: { offerProb: 61, acceptProb: 72, motivationScore: 70, personaMatch: 76, interestLevel: 75, understandingLevel: 65 },
}

function getPredColor(v: number) {
  if (v >= 75) return { bar: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' }
  if (v >= 55) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
  return { bar: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' }
}

export default function Dashboard() {
  const totalActive = candidates.filter((c) =>
    c.applications.some((a) => a.status === 'active')
  ).length
  const newgradCount = candidates.filter((c) => c.hiringType === 'newgrad' && c.applications.some(a => a.status === 'active')).length
  const midcareerCount = totalActive - newgradCount

  // 動的に各ステージの候補者数を算出
  const computedStageStats = [
    { label: 'カジュアル面談', key: 'casual', color: 'bg-gray-400' },
    { label: '一次面接', key: 'interview_1', color: 'bg-blue-400' },
    { label: '二次面接', key: 'interview_2', color: 'bg-indigo-400' },
    { label: '最終面接', key: 'final', color: 'bg-purple-400' },
    { label: 'オファー', key: 'offer', color: 'bg-amber-400' },
  ].map(s => ({
    ...s,
    count: candidates.filter(c =>
      c.applications.some(a => a.status === 'active' && a.currentStage === s.key)
    ).length,
  }))

  // KPI算出
  const actionItems = [
    {
      type: 'feedback_letter',
      candidate: '田中 美咲',
      candidateType: 'midcareer',
      action: '一次面接の選考結果メールが未送付です',
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
      action: '【新卒】カジュアル面談の録音データをアップロード→シグナル抽出してください',
      urgency: 'high',
      href: '/candidates/cand_004/signal-input',
      icon: Brain,
    },
    {
      type: 'feedback_letter',
      candidate: '田村 萌',
      candidateType: 'newgrad',
      action: '【新卒】カジュアル面談の選考結果メールを生成・送付してください（A社選考中）',
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

  // 内定予測人数（志望度×ターゲットペルソナマッチ度から算出、70%以上を内定見込みとしてカウント）
  const predictedOffers = Object.values(PREDICTIONS).filter(p => p.offerProb >= 70).length
  const predictedOffersTotal = Object.keys(PREDICTIONS).length

  // 今日の日付を動的に取得
  const today = new Date()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()]
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${dayOfWeek}）`

  const stageStats = computedStageStats

  // 採用分析指標（デモ）
  const analyticsMetrics = [
    { label: '辞退率', value: '15%', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', desc: '候補者都合での離脱割合' },
    { label: '平均内定確率', value: `${Math.round(Object.values(PREDICTIONS).reduce((s,p) => s+p.offerProb, 0) / Object.keys(PREDICTIONS).length)}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: '志望度×ペルソナ一致度から算出' },
    { label: '平均承諾確率', value: `${Math.round(Object.values(PREDICTIONS).reduce((s,p) => s+p.acceptProb, 0) / Object.keys(PREDICTIONS).length)}%`, icon: ThumbsUp, color: 'text-violet-600', bg: 'bg-violet-50', desc: '過去傾向・興味度・理解度から算出' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">{dateStr} — 新卒・中途 採用 進捗概要</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 選考中 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">選考中</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-gray-900">{totalActive}</p>
            <span className="text-sm text-gray-400">人</span>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">新卒 {newgradCount}名</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">中途 {midcareerCount}名</span>
          </div>
        </div>

        {/* 要対応タスク */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">要対応タスク</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-gray-900">{actionItems.filter(i => i.urgency === 'high').length}</p>
            <span className="text-sm text-gray-400">件</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">うち高優先 {actionItems.filter(i => i.urgency === 'high').length}件</p>
        </div>

        {/* 内定予測 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="label">内定予測</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-emerald-600">{predictedOffers}</p>
            <span className="text-sm text-gray-400">人</span>
            <span className="text-xs text-gray-300 ml-1">/ {predictedOffersTotal}人中</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">志望度×ペルソナマッチ度からAI算出</p>
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
        <div className="col-span-2 space-y-6">
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">要対応タスク</h2>
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

          {/* 採用分析（AIビッグデータ） */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-900">採用分析（AIビッグデータ）</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* 3指標 */}
              <div className="grid grid-cols-3 gap-3">
                {analyticsMetrics.map((m, i) => {
                  const Icon = m.icon
                  return (
                    <div key={i} className={`${m.bg} rounded-xl p-3`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                        <span className="text-[10px] font-medium text-gray-600">{m.label}</span>
                      </div>
                      <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                    </div>
                  )
                })}
              </div>

              {/* AIプレディクション */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-900">候補者別 AIプレディクション</span>
                </div>
                <div className="space-y-3">
                  {candidates.map((c) => {
                    const cApp = c.applications[0]
                    const pred = PREDICTIONS[c.id] || { offerProb: 50, acceptProb: 60, motivationScore: 50, personaMatch: 50, interestLevel: 50, understandingLevel: 50 }
                    const pColor = getPredColor(pred.offerProb)
                    const aColor = getPredColor(pred.acceptProb)
                    const stageName = cApp?.currentStage === 'casual' ? 'カジュアル面談' :
                      cApp?.currentStage === 'interview_1' ? '一次面接' :
                      cApp?.currentStage === 'interview_2' ? '二次面接' :
                      cApp?.currentStage === 'final' ? '最終面接' : cApp?.currentStage
                    return (
                      <div key={c.id} className="p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-7 h-7 rounded-full ${c.avatarColor} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-[10px] font-bold text-white">{c.avatarInitials[0]}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-900">{c.fullName}</span>
                              <span className="text-[10px] text-gray-400">{stageName}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${pColor.bg} ${pColor.text} font-medium`}>
                            {pred.offerProb >= 75 ? '内定見込み' : pred.offerProb >= 55 ? '中確率' : '要フォロー'}
                          </span>
                        </div>
                        {/* 2つの確率バー */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-gray-500">内定予測</span>
                              <span className={`text-[10px] font-bold ${pColor.text}`}>{pred.offerProb}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pColor.bar}`} style={{ width: `${pred.offerProb}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-gray-500">内定承諾確率</span>
                              <span className={`text-[10px] font-bold ${aColor.text}`}>{pred.acceptProb}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${aColor.bar}`} style={{ width: `${pred.acceptProb}%` }} />
                            </div>
                          </div>
                        </div>
                        {/* 算出根拠 */}
                        <div className="flex gap-2 mt-2">
                          {[
                            { label: '志望度', value: pred.motivationScore },
                            { label: 'ペルソナ一致', value: pred.personaMatch },
                            { label: '興味度', value: pred.interestLevel },
                            { label: '理解度', value: pred.understandingLevel },
                          ].map((factor, fi) => (
                            <div key={fi} className="flex-1 text-center">
                              <p className={`text-[10px] font-bold ${factor.value >= 75 ? 'text-indigo-600' : factor.value >= 55 ? 'text-amber-600' : 'text-red-500'}`}>
                                {factor.value}
                              </p>
                              <p className="text-[9px] text-gray-400">{factor.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  候補者のカルテ・選考履歴をAIが分析し、確率を自動算出しています
                </p>
              </div>
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
