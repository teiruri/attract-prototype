'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileText,
  Share2,
  RefreshCw,
  ChevronDown,
  Brain,
  Briefcase,
  Clock,
  MessageSquare,
  Star,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  AlertCircle,
  UserCheck,
  XCircle,
} from 'lucide-react'

// ─── Mock Data ─────────────────────────────────────────────

const JOBS = [
  { id: 'job_001', title: 'シニアプロダクトマネージャー' },
  { id: 'job_002', title: 'バックエンドエンジニア' },
  { id: 'job_003', title: 'UIUXデザイナー' },
]

const PROGRESS_STATS = {
  targetHires: 3,
  totalApplicants: 12,
  inProcess: 4,
  offers: 1,
  rejected: 7,
  fulfillmentRate: 33,
}

const FUNNEL_STAGES = [
  { label: '応募', count: 12, color: 'bg-indigo-500' },
  { label: '書類通過', count: 8, color: 'bg-blue-500' },
  { label: '一次面接', count: 6, color: 'bg-cyan-500' },
  { label: '二次面接', count: 4, color: 'bg-emerald-500' },
  { label: '最終面接', count: 2, color: 'bg-amber-500' },
  { label: '内定', count: 1, color: 'bg-rose-500' },
]

const HARD_SKILLS = [
  { name: 'React/TypeScript', count: 8, max: 12 },
  { name: 'PM経験', count: 7, max: 12 },
  { name: 'データ分析', count: 6, max: 12 },
  { name: 'Python', count: 5, max: 12 },
  { name: 'AWS', count: 4, max: 12 },
]

const SOFT_SKILLS = [
  { name: 'チームワーク', score: 80 },
  { name: 'コミュニケーション', score: 75 },
  { name: '問題解決力', score: 70 },
  { name: 'リーダーシップ', score: 60 },
  { name: '主体性', score: 55 },
]

const EXPERIENCE_DIST = [
  { range: '1-3年', count: 2 },
  { range: '3-5年', count: 5 },
  { range: '5-10年', count: 4 },
  { range: '10年+', count: 1 },
]

const POSITIVE_THEMES = [
  'プロダクト志向が強い候補者が多い',
  'コミュニケーション能力は全体的に高い',
]

const CONCERN_THEMES = [
  'マネジメント経験が不足している候補者が目立つ',
  '業界知識にバラつきがある',
]

const INTERVIEWER_QUOTE = '「全体的にポテンシャルは高いが、即戦力としてのマネジメント経験を持つ候補者をもう少し集めたい」— 二次面接担当者'

const SURVEY_FEEDBACK = [
  { text: '面接官の質問が的確だった', type: 'positive' as const },
  { text: '会社の魅力が十分に伝わった', type: 'positive' as const },
  { text: '選考結果の連絡が遅い', type: 'improvement' as const },
]

const NEXT_ACTIONS = [
  { text: 'ビズリーチ・LinkedInでのスカウト配信を開始', done: false },
  { text: '面接準備資料にキャリアパス事例を追加', done: false },
  { text: '書類選考→一次面接のリードタイム短縮（目標: 3日以内）', done: false },
  { text: '選考結果通知の48時間以内ルールを設定', done: true },
  { text: '二次面接の評価ルーブリックを作成・共有', done: false },
  { text: 'アンケートでのREVP訴求項目を見直し', done: false },
]

// ─── Component ─────────────────────────────────────────────

