'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Building2,
  Award,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  Briefcase,
  TrendingUp,
  Clock,
  UserCheck,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────

interface DepartmentHistory {
  year: number
  department: string
  role: string
}

interface AwardRecord {
  year: number
  title: string
}

interface Employee {
  id: string
  lastName: string
  firstName: string
  department: string
  role: string
  hireYear: number
  birthYear: number
  initialDepartment: string
  departmentHistory: DepartmentHistory[]
  achievements: string[]
  awards: AwardRecord[]
  skills: string[]
  lastUpdated: string
  needsUpdate: boolean
  avatarColor: string
}

// ─── Mock Data ──────────────────────────────────────────────────────

const employees: Employee[] = [
  {
    id: 'emp-001',
    lastName: '山田',
    firstName: '太郎',
    department: '営業本部',
    role: '部長',
    hireYear: 2010,
    birthYear: 1986,
    initialDepartment: '営業本部',
    departmentHistory: [
      { year: 2010, department: '営業本部', role: '営業担当' },
      { year: 2013, department: 'マーケティング部', role: 'プランナー' },
      { year: 2016, department: '営業本部', role: 'リーダー' },
      { year: 2019, department: '営業本部', role: 'マネージャー' },
      { year: 2022, department: '営業本部', role: '部長' },
    ],
    achievements: [
      '大手クライアント3社との新規取引開始（年間売上2億円）',
      '営業プロセス改革プロジェクトを主導、成約率を25%改善',
      '新人営業研修プログラムの設計・実施',
      'マーケティング経験を活かしたクロスセル戦略の立案・実行',
    ],
    awards: [
      { year: 2021, title: '社長賞（営業部門最優秀成績）' },
      { year: 2018, title: '年間MVP賞' },
    ],
    skills: ['法人営業', 'マネジメント', '戦略立案', 'マーケティング', 'プレゼンテーション', '交渉力'],
    lastUpdated: '2026-02-15',
    needsUpdate: false,
    avatarColor: 'bg-indigo-500',
  },
  {
    id: 'emp-002',
    lastName: '佐々木',
    firstName: '美和',
    department: '人事部',
    role: 'マネージャー',
    hireYear: 2015,
    birthYear: 1991,
    initialDepartment: '人事部',
    departmentHistory: [
      { year: 2015, department: '人事部', role: '採用担当' },
      { year: 2018, department: '人事部', role: 'シニア採用担当' },
      { year: 2021, department: '人事部', role: 'チームリーダー' },
      { year: 2024, department: '人事部', role: 'マネージャー' },
    ],
    achievements: [
      '新卒採用の応募数を前年比180%に増加',
      'オンボーディングプログラムの刷新（離職率15%改善）',
      'HR Tech導入プロジェクトのPMを担当',
      'ダイバーシティ推進委員会の立ち上げ',
    ],
    awards: [{ year: 2023, title: '人事部門ベストプラクティス賞' }],
    skills: ['採用戦略', '労務管理', 'タレントマネジメント', '組織開発', 'HR Tech', 'コーチング'],
    lastUpdated: '2026-03-10',
    needsUpdate: false,
    avatarColor: 'bg-rose-500',
  },
  {
    id: 'emp-003',
    lastName: '中村',
    firstName: '翔太',
    department: 'エンジニアリング部',
    role: 'テックリード',
    hireYear: 2018,
    birthYear: 1995,
    initialDepartment: 'エンジニアリング部',
    departmentHistory: [
      { year: 2018, department: 'エンジニアリング部', role: 'ジュニアエンジニア' },
      { year: 2020, department: 'エンジニアリング部', role: 'エンジニア' },
      { year: 2022, department: 'エンジニアリング部', role: 'シニアエンジニア' },
      { year: 2024, department: 'エンジニアリング部', role: 'テックリード' },
    ],
    achievements: [
      '社内SaaSプラットフォームのアーキテクチャ設計・開発',
      'マイクロサービス移行プロジェクトをリード',
      'CI/CDパイプラインの構築により、デプロイ時間を70%短縮',
      '技術ブログの執筆（月間PV 10,000超）',
    ],
    awards: [{ year: 2023, title: '技術革新賞' }],
    skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'システム設計', 'チームビルディング'],
    lastUpdated: '2026-03-18',
    needsUpdate: false,
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'emp-004',
    lastName: '高橋',
    firstName: '由美',
    department: 'マーケティング部',
    role: 'シニアマネージャー',
    hireYear: 2012,
    birthYear: 1988,
    initialDepartment: '営業本部',
    departmentHistory: [
      { year: 2012, department: '営業本部', role: '営業担当' },
      { year: 2015, department: 'マーケティング部', role: 'マーケター' },
      { year: 2018, department: 'マーケティング部', role: 'リーダー' },
      { year: 2021, department: 'マーケティング部', role: 'マネージャー' },
      { year: 2024, department: 'マーケティング部', role: 'シニアマネージャー' },
    ],
    achievements: [
      'ブランドリニューアルプロジェクトの総指揮',
      'デジタルマーケティング戦略によりリード獲得を3倍に',
      'グッドデザイン賞受賞プロダクトのマーケティング戦略立案',
      'マーケティング予算の最適化（ROI 40%改善）',
    ],
    awards: [
      { year: 2022, title: 'マーケティング部門年間最優秀賞' },
      { year: 2020, title: 'クリエイティブ賞' },
    ],
    skills: ['ブランド戦略', 'デジタルマーケティング', 'クリエイティブディレクション', 'データ分析', 'PR', 'コンテンツ企画'],
    lastUpdated: '2026-01-20',
    needsUpdate: true,
    avatarColor: 'bg-amber-500',
  },
  {
    id: 'emp-005',
    lastName: '伊藤',
    firstName: '大輝',
    department: '営業本部',
    role: 'リーダー',
    hireYear: 2019,
    birthYear: 1996,
    initialDepartment: '営業本部',
    departmentHistory: [
      { year: 2019, department: '営業本部', role: '営業担当' },
      { year: 2022, department: '営業本部', role: 'シニア営業担当' },
      { year: 2024, department: '営業本部', role: 'リーダー' },
    ],
    achievements: [
      '入社2年目で営業成績トップを達成',
      '新規顧客開拓で年間売上1.5億円を達成',
      'セールスイネーブルメントツールの導入・推進',
      'チームの商談成約率を30%向上',
    ],
    awards: [{ year: 2021, title: '営業成績トップ賞（新人部門）' }],
    skills: ['法人営業', '新規開拓', 'ソリューション提案', 'CRM活用', 'チームリード', 'プレゼンテーション'],
    lastUpdated: '2026-03-05',
    needsUpdate: false,
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'emp-006',
    lastName: '小林',
    firstName: '沙織',
    department: 'カスタマーサクセス部',
    role: 'リーダー',
    hireYear: 2020,
    birthYear: 1997,
    initialDepartment: 'カスタマーサクセス部',
    departmentHistory: [
      { year: 2020, department: 'カスタマーサクセス部', role: 'CSアソシエイト' },
      { year: 2022, department: 'カスタマーサクセス部', role: 'CSスペシャリスト' },
      { year: 2024, department: 'カスタマーサクセス部', role: 'リーダー' },
    ],
    achievements: [
      '顧客満足度スコアを85%→95%に改善',
      'オンボーディングフローの再設計（解約率20%改善）',
      'カスタマーヘルススコアの設計・運用',
      'ユーザーコミュニティの立ち上げ・運営',
    ],
    awards: [],
    skills: ['カスタマーサクセス', '顧客分析', 'オンボーディング', 'CRM', 'データ分析', 'コミュニケーション'],
    lastUpdated: '2026-02-28',
    needsUpdate: false,
    avatarColor: 'bg-teal-500',
  },
  {
    id: 'emp-007',
    lastName: '渡辺',
    firstName: '健一',
    department: '経営企画部',
    role: 'マネージャー',
    hireYear: 2013,
    birthYear: 1985,
    initialDepartment: '経理部',
    departmentHistory: [
      { year: 2013, department: '経理部', role: '経理担当' },
      { year: 2016, department: '経営企画部', role: 'アナリスト' },
      { year: 2018, department: '経営企画部', role: 'シニアアナリスト' },
      { year: 2021, department: '経営企画部', role: 'マネージャー' },
    ],
    achievements: [
      '中期経営計画の策定をリード',
      'M&Aデューデリジェンス3件を主導',
      '全社KPIダッシュボードの設計・導入',
      'MBA取得（在職中、一橋大学）',
    ],
    awards: [{ year: 2022, title: '経営貢献賞' }],
    skills: ['経営戦略', '財務分析', 'M&A', 'KPI設計', 'MBA', 'データ分析', 'プロジェクトマネジメント'],
    lastUpdated: '2025-12-10',
    needsUpdate: true,
    avatarColor: 'bg-violet-500',
  },
  {
    id: 'emp-008',
    lastName: '松本',
    firstName: 'あかり',
    department: 'エンジニアリング部',
    role: 'エンジニア',
    hireYear: 2022,
    birthYear: 1999,
    initialDepartment: 'エンジニアリング部',
    departmentHistory: [
      { year: 2022, department: 'エンジニアリング部', role: 'ジュニアエンジニア' },
      { year: 2024, department: 'エンジニアリング部', role: 'エンジニア' },
    ],
    achievements: [
      '入社半年で社内ツールの新機能を単独開発・リリース',
      'ハッカソンで最優秀賞を受賞',
      'フロントエンドのパフォーマンス改善（LCP 40%短縮）',
      '新卒採用のメンター担当（2名のオンボーディング支援）',
    ],
    awards: [{ year: 2023, title: '社内ハッカソン最優秀賞' }],
    skills: ['React', 'TypeScript', 'Next.js', 'CSS設計', 'UI/UX', 'ペアプログラミング'],
    lastUpdated: '2026-03-20',
    needsUpdate: false,
    avatarColor: 'bg-pink-500',
  },
]

