'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Star,
  Users,
  Heart,
  Briefcase,
  GraduationCap,
  Shield,
  Sparkles,
  ArrowRight,
  Target,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Building,
  Zap,
} from 'lucide-react'

// EVP 7大項目のスコアデータ
const EVP_SCORES = [
  { key: 'compensation', label: '報酬・福利厚生', score: 2.92, icon: '💰', color: 'amber' },
  { key: 'work_content', label: '仕事内容・やりがい', score: 3.38, icon: '🎯', color: 'blue' },
  { key: 'career', label: 'キャリア開発・成長機会', score: 3.23, icon: '📈', color: 'indigo' },
  { key: 'environment', label: '職場環境・人間関係', score: 4.08, icon: '🤝', color: 'emerald' },
  { key: 'wlb', label: '働き方・WLB', score: 3.46, icon: '⚖️', color: 'teal' },
  { key: 'culture', label: '企業文化・風土', score: 3.23, icon: '🏢', color: 'purple' },
  { key: 'leadership', label: '経営・リーダーシップ', score: 2.77, icon: '👔', color: 'rose' },
]

// 認識ギャップデータ
const GAP_DATA = [
  { label: '報酬', hr: 2.0, junior: 2.7, mid: 3.2, newHire: 4.0 },
  { label: '仕事内容', hr: 2.0, junior: 3.0, mid: 3.5, newHire: 4.0 },
  { label: '成長環境', hr: 2.5, junior: 3.5, mid: 3.5, newHire: 4.5 },
  { label: '人間関係', hr: 2.5, junior: 3.8, mid: 4.0, newHire: 4.5 },
  { label: 'WLB', hr: 2.5, junior: 3.0, mid: 4.0, newHire: 4.0 },
  { label: 'カルチャー', hr: 2.5, junior: 2.9, mid: 3.7, newHire: 4.0 },
  { label: '経営', hr: 2.0, junior: 2.9, mid: 2.9, newHire: 3.5 },
]

