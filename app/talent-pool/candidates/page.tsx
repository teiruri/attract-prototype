'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  Clock,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Star,
  Tag,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Linkedin,
  Coffee,
  FileText,
  Heart,
  Target,
  Send,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = 'high' | 'medium' | 'low'
type ContactStatus = 'overdue' | 'soon' | 'scheduled'
type ActionType = 'email' | 'phone' | 'linkedin' | 'meeting' | 'message'

interface TimelineEvent {
  date: string
  label: string
  type: 'completed' | 'planned' | 'overdue'
}

interface InterviewSummary {
  score: number
  maxScore: number
  strengths: string[]
  notes: string
}

interface ContactAction {
  date: string
  type: ActionType
  description: string
  status: 'completed' | 'planned'
}

interface NextApproach {
  date: string
  method: string
  talkingPoints: string[]
}

interface PooledCandidate {
  id: string
  lastName: string
  firstName: string
  initials: string
  avatarColor: string
  position: string
  hardSkills: string[]
  softSkills: string[]
  reason: string
  reasonType: 'declined' | 'conditions' | 'timing' | 'failed'
  recruiter: string
  interviewer: string
  nextContactDate: string
  contactStatus: ContactStatus
  poolDate: string
  priority: Priority
  timeline: TimelineEvent[]
  interviewSummary: InterviewSummary
  values: string[]
  contactActions: ContactAction[]
  nextApproach: NextApproach
  aiRecommendation: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const pooledCandidates: PooledCandidate[] = [
  {
    id: '1',
    lastName: '木村',
    firstName: '拓哉',
    initials: '木拓',
    avatarColor: 'bg-indigo-500',
    position: 'シニアプロダクトマネージャー',
    hardSkills: ['React', 'TypeScript', 'Scrum', 'プロダクト戦略'],
    softSkills: ['リーダーシップ', 'ステークホルダー管理', '意思決定力'],
    reason: '他社内定承諾',
    reasonType: 'declined',
    recruiter: '佐藤 美咲',
    interviewer: '山田 太郎（CTO）',
    nextContactDate: '2026-04-15',
    contactStatus: 'soon',
    poolDate: '2025-11-20',
    priority: 'high',
    timeline: [
      { date: '2025-09-15', label: 'カジュアル面談実施 → 好印象', type: 'completed' },
      { date: '2025-10-08', label: '一次面接 → 高評価（技術力・リーダーシップ）', type: 'completed' },
      { date: '2025-11-01', label: '最終面接 → 内定提示', type: 'completed' },
      { date: '2025-11-15', label: '他社内定承諾で辞退', type: 'completed' },
      { date: '2025-12-01', label: 'お礼メール送信', type: 'completed' },
      { date: '2026-01-20', label: 'LinkedIn近況確認', type: 'completed' },
      { date: '2026-04-15', label: '次回連絡予定', type: 'planned' },
    ],
    interviewSummary: {
      score: 4.5,
      maxScore: 5,
      strengths: ['プロダクト思考が非常に強い', '技術理解が深くエンジニアとの協働が得意', 'チームビルディングの実績豊富'],
      notes: 'CTO山田から「ぜひ将来的に採用したい」との強い推薦あり。現職でのプロジェクト完了後が狙い目。',
    },
    values: ['プロダクトの社会的インパクトを重視', 'フラットな組織文化を好む', 'リモートワーク柔軟性を重視', '技術的チャレンジのある環境'],
    contactActions: [
      { date: '2025-12-01', type: 'email', description: '選考参加への感謝メール', status: 'completed' },
      { date: '2026-01-20', type: 'linkedin', description: 'LinkedInで近況確認・いいね', status: 'completed' },
      { date: '2026-04-15', type: 'email', description: '新プロダクトローンチの報告とカジュアル面談打診', status: 'planned' },
    ],
    nextApproach: {
      date: '2026-04-15',
      method: 'メール + LinkedIn',
      talkingPoints: [
        '新プロダクト「HR FARM」のローンチ報告',
        'PMチーム拡大中であることを伝える',
        'カジュアルランチの打診',
      ],
    },
    aiRecommendation: '木村さんは現職のプロジェクトが3月末に完了する見込みです。4月中旬の連絡は最適なタイミングです。新プロダクトのPMポジションを軸に、技術的チャレンジとフラットな文化をアピールポイントにしてください。',
  },
  {
    id: '2',
    lastName: '田中',
    firstName: '理恵',
    initials: '田理',
    avatarColor: 'bg-rose-500',
    position: 'バックエンドエンジニア',
    hardSkills: ['Python', 'Go', 'PostgreSQL', 'マイクロサービス'],
    softSkills: ['問題解決力', 'コミュニケーション力', '自走力'],
    reason: '条件不一致（年収）',
    reasonType: 'conditions',
    recruiter: '鈴木 健太',
    interviewer: '高橋 直人（テックリード）',
    nextContactDate: '2026-03-10',
    contactStatus: 'overdue',
    poolDate: '2025-08-15',
    priority: 'high',
    timeline: [
      { date: '2025-06-20', label: 'エージェント経由で応募', type: 'completed' },
      { date: '2025-07-05', label: '一次面接 → 技術力高評価', type: 'completed' },
      { date: '2025-07-20', label: '二次面接 → チームフィット良好', type: 'completed' },
      { date: '2025-08-01', label: '条件提示 → 年収希望額に届かず', type: 'completed' },
      { date: '2025-08-15', label: '条件不一致で見送り', type: 'completed' },
      { date: '2025-10-01', label: '技術イベント案内メール送信', type: 'completed' },
      { date: '2026-03-10', label: '次回連絡予定（期日超過）', type: 'overdue' },
    ],
    interviewSummary: {
      score: 4.2,
      maxScore: 5,
      strengths: ['Go言語の設計力が突出', 'マイクロサービスアーキテクチャの経験豊富', '論理的なコミュニケーション'],
      notes: '技術力は申し分なし。年収テーブルの見直しが進めば即オファー可能。',
    },
    values: ['技術的成長環境を重視', '適正な報酬を求める', 'ワークライフバランス重視'],
    contactActions: [
      { date: '2025-10-01', type: 'email', description: '社内技術イベントの案内', status: 'completed' },
      { date: '2026-03-10', type: 'email', description: '給与テーブル改定の報告と再打診', status: 'planned' },
    ],
    nextApproach: {
      date: '2026-03-10',
      method: 'メール',
      talkingPoints: [
        '給与テーブル改定（上位レンジ拡大）の報告',
        'バックエンドチームの技術スタック刷新の話題',
        '条件面での再交渉の余地があることを伝える',
      ],
    },
    aiRecommendation: '⚠️ 連絡期日を13日超過しています。田中さんの転職市場での価値は高く、早急にコンタクトを取ることを推奨します。給与テーブル改定を武器に、具体的な年収提示を含めたアプローチが効果的です。',
  },
  {
    id: '3',
    lastName: '大塚',
    firstName: '悠人',
    initials: '大悠',
    avatarColor: 'bg-emerald-500',
    position: 'UI/UXデザイナー',
    hardSkills: ['Figma', 'UI設計', 'UXリサーチ', 'デザインシステム'],
    softSkills: ['クリエイティビティ', 'ユーザー共感力', 'プレゼン力'],
    reason: 'タイミング不一致（転職時期）',
    reasonType: 'timing',
    recruiter: '佐藤 美咲',
    interviewer: '中村 愛（デザインリード）',
    nextContactDate: '2026-05-01',
    contactStatus: 'scheduled',
    poolDate: '2025-12-01',
    priority: 'medium',
    timeline: [
      { date: '2025-10-15', label: 'ポートフォリオ確認 → 高評価', type: 'completed' },
      { date: '2025-11-01', label: 'カジュアル面談 → 相互好印象', type: 'completed' },
      { date: '2025-11-20', label: '現職プロジェクト完了まで転職不可と判明', type: 'completed' },
      { date: '2025-12-01', label: 'タレントプール登録', type: 'completed' },
      { date: '2026-02-15', label: 'デザインイベント案内送信', type: 'completed' },
      { date: '2026-05-01', label: '次回連絡予定', type: 'planned' },
    ],
    interviewSummary: {
      score: 4.0,
      maxScore: 5,
      strengths: ['デザインシステム構築の実績', 'ユーザーリサーチの手法が体系的', 'Figmaの活用レベルが高い'],
      notes: '現職の大型プロジェクトが4月末完了予定。5月以降の転職が現実的。',
    },
    values: ['デザインの自由度を重視', 'プロダクト開発に深く関わりたい', 'チームの多様性を重視'],
    contactActions: [
      { date: '2026-02-15', type: 'email', description: 'デザインコミュニティイベント案内', status: 'completed' },
      { date: '2026-05-01', type: 'meeting', description: 'カジュアルランチ打診', status: 'planned' },
    ],
    nextApproach: {
      date: '2026-05-01',
      method: 'メール → ランチ',
      talkingPoints: [
        'デザインチーム拡大とデザインシステム刷新プロジェクト',
        '現職プロジェクト完了後の状況確認',
        'カジュアルランチでの情報交換',
      ],
    },
    aiRecommendation: '大塚さんの現職プロジェクトは4月末完了予定です。5月上旬のアプローチは最適なタイミングです。デザインシステム刷新プロジェクトへの参画を軸に提案してください。',
  },
  {
    id: '4',
    lastName: '西村',
    firstName: '恵子',
    initials: '西恵',
    avatarColor: 'bg-amber-500',
    position: 'マーケティングマネージャー',
    hardSkills: ['データ分析', '広告運用', 'GA4', 'SQL'],
    softSkills: ['戦略思考', 'チームマネジメント', '数値分析力'],
    reason: '辞退（家族事情）',
    reasonType: 'declined',
    recruiter: '鈴木 健太',
    interviewer: '伊藤 真理（CMO）',
    nextContactDate: '2026-06-01',
    contactStatus: 'scheduled',
    poolDate: '2025-09-30',
    priority: 'medium',
    timeline: [
      { date: '2025-08-01', label: 'スカウト → 興味あり', type: 'completed' },
      { date: '2025-08-20', label: '一次面接 → マーケ知識豊富', type: 'completed' },
      { date: '2025-09-10', label: '最終面接 → 内定提示', type: 'completed' },
      { date: '2025-09-25', label: '家族の介護事情で辞退', type: 'completed' },
      { date: '2025-12-15', label: '年末ご挨拶メール', type: 'completed' },
      { date: '2026-06-01', label: '次回連絡予定', type: 'planned' },
    ],
    interviewSummary: {
      score: 4.3,
      maxScore: 5,
      strengths: ['データドリブンなマーケティング戦略', 'BtoB/BtoC両方の経験', '広告ROI最適化の実績'],
      notes: 'CMO伊藤から高評価。家族事情が落ち着き次第、再アプローチ推奨。',
    },
    values: ['ワークライフバランスを最重視', 'リモートワーク必須', '社会貢献性のある事業に関心'],
    contactActions: [
      { date: '2025-12-15', type: 'email', description: '年末ご挨拶・近況伺い', status: 'completed' },
      { date: '2026-06-01', type: 'email', description: '状況確認とリモートワーク制度の案内', status: 'planned' },
    ],
    nextApproach: {
      date: '2026-06-01',
      method: 'メール',
      talkingPoints: [
        'フルリモートワーク制度の導入報告',
        'フレックスタイム制の柔軟性をアピール',
        '家族事情への配慮を示しつつ状況確認',
      ],
    },
    aiRecommendation: '西村さんは家族の介護事情が辞退理由でした。フルリモート制度とフレックス制度を前面に出したアプローチが効果的です。6月のコンタクトで状況を確認しましょう。',
  },
  {
    id: '5',
    lastName: '阿部',
    firstName: '浩二',
    initials: '阿浩',
    avatarColor: 'bg-cyan-500',
    position: 'インフラエンジニア',
    hardSkills: ['AWS', 'Terraform', 'Docker', 'Kubernetes'],
    softSkills: ['学習意欲', '粘り強さ', 'ドキュメント力'],
    reason: '不合格（技術力不足→成長中）',
    reasonType: 'failed',
    recruiter: '佐藤 美咲',
    interviewer: '高橋 直人（テックリード）',
    nextContactDate: '2026-04-01',
    contactStatus: 'scheduled',
    poolDate: '2025-10-15',
    priority: 'low',
    timeline: [
      { date: '2025-09-01', label: '応募受付', type: 'completed' },
      { date: '2025-09-15', label: '技術テスト → 基準未達（Kubernetes）', type: 'completed' },
      { date: '2025-10-01', label: '面接 → ポテンシャル高いが現時点では不合格', type: 'completed' },
      { date: '2025-10-15', label: '成長後の再チャレンジ推奨でプール登録', type: 'completed' },
      { date: '2025-12-20', label: '学習リソース共有メール', type: 'completed' },
      { date: '2026-04-01', label: '次回連絡予定', type: 'planned' },
    ],
    interviewSummary: {
      score: 3.2,
      maxScore: 5,
      strengths: ['AWSの基礎知識は確実', '学習意欲が非常に高い', 'コミュニケーションが明快'],
      notes: 'Kubernetes経験が不足。半年後に再チャレンジ推奨。技術ブログでの発信を確認中。',
    },
    values: ['技術力向上を最重視', 'メンター的な先輩がいる環境', 'インフラの自動化に情熱'],
    contactActions: [
      { date: '2025-12-20', type: 'email', description: 'Kubernetes学習リソースの共有', status: 'completed' },
      { date: '2026-04-01', type: 'email', description: '技術力の進捗確認と再チャレンジ打診', status: 'planned' },
    ],
    nextApproach: {
      date: '2026-04-01',
      method: 'メール',
      talkingPoints: [
        '技術ブログ・GitHubの成長確認',
        'Kubernetes関連の進捗を聞く',
        '再チャレンジの意思確認',
      ],
    },
    aiRecommendation: '阿部さんの技術ブログを確認したところ、Kubernetesに関する記事を3本投稿しています。学習が進んでいる可能性が高く、4月の再チャレンジ打診は適切です。',
  },
  {
    id: '6',
    lastName: '吉田',
    firstName: 'さくら',
    initials: '吉さ',
    avatarColor: 'bg-pink-500',
    position: '新卒（2025年卒）ポテンシャル採用候補',
    hardSkills: ['JavaScript', 'React', 'Python基礎', 'データ分析入門'],
    softSkills: ['積極性', 'チームワーク', '吸収力'],
    reason: '辞退（大手志向）',
    reasonType: 'declined',
    recruiter: '鈴木 健太',
    interviewer: '山田 太郎（CTO）',
    nextContactDate: '2026-03-25',
    contactStatus: 'soon',
    poolDate: '2025-07-01',
    priority: 'medium',
    timeline: [
      { date: '2025-04-15', label: '新卒説明会参加', type: 'completed' },
      { date: '2025-05-10', label: '一次面接 → ポテンシャル高評価', type: 'completed' },
      { date: '2025-06-01', label: '最終面接 → 内定提示', type: 'completed' },
      { date: '2025-06-20', label: '大手企業の内定承諾で辞退', type: 'completed' },
      { date: '2025-07-01', label: 'プール登録・応援メール', type: 'completed' },
      { date: '2026-01-10', label: '年始ご挨拶・近況確認', type: 'completed' },
      { date: '2026-03-25', label: '次回連絡予定', type: 'planned' },
    ],
    interviewSummary: {
      score: 3.8,
      maxScore: 5,
      strengths: ['論理的思考力が高い', '技術への関心・学習意欲', 'コミュニケーション力が自然'],
      notes: 'CTO山田「将来的にぜひ来てほしい人材」。大手での経験後の中途採用も視野に。',
    },
    values: ['成長環境を重視', 'ブランド力のある企業に惹かれる', '将来的には裁量の大きい環境も検討'],
    contactActions: [
      { date: '2025-07-01', type: 'email', description: '応援メール・キャリア応援', status: 'completed' },
      { date: '2026-01-10', type: 'email', description: '年始ご挨拶・入社後の様子伺い', status: 'completed' },
      { date: '2026-03-25', type: 'email', description: '入社後1年の振り返りと近況確認', status: 'planned' },
    ],
    nextApproach: {
      date: '2026-03-25',
      method: 'メール',
      talkingPoints: [
        '入社後約1年の振り返りを聞く',
        '当社の成長ストーリーを共有',
        '長期的な関係構築を意識したカジュアルな内容',
      ],
    },
    aiRecommendation: '吉田さんは大手入社後約1年が経過します。1年目は環境に慣れる時期のため、転職意向は低い可能性が高いですが、関係維持のための軽いコンタクトが推奨されます。',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TODAY = '2026-03-23'

function getContactStatusColor(status: ContactStatus) {
  switch (status) {
    case 'overdue':
      return 'border-l-red-500 bg-red-50/30'
    case 'soon':
      return 'border-l-orange-400 bg-orange-50/20'
    case 'scheduled':
      return 'border-l-emerald-400'
  }
}

function getContactBadge(status: ContactStatus) {
  switch (status) {
    case 'overdue':
      return { label: '期限超過', className: 'bg-red-100 text-red-700' }
    case 'soon':
      return { label: 'まもなく', className: 'bg-orange-100 text-orange-700' }
    case 'scheduled':
      return { label: '予定通り', className: 'bg-emerald-100 text-emerald-700' }
  }
}

function getReasonBadge(reasonType: string) {
  switch (reasonType) {
    case 'declined':
      return 'bg-blue-100 text-blue-700'
    case 'conditions':
      return 'bg-amber-100 text-amber-700'
    case 'timing':
      return 'bg-purple-100 text-purple-700'
    case 'failed':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getPriorityBadge(priority: Priority) {
  switch (priority) {
    case 'high':
      return { label: '高', className: 'bg-red-100 text-red-700' }
    case 'medium':
      return { label: '中', className: 'bg-yellow-100 text-yellow-700' }
    case 'low':
      return { label: '低', className: 'bg-gray-100 text-gray-600' }
  }
}

function getActionIcon(type: ActionType) {
  switch (type) {
    case 'email':
      return Mail
    case 'phone':
      return Phone
    case 'linkedin':
      return Linkedin
    case 'meeting':
      return Coffee
    case 'message':
      return MessageSquare
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function daysUntil(dateStr: string) {
  const target = new Date(dateStr)
  const today = new Date(TODAY)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function daysSincePool(dateStr: string) {
  const pool = new Date(dateStr)
  const today = new Date(TODAY)
  return Math.floor((today.getTime() - pool.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function computeStats(candidates: PooledCandidate[]) {
  const total = candidates.length
  const overdue = candidates.filter((c) => c.contactStatus === 'overdue').length
  const avgDays = Math.round(candidates.reduce((sum, c) => sum + daysSincePool(c.poolDate), 0) / total)
  const reapplyRate = 16.7 // mock: 1 out of 6 historically
  return { total, overdue, avgDays, reapplyRate }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TalentPoolCandidatesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | ContactStatus>('all')
  const [filterSkill, setFilterSkill] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const stats = computeStats(pooledCandidates)

  const filtered = pooledCandidates.filter((c) => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false
    if (filterStatus !== 'all' && c.contactStatus !== filterStatus) return false
    if (filterSkill) {
      const skill = filterSkill.toLowerCase()
      const hasSkill =
        c.hardSkills.some((s) => s.toLowerCase().includes(skill)) ||
        c.softSkills.some((s) => s.toLowerCase().includes(skill))
      if (!hasSkill) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        `${c.lastName}${c.firstName}`.includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.hardSkills.some((s) => s.toLowerCase().includes(q)) ||
        c.recruiter.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Upcoming contacts (next 30 days or overdue)
  const upcomingContacts = [...pooledCandidates]
    .filter((c) => c.contactStatus === 'overdue' || daysUntil(c.nextContactDate) <= 30)
    .sort((a, b) => new Date(a.nextContactDate).getTime() - new Date(b.nextContactDate).getTime())

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">応募者タレントプール</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              再アプローチすべき優秀な候補者を管理し、最適なタイミングで接点を持つ
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500">プール登録数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}<span className="text-sm font-normal text-gray-500 ml-1">名</span></p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-gray-500">要アプローチ</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}<span className="text-sm font-normal text-gray-500 ml-1">名</span></p>
          <p className="text-xs text-red-500 mt-0.5">連絡期日超過</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500">平均プール期間</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgDays}<span className="text-sm font-normal text-gray-500 ml-1">日</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500">再応募率</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.reapplyRate}<span className="text-sm font-normal text-gray-500 ml-1">%</span></p>
        </div>
      </div>

      {/* ── Search / Filter ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="候補者名・ポジション・スキルで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            絞り込み
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">優先度</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as 'all' | Priority)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">すべて</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">次回連絡ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | ContactStatus)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">すべて</option>
                <option value="overdue">期限超過</option>
                <option value="soon">まもなく</option>
                <option value="scheduled">予定通り</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">スキルタグ</label>
              <input
                type="text"
                placeholder="例: React, Python, PM..."
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* ── Candidate List (Main) ── */}
        <div className="flex-1 space-y-4">
          <p className="text-sm text-gray-500 mb-2">{filtered.length}名の候補者</p>
          {filtered.map((c) => {
            const isExpanded = expandedId === c.id
            const contactBadge = getContactBadge(c.contactStatus)
            const priorityBadge = getPriorityBadge(c.priority)
            const days = daysUntil(c.nextContactDate)

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 transition-all ${getContactStatusColor(c.contactStatus)} ${
                  isExpanded ? 'ring-1 ring-indigo-200' : ''
                }`}
              >
                {/* ── Card Summary ── */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpand(c.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${c.avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {c.initials}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900">
                          {c.lastName} {c.firstName}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge.className}`}>
                          優先度: {priorityBadge.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getReasonBadge(c.reasonType)}`}>
                          {c.reason}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{c.position}</p>

                      {/* Hard Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {c.hardSkills.map((skill) => (
                          <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {/* Soft Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {c.softSkills.map((skill) => (
                          <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex-shrink-0 text-right space-y-1.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className={`text-xs font-medium ${
                          c.contactStatus === 'overdue' ? 'text-red-600' : c.contactStatus === 'soon' ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {formatDate(c.nextContactDate)}
                        </span>
                      </div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${contactBadge.className}`}>
                        {c.contactStatus === 'overdue'
                          ? `${Math.abs(days)}日超過`
                          : c.contactStatus === 'soon'
                          ? `あと${days}日`
                          : `あと${days}日`}
                      </span>
                      <div className="text-xs text-gray-400">
                        担当: {c.recruiter}
                      </div>
                      <div className="text-xs text-gray-400">
                        面接官: {c.interviewer}
                      </div>
                      <div className="text-xs text-gray-400">
                        登録: {formatDate(c.poolDate)}
                      </div>
                      <div className="mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Expanded Detail ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        連絡済みにする
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        <Calendar className="w-4 h-4" />
                        次回連絡を設定
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        再応募に変換
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Communication Timeline */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            選考時コミュニケーション履歴
                          </h4>
                          <div className="relative pl-6 space-y-3">
                            <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-gray-200" />
                            {c.timeline.map((event, idx) => (
                              <div key={idx} className="relative flex items-start gap-3">
                                <div
                                  className={`absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 border-white z-10 ${
                                    event.type === 'completed'
                                      ? 'bg-emerald-500'
                                      : event.type === 'planned'
                                      ? 'bg-blue-500'
                                      : 'bg-red-500'
                                  }`}
                                />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
                                  <p className={`text-sm ${event.type === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                    {event.label}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interview Summary */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500" />
                            面接評価サマリ
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {c.interviewSummary.score} / {c.interviewSummary.maxScore}
                              </span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < Math.floor(c.interviewSummary.score)
                                        ? 'text-amber-400 fill-amber-400'
                                        : i < c.interviewSummary.score
                                        ? 'text-amber-400 fill-amber-200'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <ul className="space-y-1 mb-2">
                              {c.interviewSummary.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                            <p className="text-xs text-gray-500 italic">{c.interviewSummary.notes}</p>
                          </div>
                        </div>

                        {/* Values */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-rose-500" />
                            候補者の志向・価値観
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {c.values.map((v, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Relation Actions */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                            <Send className="w-4 h-4 text-blue-500" />
                            リレーション維持アクション
                          </h4>
                          <div className="space-y-2">
                            {c.contactActions.map((action, idx) => {
                              const ActionIcon = getActionIcon(action.type)
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                                    action.status === 'completed' ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-md ${action.status === 'completed' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                    <ActionIcon className={`w-3.5 h-3.5 ${action.status === 'completed' ? 'text-emerald-600' : 'text-blue-600'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-400">{formatDate(action.date)}</p>
                                    <p className="text-sm text-gray-700">{action.description}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    action.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {action.status === 'completed' ? '完了' : '予定'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Next Approach Plan */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-indigo-500" />
                            次回アプローチ計画
                          </h4>
                          <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-sm font-medium text-indigo-700">{formatDate(c.nextApproach.date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-sm text-indigo-600">{c.nextApproach.method}</span>
                              </div>
                            </div>
                            <ul className="space-y-1">
                              {c.nextApproach.talkingPoints.map((point, i) => (
                                <li key={i} className="text-xs text-indigo-700 flex items-start gap-1.5">
                                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* AI Recommendation */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            AI推奨
                          </h4>
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                            <p className="text-sm text-purple-800 leading-relaxed">{c.aiRecommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Sidebar: Upcoming Contacts Schedule ── */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              定期連絡スケジュール
            </h3>
            <div className="space-y-3">
              {upcomingContacts.map((c) => {
                const days = daysUntil(c.nextContactDate)
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                      c.contactStatus === 'overdue'
                        ? 'border-red-200 bg-red-50/50'
                        : c.contactStatus === 'soon'
                        ? 'border-orange-200 bg-orange-50/30'
                        : 'border-gray-100'
                    }`}
                    onClick={() => {
                      setExpandedId(c.id)
                      document.getElementById(`card-${c.id}`)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-full ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.lastName} {c.firstName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">{formatDate(c.nextContactDate)}</span>
                      <span className={`text-xs font-medium ${
                        c.contactStatus === 'overdue'
                          ? 'text-red-600'
                          : c.contactStatus === 'soon'
                          ? 'text-orange-600'
                          : 'text-emerald-600'
                      }`}>
                        {c.contactStatus === 'overdue'
                          ? `${Math.abs(days)}日超過`
                          : `あと${days}日`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{c.position}</p>
                  </div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">今月のアクション</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-600">期限超過</span>
                  </div>
                  <span className="text-xs font-semibold text-red-600">
                    {pooledCandidates.filter((c) => c.contactStatus === 'overdue').length}件
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-xs text-gray-600">今週中</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">
                    {pooledCandidates.filter((c) => c.contactStatus === 'soon' && daysUntil(c.nextContactDate) <= 7).length}件
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-gray-600">今月中</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">
                    {pooledCandidates.filter((c) => daysUntil(c.nextContactDate) <= 30 && daysUntil(c.nextContactDate) > 7).length}件
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