export default function RecruitmentSummaryPage() {
  const [selectedJob, setSelectedJob] = useState(JOBS[0].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [actions, setActions] = useState(NEXT_ACTIONS)

  const handleGenerate = () => {
    setIsGenerating(true)
    setReportGenerated(false)
    setTimeout(() => {
      setIsGenerating(false)
      setReportGenerated(true)
    }, 2000)
  }

  const toggleAction = (index: number) => {
    setActions(prev =>
      prev.map((a, i) => (i === index ? { ...a, done: !a.done } : a))
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            採用活動総括
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            求人ごとの採用状況を分析し、成功に向けた施策を提案
          </p>
        </div>

        {/* ── Job Selector + Generate Button ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">対象求人</label>
            <div className="relative">
              <select
                value={selectedJob}
                onChange={e => {
                  setSelectedJob(e.target.value)
                  setReportGenerated(false)
                }}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[320px]"
              >
                {JOBS.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="sm:mt-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  AIが分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  総括レポートを生成
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Generation Animation ── */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <Brain className="w-10 h-10 text-indigo-600 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="mt-6 text-lg font-semibold text-indigo-700">AIが採用データを総合分析しています...</p>
            <p className="mt-2 text-sm text-gray-500">応募者情報・面接評価・アンケート結果を統合中</p>
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Report ── */}
        {reportGenerated && !isGenerating && (
          <div className="space-y-8 animate-in fade-in duration-500">

            {/* ── Section 1: 採用進捗サマリ ── */}
            <section>
              <SectionHeading icon={<TrendingUp className="w-6 h-6" />} title="採用進捗サマリ" />

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard label="目標採用人数" value={`${PROGRESS_STATS.targetHires}名`} icon={<Target className="w-5 h-5 text-indigo-500" />} />
                <StatCard label="現在応募者数" value={`${PROGRESS_STATS.totalApplicants}名`} icon={<Users className="w-5 h-5 text-blue-500" />} />
                <StatCard label="選考中" value={`${PROGRESS_STATS.inProcess}名`} icon={<Clock className="w-5 h-5 text-cyan-500" />} />
                <StatCard label="内定" value={`${PROGRESS_STATS.offers}名`} icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} />
                <StatCard label="辞退・不合格" value={`${PROGRESS_STATS.rejected}名`} icon={<XCircle className="w-5 h-5 text-rose-500" />} />
                <StatCard
                  label="充足率"
                  value={`${PROGRESS_STATS.fulfillmentRate}%`}
                  icon={<BarChart3 className="w-5 h-5 text-amber-500" />}
                  highlight
                />
              </div>

              {/* Funnel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">選考ファネル</h4>
                <div className="flex items-end gap-2 overflow-x-auto pb-2">
                  {FUNNEL_STAGES.map((stage, idx) => {
                    const heightPct = (stage.count / FUNNEL_STAGES[0].count) * 100
                    const conversionRate = idx > 0
                      ? Math.round((stage.count / FUNNEL_STAGES[idx - 1].count) * 100)
                      : 100
                    return (
                      <div key={stage.label} className="flex items-end gap-2 flex-1 min-w-[100px]">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-2xl font-bold text-gray-900 mb-1">{stage.count}</span>
                          <div
                            className={`w-full rounded-t-lg ${stage.color} transition-all duration-700`}
                            style={{ height: `${Math.max(heightPct * 1.6, 24)}px` }}
                          />
                          <span className="text-xs font-medium text-gray-600 mt-2 text-center">{stage.label}</span>
                          {idx > 0 && (
                            <span className="text-xs text-gray-400 mt-0.5">通過率 {conversionRate}%</span>
                          )}
                        </div>
                        {idx < FUNNEL_STAGES.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-300 mb-8 flex-shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* ── Section 2: 応募者プロファイル分析 ── */}
            <section>
              <SectionHeading icon={<Users className="w-6 h-6" />} title="応募者プロファイル分析" />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hard Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    ハードスキル分布
                  </h4>
                  <div className="space-y-3">
                    {HARD_SKILLS.map(skill => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{skill.name}</span>
                          <span className="text-gray-500">{skill.count}名</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${(skill.count / skill.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    ソフトスキル傾向
                  </h4>
                  <div className="space-y-3">
                    {SOFT_SKILLS.map(skill => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{skill.name}</span>
                          <span className="text-gray-500">{skill.score}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${skill.score}%`,
                              background: skill.score >= 70
                                ? 'linear-gradient(to right, #8b5cf6, #a78bfa)'
                                : 'linear-gradient(to right, #c4b5fd, #ddd6fe)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    経験年数分布
                  </h4>
                  <div className="flex items-end gap-4 h-40">
                    {EXPERIENCE_DIST.map(item => {
                      const maxCount = Math.max(...EXPERIENCE_DIST.map(d => d.count))
                      const heightPct = (item.count / maxCount) * 100
                      return (
                        <div key={item.range} className="flex flex-col items-center flex-1">
                          <span className="text-lg font-bold text-gray-900 mb-1">{item.count}名</span>
                          <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-700"
                            style={{ height: `${Math.max(heightPct, 12)}%` }}
                          />
                          <span className="text-xs font-medium text-gray-600 mt-2 text-center">{item.range}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 3: 面接官所感の傾向分析 ── */}
            <section>
              <SectionHeading icon={<MessageSquare className="w-6 h-6" />} title="面接官所感の傾向分析" />

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Positive */}
                <div>
                  <h4 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    ポジティブな傾向
                  </h4>
                  <div className="space-y-3">
                    {POSITIVE_THEMES.map((theme, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl shadow-sm border-l-4 border-emerald-400 p-4"
                      >
                        <p className="text-gray-800 font-medium">{theme}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concerns */}
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    懸念事項
                  </h4>
                  <div className="space-y-3">
                    {CONCERN_THEMES.map((theme, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl shadow-sm border-l-4 border-amber-400 p-4"
                      >
                        <p className="text-gray-800 font-medium">{theme}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interviewer Quote */}
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-6 border border-gray-200">
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 italic leading-relaxed">{INTERVIEWER_QUOTE}</p>
                    <p className="text-xs text-gray-400 mt-2">面接官フィードバックより（匿名化済み）</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 4: アンケート・サーベイ分析 ── */}
            <section>
              <SectionHeading icon={<Star className="w-6 h-6" />} title="アンケート・サーベイ分析" />

              <div className="grid md:grid-cols-2 gap-6">
                {/* Satisfaction Score */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">選考プロセス満足度</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-extrabold text-indigo-600">4.2</div>
                    <div>
                      <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">/ 5.0（回答数: 9名）</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {SURVEY_FEEDBACK.map((fb, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {fb.type === 'positive' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${fb.type === 'positive' ? 'text-gray-700' : 'text-amber-700 font-medium'}`}>
                          {fb.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* REVP Gap */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">REVPギャップ分析</h4>
                  <p className="text-sm text-gray-600 mb-4">候補者の期待値 vs. 選考中のアピール度</p>

                  <div className="space-y-4">
                    {[
                      { item: '報酬・待遇', expect: 78, actual: 72 },
                      { item: '働きがい', expect: 85, actual: 60 },
                      { item: '成長機会', expect: 90, actual: 55 },
                      { item: '企業文化', expect: 70, actual: 75 },
                      { item: 'ワークライフバランス', expect: 75, actual: 70 },
                    ].map(item => {
                      const gap = item.actual - item.expect
                      const isGap = gap < -10
                      return (
                        <div key={item.item}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`font-medium ${isGap ? 'text-red-700' : 'text-gray-700'}`}>
                              {item.item} {isGap && '⚠'}
                            </span>
                            <span className="text-xs text-gray-400">
                              期待 {item.expect} / 訴求 {item.actual}
                            </span>
                          </div>
                          <div className="flex gap-1 items-center">
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                              <div
                                className="absolute h-full bg-blue-200 rounded-full"
                                style={{ width: `${item.expect}%` }}
                              />
                              <div
                                className={`absolute h-full rounded-full ${isGap ? 'bg-red-400' : 'bg-emerald-400'}`}
                                style={{ width: `${item.actual}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded bg-blue-200 inline-block" /> 候補者期待値
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded bg-emerald-400 inline-block" /> 訴求度
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded bg-red-400 inline-block" /> ギャップあり
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 5: AI施策提案 ── */}
            <section>
              <SectionHeading icon={<Lightbulb className="w-6 h-6" />} title="AI施策提案" />

              <div className="space-y-4">
                {/* Critical */}
                <PriorityCard
                  level="critical"
                  label="最優先"
                  title="マネジメント経験者の母集団を拡大"
                  description="現在の応募チャネル（Wantedly中心）に加え、ビズリーチ・LinkedIn経由でのスカウトを強化。PM経験5年以上＋チームリード経験者をターゲットに。"
                  metric="期待効果: 母集団+40%（2ヶ月以内）"
                />

                {/* Important */}
                <PriorityCard
                  level="important"
                  label="重要"
                  title="面接プロセスの迅速化"
                  description="書類選考→一次面接の平均リードタイムが7日。3日以内に短縮し、優秀な候補者の離脱を防止。"
                  metric="現状リードタイム: 7日 → 目標: 3日"
                />
                <PriorityCard
                  level="important"
                  label="重要"
                  title="REVP「成長機会」の訴求強化"
                  description="面接時に具体的なキャリアパス事例を提示。入社2年でマネージャーに昇格した事例などを面接準備資料に追加。"
                  metric="期待効果: 候補者志望度+15pt"
                />

                {/* Recommended */}
                <PriorityCard
                  level="recommended"
                  label="改善推奨"
                  title="候補者体験の向上"
                  description="選考結果通知を48時間以内に統一。自動リマインダー機能を活用。"
                  metric="期待効果: 候補者満足度 4.2→4.5"
                />
                <PriorityCard
                  level="recommended"
                  label="改善推奨"
                  title="二次面接の評価基準を明確化"
                  description="戦略思考の評価が面接官間でブレている。評価ルーブリックの共有を推奨。"
                  metric="期待効果: 面接官間評価一致率+20%"
                />
              </div>
            </section>

            {/* ── Section 6: 次回アクション ── */}
            <section>
              <SectionHeading icon={<CheckCircle className="w-6 h-6" />} title="次回アクション" />

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-4">AI分析結果に基づくアクションアイテム</p>
                <div className="space-y-3">
                  {actions.map((action, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        action.done ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={action.done}
                        onChange={() => toggleAction(idx)}
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm ${action.done ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                        {action.text}
                      </span>
                      {action.done && (
                        <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          対応済み
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-6 gap-4">
              <p className="text-sm text-gray-500">
                レポート生成日: 2026年3月23日
              </p>
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4" />
                  PDF出力
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
                  <Share2 className="w-4 h-4" />
                  チームに共有
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── Empty state before generation ── */}
        {!reportGenerated && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              レポート未生成
            </h3>
            <p className="text-gray-500 max-w-md">
              上部の「総括レポートを生成」ボタンをクリックすると、AIが選択中の求人に対する採用活動を総合的に分析し、施策を提案します。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-indigo-600">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-4 ${
        highlight ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-medium text-gray-500">{label}</span></div>
      <p className={`text-2xl font-bold ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function PriorityCard({
  level,
  label,
  title,
  description,
  metric,
}: {
  level: 'critical' | 'important' | 'recommended'
  label: string
  title: string
  description: string
  metric: string
}) {
  const styles = {
    critical: {
      border: 'border-l-red-500',
      badge: 'bg-red-100 text-red-700',
      dot: 'bg-red-500',
    },
    important: {
      border: 'border-l-amber-500',
      badge: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    },
    recommended: {
      border: 'border-l-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    },
  }
  const s = styles[level]

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${s.border} border border-gray-100 p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{label}</span>
      </div>
      <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{description}</p>
      <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
        <TrendingUp className="w-3.5 h-3.5" />
        {metric}
      </div>
    </div>
  )
}