// 職種別比較データ
const JOB_COMPARISON = [
  { label: '報酬・福利厚生', all: 2.92, se: 2.89, pg: 3.0 },
  { label: '仕事内容・やりがい', all: 3.38, se: 3.11, pg: 4.0 },
  { label: 'キャリア開発・成長機会', all: 3.23, se: 3.33, pg: 3.0 },
  { label: '職場環境・人間関係', all: 4.08, se: 4.11, pg: 4.0 },
  { label: '働き方・WLB', all: 3.46, se: 3.78, pg: 2.75 },
  { label: '企業文化・風土', all: 3.23, se: 3.44, pg: 2.75 },
  { label: '経営・リーダーシップ', all: 2.77, se: 2.78, pg: 2.75 },
]

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100
  const color = score >= 3.5 ? 'bg-emerald-500' : score >= 3.0 ? 'bg-indigo-500' : score >= 2.5 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${score >= 3.5 ? 'text-emerald-600' : score >= 3.0 ? 'text-indigo-600' : score >= 2.5 ? 'text-amber-600' : 'text-red-500'}`}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

type TabKey = 'summary' | 'gap' | 'journey' | 'actions'

export default function RevpReportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('summary')

  const tabs: { id: TabKey; label: string }[] = [
    { id: 'summary', label: 'EVPサマリー' },
    { id: 'gap', label: '認識ギャップ分析' },
    { id: 'journey', label: '採用ジャーニー分析' },
    { id: 'actions', label: '改善アクション' },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/settings" className="hover:text-gray-600">設定</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">REVP診断レポート</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">REVP診断レポート</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">株式会社プラスパシステムズ — 2026年3月20日 診断</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-400">調査対象</p>
              <p className="text-sm font-semibold text-gray-700">社員13名 / 内定者2名 / HR2名</p>
            </div>
            <button className="btn-secondary text-sm">PDF出力</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* ======================== EVPサマリー ======================== */}
        {activeTab === 'summary' && (
          <div className="space-y-6 max-w-6xl">
            {/* KPI Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="card p-5 text-center">
                <p className="text-[10px] text-gray-400 mb-1">総合満足度</p>
                <p className="text-3xl font-bold text-indigo-600">60.8<span className="text-sm">%</span></p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-[10px] text-gray-400 mb-1">NPS（推奨度）</p>
                <p className="text-3xl font-bold text-emerald-600">+18.2</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-[10px] text-gray-400 mb-1">EVP評価レベル</p>
                <p className="text-sm font-bold text-amber-600 mt-1">軽度のズレ</p>
                <p className="text-[10px] text-gray-400">改善余地あり</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-[10px] text-gray-400 mb-1">組織タイプ</p>
                <p className="text-sm font-bold text-indigo-600 mt-1">関係性重視</p>
                <p className="text-[10px] text-gray-400">×安定志向型</p>
              </div>
            </div>

            {/* NPS Distribution */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">推奨度スコア分布</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex h-6 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 flex items-center justify-center" style={{ width: '36.4%' }}>
                      <span className="text-[10px] text-white font-bold">36.4%</span>
                    </div>
                    <div className="bg-gray-300 flex items-center justify-center" style={{ width: '45.5%' }}>
                      <span className="text-[10px] text-gray-700 font-bold">45.5%</span>
                    </div>
                    <div className="bg-red-400 flex items-center justify-center" style={{ width: '18.2%' }}>
                      <span className="text-[10px] text-white font-bold">18.2%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />推奨者</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />中立者</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />批判者</span>
                </div>
              </div>
            </div>

            {/* EVP 7項目スコア */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">EVP 7項目スコア</h3>
                <p className="text-[10px] text-gray-400">5段階評価（回答者13名）</p>
              </div>
              <div className="p-5 space-y-3">
                {EVP_SCORES.map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-base w-6">{item.icon}</span>
                    <span className="text-xs text-gray-700 w-44 flex-shrink-0">{item.label}</span>
                    <div className="flex-1">
                      <ScoreBar score={item.score} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 強み・課題 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-900">コア強み（差別化要因）</h3>
                </div>
                <div className="space-y-2">
                  {[
                    '「人間関係」は重要度・満足度ともに高く安定',
                    '「WLB」「仕事内容」も一定の満足水準を確保',
                    '安心して働ける基盤が整った堅実でバランスの取れた組織',
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-gray-900">最大の爆弾軸：報酬</h3>
                </div>
                <div className="bg-red-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-red-700 font-medium">重要度 4.4 / 満足度 2.9</span>
                    <span className="badge bg-red-100 text-red-700">ギャップ: 1.5</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                      <p className="text-[9px] text-red-400 mt-0.5">重要度</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '58%' }} />
                      </div>
                      <p className="text-[9px] text-red-400 mt-0.5">満足度</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">報酬は重要度が高い一方で満足度が大きく下回っており、期待とのギャップが顕在化しています</p>
              </div>
            </div>

            {/* 入社後ギャップ */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">入社後のギャップ分析</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-emerald-600 mb-2 uppercase tracking-wide">ポジティブギャップ（期待以上）</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
                      <span className="text-xs text-emerald-800">同僚との人間関係</span>
                      <span className="text-xs font-bold text-emerald-600">+50%</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
                      <span className="text-xs text-emerald-800">休暇・WLB</span>
                      <span className="text-xs font-bold text-emerald-600">+46%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-red-600 mb-2 uppercase tracking-wide">ネガティブギャップ（期待未満）</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                      <span className="text-xs text-red-800">給与・報酬水準</span>
                      <span className="text-xs font-bold text-red-600">-23%</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                      <span className="text-xs text-red-800">評価・フィードバック頻度</span>
                      <span className="text-xs font-bold text-red-600">-15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================== 認識ギャップ分析 ======================== */}
        {activeTab === 'gap' && (
          <div className="space-y-6 max-w-6xl">
            {/* レーダー風テーブル */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">認識ギャップ可視化：HR × 中堅社員 × 若手社員 × 内定者</h3>
              </div>
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">項目</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">HR</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">若手社員</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">中堅社員</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">内定者</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">最大ギャップ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GAP_DATA.map((row, i) => {
                        const maxGap = Math.max(row.hr, row.junior, row.mid, row.newHire) - Math.min(row.hr, row.junior, row.mid, row.newHire)
                        return (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2.5 pr-4 font-medium text-gray-700">{row.label}</td>
                            {[row.hr, row.junior, row.mid, row.newHire].map((v, j) => (
                              <td key={j} className="text-center py-2.5 px-3">
                                <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                                  v >= 3.5 ? 'bg-emerald-50 text-emerald-700' :
                                  v >= 3.0 ? 'bg-indigo-50 text-indigo-700' :
                                  v >= 2.5 ? 'bg-amber-50 text-amber-700' :
                                  'bg-red-50 text-red-700'
                                }`}>{v.toFixed(1)}</span>
                              </td>
                            ))}
                            <td className="text-center py-2.5 px-3">
                              <span className={`font-bold ${maxGap >= 1.5 ? 'text-red-600' : maxGap >= 1.0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                {maxGap.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-gray-400 mt-3">※ 最大ギャップが1.5以上の項目は認識のズレが大きく、採用メッセージの見直しが必要です</p>
              </div>
            </div>

            {/* ギャップ分析コメント */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900">AI分析コメント</h3>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-indigo-800 leading-relaxed">
                  最大ギャップは報酬（gap 2.0）で、内定者4.0に対しHR2.0と乖離があります。
                  成長環境・人間関係も同様に内定者高/HR低の傾向です。
                  一方、仕事内容等はHR低/現場高で、評価のねじれが示唆されます。
                  HRの自己評価が全体的に低く、自社の魅力を正しく認識できていない可能性があります。
                </p>
              </div>
            </div>

            {/* 職種別比較 */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">職種間EVP比較（全体 × SE職 × PG職）</h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {JOB_COMPARISON.map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-600 w-40 flex-shrink-0">{row.label}</span>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        {[
                          { label: '全体', value: row.all },
                          { label: 'SE', value: row.se },
                          { label: 'PG', value: row.pg },
                        ].map((col, j) => (
                          <div key={j}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] text-gray-400">{col.label}</span>
                              <span className={`text-[10px] font-bold ${col.value >= 3.5 ? 'text-emerald-600' : col.value >= 3.0 ? 'text-indigo-600' : col.value >= 2.5 ? 'text-amber-600' : 'text-red-500'}`}>
                                {col.value.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${col.value >= 3.5 ? 'bg-emerald-500' : col.value >= 3.0 ? 'bg-indigo-500' : col.value >= 2.5 ? 'bg-amber-500' : 'bg-red-400'}`}
                                style={{ width: `${(col.value / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 合う人/合わない人 */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">合う人／合わない人 ギャップレンズ</h3>
              <p className="text-[10px] text-gray-400 mb-3">社員 vs HR 全体一致度: <span className="font-bold text-red-600">32%</span>（低水準）</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium text-emerald-700 mb-2">コア合意ゾーン</p>
                  <div className="space-y-1">
                    {['認識合わせ', '自走・試行錯誤', '継続力'].map((t, i) => (
                      <span key={i} className="inline-block badge bg-emerald-100 text-emerald-700 mr-1 mb-1">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium text-blue-700 mb-2">現場社員の理想ゾーン</p>
                  <div className="space-y-1">
                    {['変化ストレス耐性', '越境行動', '学習意欲'].map((t, i) => (
                      <span key={i} className="inline-block badge bg-blue-100 text-blue-700 mr-1 mb-1">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-violet-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium text-violet-700 mb-2">HR・採用側の理想ゾーン</p>
                  <div className="space-y-1">
                    {['変化を捉える', '意思決定', 'チーム協働'].map((t, i) => (
                      <span key={i} className="inline-block badge bg-violet-100 text-violet-700 mr-1 mb-1">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================== 採用ジャーニー分析 ======================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6 max-w-6xl">
            {/* 感情カーブ */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">採用ジャーニー感情カーブ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">ステージ</th>
                      <th className="text-center py-2 text-gray-500 font-medium">内定者</th>
                      <th className="text-center py-2 text-gray-500 font-medium">新卒1年目</th>
                      <th className="text-center py-2 text-gray-500 font-medium">新卒2年目</th>
                      <th className="text-center py-2 text-gray-500 font-medium">HR評価</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { stage: '認知〜インターン', v: [3.5, 3.0, 3.0, 1.75] },
                      { stage: '選考フェーズ', v: [5.0, 3.67, 3.75, 2.0] },
                      { stage: '最終面接', v: [5.0, 4.0, 4.0, 2.5] },
                      { stage: '内定出し', v: [4.5, 3.67, 3.67, 2.5] },
                      { stage: '内定後フォロー', v: [4.5, 4.0, 4.0, 2.0] },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2.5 font-medium text-gray-700">{row.stage}</td>
                        {row.v.map((val, j) => (
                          <td key={j} className="text-center py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <div key={s} className={`w-2 h-2 rounded-full ${s <= Math.round(val) ? (j === 3 ? 'bg-red-400' : 'bg-indigo-500') : 'bg-gray-200'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-gray-500">{val.toFixed(1)}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-3">※ HR評価が全ステージで低く、採用プロセスへの自己評価と候補者体験に大きな乖離があります</p>
            </div>

            {/* 志望度が上がった瞬間 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-gray-900">志望度が上がった瞬間</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { who: '内定者', text: '最終選考前の面談で仕事や職場を丁寧に説明してもらえた' },
                    { who: '新卒1年目', text: '面接で働く環境が良いと判明、一次面接で社長が見てくれた' },
                    { who: '新卒2年目', text: 'リクルーター面談で気軽に質問でき将来像が見えた' },
                  ].map((item, i) => (
                    <div key={i} className="bg-emerald-50 rounded-lg p-3">
                      <span className="badge bg-emerald-100 text-emerald-700 mb-1">{item.who}</span>
                      <p className="text-xs text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-900">内定承諾の決め手</h3>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['社員の雰囲気', '教育制度の手厚さ', '働きやすい環境', '誠実な選考対応', '選考スピード'].map((kw, i) => (
                    <span key={i} className="badge bg-indigo-50 text-indigo-700">{kw}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-medium text-amber-700">内定承諾時の不安</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['業務内容の具体例不足', '初月給与の支給有無', '他社選考との比較迷い'].map((kw, i) => (
                    <span key={i} className="badge bg-amber-50 text-amber-700">{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ファネルヘルスチェック */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">採用ファネル ヘルスチェック（HR自己評価）</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '採用企画・戦略', avg: 2.9, items: [
                    { name: '採用コンセプト設計', score: 2.0 },
                    { name: 'ターゲット像の定義', score: 2.5 },
                    { name: '採用メッセージ・強み明確化', score: 2.5 },
                    { name: '実態との整合性', score: 3.5 },
                  ]},
                  { label: '採用チャネル', avg: 2.6, items: [
                    { name: 'チャネル設計・運用', score: 3.0 },
                    { name: '複数チャネル活用', score: 1.5 },
                    { name: 'チャネルKPI設定', score: 1.5 },
                    { name: 'SNS発信・運用', score: 4.5 },
                  ]},
                  { label: '採用体制', avg: 3.8, items: [
                    { name: '採用責任の明確化', score: 2.0 },
                    { name: '役割分担の明文化', score: 4.0 },
                    { name: '他部署との連携', score: 4.0 },
                    { name: '定例会議・振り返り', score: 4.0 },
                  ]},
                ].map((section, i) => (
                  <div key={i} className={`rounded-xl p-4 ${section.avg >= 3.5 ? 'bg-emerald-50' : section.avg >= 3.0 ? 'bg-indigo-50' : 'bg-amber-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">{section.label}</span>
                      <span className={`text-sm font-bold ${section.avg >= 3.5 ? 'text-emerald-600' : section.avg >= 3.0 ? 'text-indigo-600' : 'text-amber-600'}`}>
                        {section.avg.toFixed(1)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {section.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600">{item.name}</span>
                          <ScoreBar score={item.score} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================== 改善アクション ======================== */}
        {activeTab === 'actions' && (
          <div className="space-y-6 max-w-6xl">
            {/* 4つのアプローチ */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-900">今すぐ取り掛かるべき4つのアプローチ</h3>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                {[
                  {
                    num: 1,
                    title: 'EVPの再定義と統一',
                    desc: '仕事内容・成長環境・人間関係を現場社員ヒアリングを基に再定義し、採用資料・面接トーク・内定者フォロー資料の表現を統一するプロジェクトを即時立ち上げる',
                    color: 'indigo',
                  },
                  {
                    num: 2,
                    title: '期待値調整の仕組み化',
                    desc: '最終面接前後に報酬水準・昇給方針・経営方針の現状と背景を具体的に説明する共通説明シートを作成し、期待値調整の面談を必須プロセスとして組み込む',
                    color: 'emerald',
                  },
                  {
                    num: 3,
                    title: '育成の標準化',
                    desc: '配属・育成のばらつきを抑えるため、入社後一定期間の育成ステップと指導項目を標準化し、配属前に受入部署と人事で合意確認を行う運用ルールを設ける',
                    color: 'amber',
                  },
                  {
                    num: 4,
                    title: '仕事内容の解像度向上',
                    desc: 'インターンから選考初期にかけて、実際の業務事例・一日の流れ・若手社員の失敗と成長事例を具体的に開示し、仕事内容の解像度を高めるコンテンツへ刷新する',
                    color: 'violet',
                  },
                ].map((approach) => (
                  <div key={approach.num} className={`border-2 border-${approach.color}-200 rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-7 h-7 rounded-lg bg-${approach.color}-100 text-${approach.color}-700 flex items-center justify-center text-sm font-bold`}>
                        {approach.num}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900">{approach.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{approach.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* HINTセクション */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">改善HINT（3つの施策）</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: '強み再定義', desc: '仕事内容ややりがいを採用サイトで現場事例として具体化し、言語を再設計', icon: '🎯' },
                  { title: '現場体感設計', desc: '人間関係やWLBの実態を内定者面談で社員対話として体感させる設計', icon: '🤝' },
                  { title: '期待値調整', desc: '報酬や経営方針の現状を選考終盤で数値と背景込みで説明する場を設ける', icon: '⚖️' },
                ].map((hint, i) => (
                  <div key={i} className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{hint.icon}</span>
                      <span className="text-xs font-semibold text-amber-800">{hint.title}</span>
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed">{hint.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 総括 */}
            <div className="card p-5 bg-gradient-to-r from-indigo-50 to-violet-50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">採用課題とアプローチの総括</h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                現状の採用活動は、内定直前までは高い期待を醸成できている一方、入社後に仕事内容や環境に対する評価がやや落ち着く構造が見られ、
                期待と実態の間にギャップが生じている状態と推察されます。
                特に報酬や成長環境などの認識が立場ごとにねじれており、強みの定義と伝達が統一されていないことが課題の所在と考えられます。
                また、配属・育成のばらつきが体験の安定性を損ね、採用と現場運用が分断している可能性があります。
              </p>
            </div>

            {/* カケハシOS連携 */}
            <div className="card p-5 border-2 border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-indigo-900">カケハシOSへの反映</h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                このREVP診断結果は、カケハシOSの以下の機能に自動反映されます：
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: 'Attract戦略ボード', desc: 'EVPの強み項目を訴求ポイントとして候補者別に最適化', href: '/candidates/cand_001/attract' },
                  { title: '企業魅力プロファイル', desc: '7項目のスコアを反映し、候補者への訴求軸を自動更新', href: '/settings/attraction-profile' },
                  { title: 'フィードバックレター', desc: '志望度が上がるポイントをレターのAttractセクションに活用', href: '/candidates/cand_001/feedback-letter' },
                ].map((link, i) => (
                  <Link key={i} href={link.href} className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors block">
                    <p className="text-xs font-semibold text-indigo-800 mb-1">{link.title}</p>
                    <p className="text-[10px] text-indigo-600">{link.desc}</p>
                    <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1">
                      確認する <ArrowRight className="w-3 h-3" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