// ─── Helper ─────────────────────────────────────────────────────────

const CURRENT_YEAR = 2026

function calcAge(birthYear: number) {
  return CURRENT_YEAR - birthYear
}

function avgTenure() {
  const total = employees.reduce((s, e) => s + (CURRENT_YEAR - e.hireYear), 0)
  return (total / employees.length).toFixed(1)
}

function updateRate() {
  const recent = employees.filter((e) => !e.needsUpdate).length
  return Math.round((recent / employees.length) * 100)
}

const allDepartments = Array.from(new Set(employees.map((e) => e.department)))

// ─── Component ──────────────────────────────────────────────────────

export default function EmployeeTalentPoolPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (deptFilter !== 'all' && e.department !== deptFilter) return false
      if (yearFilter !== 'all') {
        const y = Number(yearFilter)
        if (y === 2020 && e.hireYear < 2020) return false
        if (y === 2015 && (e.hireYear < 2015 || e.hireYear >= 2020)) return false
        if (y === 2010 && (e.hireYear < 2010 || e.hireYear >= 2015)) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const full = `${e.lastName}${e.firstName}${e.department}${e.role}${e.skills.join('')}`
        return full.toLowerCase().includes(q)
      }
      return true
    })
  }, [searchQuery, deptFilter, yearFilter])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">社員タレントプール</h1>
          <p className="text-sm text-gray-500 mt-1">
            社員情報を活用し、候補者へのアトラクトに活かす
          </p>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          label="登録社員数"
          value={`${employees.length}名`}
        />
        <StatCard
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          label="部署数"
          value={`${allDepartments.length}部署`}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          label="平均在籍年数"
          value={`${avgTenure()}年`}
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-amber-600" />}
          label="更新率"
          value={`${updateRate()}%`}
        />
      </div>

      {/* ── Search / Filter Bar ────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="社員名・部署・スキルで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">すべての部署</option>
              {allDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">入社年度</option>
              <option value="2020">2020年〜</option>
              <option value="2015">2015年〜2019年</option>
              <option value="2010">2010年〜2014年</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            絞り込み
          </button>
        </div>
      </div>

      {/* ── Employee Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((emp) => (
          <div key={emp.id} className="flex flex-col">
            {/* Card */}
            <button
              onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
              className={`w-full text-left bg-white rounded-xl border transition-all duration-200 ${
                expandedId === emp.id
                  ? 'shadow-md border-indigo-200 ring-1 ring-indigo-100'
                  : 'shadow-sm border-gray-100 hover:shadow-md hover:border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full ${emp.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {emp.lastName[0]}{emp.firstName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {emp.lastName} {emp.firstName}
                      </h3>
                      {emp.awards.length > 0 && (
                        <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium">
                          <Award className="w-3 h-3" />
                          {emp.awards.length}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {emp.department}　{emp.role}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {emp.hireYear}年入社
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {calcAge(emp.birthYear)}歳
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-gray-300">
                    {expandedId === emp.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Skill preview */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {emp.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                  {emp.skills.length > 3 && (
                    <span className="px-2 py-0.5 text-gray-400 text-[11px]">
                      +{emp.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* ── Expanded Detail ─────────────────────── */}
            {expandedId === emp.id && (
              <div className="bg-white border border-t-0 border-indigo-200 rounded-b-xl shadow-md px-5 pb-5 -mt-px animate-in">
                <div className="border-t border-gray-100 pt-4 space-y-5">
                  {/* 基本情報 */}
                  <section>
                    <SectionTitle icon={<Briefcase className="w-4 h-4" />} title="基本情報" />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                      <InfoRow label="入社年度" value={`${emp.hireYear}年`} />
                      <InfoRow label="生年" value={`${emp.birthYear}年（${calcAge(emp.birthYear)}歳）`} />
                      <InfoRow label="入社時配属" value={emp.initialDepartment} />
                      <InfoRow label="現在の部署" value={`${emp.department} ${emp.role}`} />
                    </div>
                  </section>

                  {/* 部署遍歴 */}
                  <section>
                    <SectionTitle icon={<Building2 className="w-4 h-4" />} title="部署遍歴" />
                    <div className="mt-2 ml-1">
                      {emp.departmentHistory.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 relative">
                          {/* vertical line */}
                          {i < emp.departmentHistory.length - 1 && (
                            <div className="absolute left-[7px] top-4 w-0.5 h-full bg-indigo-100" />
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${
                              i === emp.departmentHistory.length - 1
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'bg-white border-indigo-300'
                            }`}
                          />
                          <div className="pb-4">
                            <p className="text-sm font-medium text-gray-900">
                              {h.department}　{h.role}
                            </p>
                            <p className="text-xs text-gray-400">{h.year}年〜</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 役職推移 */}
                  <section>
                    <SectionTitle icon={<TrendingUp className="w-4 h-4" />} title="役職推移" />
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {emp.departmentHistory.map((h, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium whitespace-nowrap">
                            {h.role}
                          </span>
                          {i < emp.departmentHistory.length - 1 && (
                            <span className="text-gray-300 text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 主な実績 */}
                  <section>
                    <SectionTitle icon={<Star className="w-4 h-4" />} title="主な実績・仕事内容" />
                    <ul className="mt-2 space-y-1.5">
                      {emp.achievements.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* 表彰歴 */}
                  {emp.awards.length > 0 && (
                    <section>
                      <SectionTitle icon={<Award className="w-4 h-4" />} title="表彰歴" />
                      <div className="mt-2 space-y-1.5">
                        {emp.awards.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                              {a.year}
                            </span>
                            <span className="text-gray-700">{a.title}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* スキル・特徴タグ */}
                  <section>
                    <SectionTitle icon={<UserCheck className="w-4 h-4" />} title="スキル・特徴タグ" />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {emp.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* 最終更新日 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      最終更新日: {emp.lastUpdated}
                    </div>
                    {emp.needsUpdate && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium">
                        <RefreshCw className="w-3 h-3" />
                        更新リマインド
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">該当する社員が見つかりません</p>
        </div>
      )}

      {/* ── Floating Action Button ─────────────────────── */}
      <button className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
        <RefreshCw className="w-4 h-4" />
        社員情報を更新
      </button>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h4 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
      <span className="text-indigo-500">{icon}</span>
      {title}
    </h4>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  )
}
