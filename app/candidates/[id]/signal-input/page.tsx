'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  FileText,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Mail,
  AlertTriangle,
  Heart,
  MessageSquare,
  Brain,
  Target,
  ArrowRight,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

// AI抽出ステップアニメーション
const EXTRACTION_STEPS = [
  { label: '面接メモを読み込んでいます...', icon: FileText, duration: 600 },
  { label: '発言パターンを解析中...', icon: Brain, duration: 700 },
  { label: '志向・価値観を抽出中...', icon: Heart, duration: 800 },
  { label: '懸念事項を識別中...', icon: AlertTriangle, duration: 600 },
  { label: '企業EVPとクロスリファレンス中...', icon: Target, duration: 700 },
  { label: 'シグナルを構造化しています...', icon: Sparkles, duration: 500 },
]

// デモ用インタビューメモ（新卒候補者用）
const DEMO_MEMO_NEWGRAD = `【面談メモ】田村 萌（2026年3月卒）
日時：2025年3月13日 14:00〜15:00（オンライン）
担当：佐藤 彩花

◆ 就活の軸について
・「裁量権を持って働ける環境を探している」と語る。ゼミでは自分でプロジェクト設計〜実行まで完結する経験が多く、それが楽しかったとのこと
・「大企業だと最初の3〜5年は下積みが多いと聞いていて少し不安」「でも成長できるなら構わない」と言っていたが、裁量の話をした際に目が輝いた
・社会に出たら「ユーザーの声に直接触れながら仕事したい」と強調

◆ 弊社への反応
・「入社半年でプロジェクトリーダーになれる機会がある」と説明したときに「え、本当ですか？！」と前のめりになった
・「若手でも意見が通るんですか？」という質問があり、実際の事例を話すととても喜んでいた
・会社の説明会でのプロダクト説明が「すごくわかりやすくて感動した」と言っていた

◆ 懸念・不安
・「スタートアップで長期的に働けるか不安です」→ 財務状況や成長トレンドを見せたら少し安心した様子
・「研修制度が手厚い会社の方が安心できるかも」→ オンボーディングの丁寧さを説明すると「それなら安心です」と

◆ 将来ビジョン
・「5年後は自分でプロダクトをゼロから立ち上げたい」
・「海外展開にも関わりたい、英語も活かしたい」（TOEIC 860点）
・「チームを引っ張るリーダーより、専門性で貢献したい」

◆ 他社選考状況
・大手IT企業A社の最終面接待ち
・ベンチャーB社の二次面接待ち
・「御社が第一志望です」と言っていた（信憑性は高そう）

◆ エネルギーレベル：★★★★★
全体的に熱量が高く、質問も鋭かった。プロダクトへの理解が深く、新卒とは思えない。`

const DEMO_MEMO_MIDCAREER = `【面接メモ】田中 美咲 — 二次面接（役員面接）
日時：2025年3月15日 14:00〜15:30（対面）
面接官：坂本 代表取締役CEO、前田 事業責任者

◆ 事業継続性について（重要）
冒頭で坂本から財務状況を先手で共有。ARR前年比+180%、ランウェイ28ヶ月を開示。
田中さんは「正直に話してもらえて安心しました」と明確に表情が和らいだ。
「成長しているんですね」と言いながらノートにメモを取っていた。

◆ キャリアビジョンについて
「5年後はプロダクト全体を見るVP of Productのような役割を目指したい」と明言。
「そのためには早いうちから事業全体に関与できる会社がいいと思っています」と語った。
前田から「弊社では1年目でも事業戦略MTGに参加できる」と話すと「それは今の会社では絶対にあり得ない」と反応。

◆ 担当領域の提示
前田から「田中さんには○○プロダクトの担当をお願いしたい」と具体的に提示。
「具体的なプロダクトを示してもらったのは初めてで、本気度が伝わりました」と発言。
プロダクトの課題について「私だったら最初にユーザーインタビューから始めます」と即座に答えた。

◆ 懸念の変化
事業リスクへの懸念：当初High → 財務開示後にLow
給与への不安：ストックオプションの説明後「納得感があります」と発言

◆ 意思決定の軸
「最終的には、自分が本当にやりたいことができるかどうか」
「御社は今日の面談でそれが一番クリアになりました」

◆ エネルギーレベル：★★★★★（過去最高）
最後に「次のステップをできるだけ早く進めたいです」と自分から言い出した。`

// AI抽出結果（新卒用）
const EXTRACTED_SIGNALS_NEWGRAD = {
  candidateName: '田村 萌',
  stage: '会社説明会・カジュアル面談',
  careerValues: [
    { value: '裁量・プロジェクト主導', strength: 'high', evidence: '「プロジェクト設計〜実行を自分でやりたい」「入社半年でリーダー機会がある」に前のめり反応', evpMatch: '裁量と成長機会' },
    { value: 'ユーザーとの距離感', strength: 'high', evidence: '「ユーザーの声に直接触れながら仕事したい」を強調。ユーザーインタビュー文化に強い興味', evpMatch: 'ユーザー中心の開発' },
    { value: '専門性での貢献', strength: 'medium', evidence: '「チームを引っ張るリーダーより専門性で貢献したい」と明言。TOEIC860点・英語活用への意欲', evpMatch: '専門スキルの発揮機会' },
  ],
  positiveReactions: [
    { topic: '入社半年でプロジェクトリーダーになれる機会', reaction: '「え、本当ですか！」と前のめり。目の輝きが変わった', matchStrength: 'very_strong' },
    { topic: '若手の意見が通る事例紹介', reaction: '事例を話すととても喜んでいた。「そういう環境を探していました」', matchStrength: 'strong' },
    { topic: '会社説明会のプロダクト説明', reaction: '「すごくわかりやすくて感動した」と自発的に言及', matchStrength: 'medium' },
  ],
  concerns: [
    { concern: 'スタートアップの長期安定性', severity: 'medium', status: '財務状況開示で部分的に解消。継続フォロー推奨' },
    { concern: '研修・オンボーディング制度', severity: 'low', status: '説明後「安心」と回答済み。詳細資料を送付予定' },
  ],
  questionsAsked: [
    '若手でも意見が通るんですか？',
    '5年後のキャリアパスはどんな感じですか？',
    'エンジニアとの働き方はどういう形ですか？',
  ],
  energyLevel: 5,
  attractAngle: '「入社直後から裁量を持ってプロジェクトを動かせる」×「ユーザーと近い距離で仕事できる」',
  urgentActions: [
    { action: '次のステップ（一次面接）の案内を48時間以内に送付する', priority: 'high' },
    { action: 'フィードバックレターで「入社半年でリーダー機会」を具体的に伝える', priority: 'high' },
    { action: 'A社最終面接前に弊社の魅力を強化するコンテンツを送付', priority: 'medium' },
  ],
}

// AI抽出結果（中途用・田中美咲）
const EXTRACTED_SIGNALS_MIDCAREER = {
  candidateName: '田中 美咲',
  stage: '二次面接（役員面接）',
  careerValues: [
    { value: 'VP of Product・全体統括への志向', strength: 'high', evidence: '「5年後はVP of Productを目指す」と明言。事業全体に関与できる環境を重視', evpMatch: '経営との距離感・意思決定権' },
    { value: 'ユーザーインタビュー・プロダクト思考', strength: 'high', evidence: '担当領域を示されて即「ユーザーインタビューから始める」と回答。思考が高速', evpMatch: 'プロダクト思考の組織' },
    { value: '意思決定速度・事業関与', strength: 'high', evidence: '「1年目でも事業戦略MTGに参加」に「絶対あり得ない」と強反応。現職への不満が最高潮', evpMatch: '裁量と意思決定' },
  ],
  positiveReactions: [
    { topic: '財務状況の透明な開示', reaction: '「正直に話してもらえて安心した」と表情が明確に和らぐ。信頼感が大幅に向上', matchStrength: 'very_strong' },
    { topic: '具体的な担当プロダクトの提示', reaction: '「本気度が伝わりました」と発言。「具体的に示してもらったのは初めて」', matchStrength: 'very_strong' },
    { topic: '事業戦略MTGへの入社初日から参加', reaction: '「今の会社では絶対あり得ない」と強い反応。最大の差別化ポイントとして機能', matchStrength: 'strong' },
  ],
  concerns: [
    { concern: '事業継続リスク', severity: 'low', status: '✅ 財務開示で解消済み。フォロー不要' },
    { concern: '給与水準', severity: 'low', status: '✅ ストックオプション説明で「納得感あり」と解消済み' },
  ],
  questionsAsked: [
    '入社後の最初の担当プロダクトはどんな課題感がありますか？',
    'VPクラスになるにはどのようなキャリアパスが想定されますか？',
    '海外展開の計画はありますか？',
  ],
  energyLevel: 5,
  attractAngle: '「自分の意思で担当プロダクトを動かせる裁量」×「VP of Productへの最速キャリアパス」',
  urgentActions: [
    { action: '【最重要】オファーを可能な限り早く（3〜4営業日以内）準備・提示する', priority: 'high' },
    { action: 'オファーレターでVP of Productキャリアパスを具体的に示す', priority: 'high' },
    { action: 'A社の動向を佐藤から田中さんに確認の連絡を入れる', priority: 'high' },
  ],
}

export default function SignalInputPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)

  const isNewGrad = id === 'cand_004'
  const demoMemo = isNewGrad ? DEMO_MEMO_NEWGRAD : DEMO_MEMO_MIDCAREER
  const extractedData = isNewGrad ? EXTRACTED_SIGNALS_NEWGRAD : EXTRACTED_SIGNALS_MIDCAREER

  const [memo, setMemo] = useState('')
  const [phase, setPhase] = useState<'input' | 'extracting' | 'result'>('input')
  const [extractionStep, setExtractionStep] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [expandedSection, setExpandedSection] = useState<string | null>('values')

  const candidateName = candidate?.fullName ?? extractedData.candidateName

  const handleLoadDemo = () => {
    setMemo(demoMemo)
  }

  const handleExtract = async () => {
    setPhase('extracting')
    setExtractionStep(0)
    const startTime = Date.now()

    for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, EXTRACTION_STEPS[i].duration))
      setExtractionStep(i + 1)
    }

    setElapsedMs(Date.now() - startTime)
    setPhase('result')
  }

  const strengthColor = (s: string) =>
    s === 'high' ? 'text-emerald-700 bg-emerald-50' :
    s === 'medium' ? 'text-amber-700 bg-amber-50' :
    'text-gray-500 bg-gray-50'

  const strengthLabel = (s: string) =>
    s === 'high' ? '強' : s === 'medium' ? '中' : '低'

  const matchStrengthColor = (s: string) =>
    s === 'very_strong' ? 'border-l-4 border-emerald-400 bg-emerald-50' :
    s === 'strong' ? 'border-l-4 border-blue-400 bg-blue-50' :
    'border-l-4 border-gray-300 bg-gray-50'

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidateName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">面談メモ入力・シグナル抽出</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-bold text-gray-900">AIシグナル抽出</h1>
            <span className="badge bg-indigo-100 text-indigo-700">新機能</span>
          </div>
          {phase === 'result' && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Zap className="w-3.5 h-3.5" />
              <span>AI抽出完了 — <strong>{(elapsedMs / 1000).toFixed(1)}秒</strong>（従来：手動整理30〜40分）</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {phase === 'input' && (
          <div className="max-w-4xl mx-auto">
            {/* Efficiency banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 mb-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold mb-1">面談メモ → 候補者シグナル、AIが即時構造化</h2>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    面談後のメモや議事録をそのままペーストするだけ。AIが志向・価値観・ポジティブ反応・懸念を<br />
                    自動的に抽出し、Attractプランとフィードバックレターの生成に即座に活用します。
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-6">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-indigo-200">従来</p>
                      <p className="text-2xl font-bold">30分</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-300" />
                    <div className="text-center">
                      <p className="text-xs text-indigo-200">ATTRACT</p>
                      <p className="text-2xl font-bold text-yellow-300">〜10秒</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">面談メモ・議事録を入力</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    面談後のメモをそのままペースト。箇条書き・会話形式・どんな形式でも対応します。
                  </p>
                </div>
                <button
                  onClick={handleLoadDemo}
                  className="btn-secondary text-xs"
                >
                  デモデータを読み込む
                </button>
              </div>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder={`例）
【面談メモ】${candidateName}
日時：2025年3月15日 14:00

・裁量をもって働きたいと話していた
・「大企業では意見が通らない」と不満を示す
・弊社のスピード感について「ここが一番魅力的」と反応
...`}
                rows={14}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none font-mono"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {memo.length > 0 ? `${memo.length}文字入力済み` : '面談メモを入力してください'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMemo('')}
                    className="text-xs text-gray-400 hover:text-gray-600"
                    disabled={memo.length === 0}
                  >
                    クリア
                  </button>
                  <button
                    onClick={handleExtract}
                    disabled={memo.length < 20}
                    className={`btn-primary px-6 ${memo.length < 20 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    AIでシグナルを抽出する
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: FileText, title: 'どんな形式でもOK', desc: '箇条書き、会話メモ、議事録形式、どれでも抽出できます' },
                { icon: Brain, title: '6項目を自動抽出', desc: '志向・価値観・関心・反応・懸念・質問を構造化します' },
                { icon: Target, title: 'EVPと自動照合', desc: '企業魅力プロファイルと自動的にマッチング分析します' },
              ].map((tip, i) => (
                <div key={i} className="card p-4">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                    <tip.icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{tip.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'extracting' && (
          <div className="max-w-lg mx-auto mt-20 text-center">
            {/* Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-7 h-7 text-indigo-600" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">AIがシグナルを抽出中...</h2>
            <p className="text-sm text-gray-400 mb-8">面談メモを解析してシグナルを構造化しています</p>

            <div className="text-left space-y-2 max-w-sm mx-auto">
              {EXTRACTION_STEPS.map((step, i) => {
                const StepIcon = step.icon
                const isDone = extractionStep > i
                const isCurrent = extractionStep === i
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isDone ? 'bg-emerald-50' : isCurrent ? 'bg-indigo-50' : 'bg-gray-50 opacity-40'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <StepIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${isDone ? 'text-emerald-700' : isCurrent ? 'text-indigo-700 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="max-w-5xl mx-auto">
            {/* Efficiency Achievement Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">シグナル抽出完了！</p>
                  <p className="text-xs text-emerald-600">
                    {(elapsedMs / 1000).toFixed(1)}秒で完了 — 手動整理（平均30〜40分）が不要になりました
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{extractedData.careerValues.length + extractedData.concerns.length + extractedData.positiveReactions.length}</p>
                  <p className="text-xs text-emerald-600">抽出項目数</p>
                </div>
                <div className="w-px h-10 bg-emerald-200" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{extractedData.urgentActions.filter(a => a.priority === 'high').length}</p>
                  <p className="text-xs text-emerald-600">高優先アクション</p>
                </div>
              </div>
            </div>

            {/* Attract Angle */}
            <div className="card p-5 mb-6 border-l-4 border-indigo-500 bg-indigo-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AIが特定した最適Attract軸</p>
              </div>
              <p className="text-sm font-semibold text-indigo-900 leading-relaxed">
                {extractedData.attractAngle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left/Center: Signals */}
              <div className="col-span-2 space-y-4">
                {/* Career Values */}
                <div className="card overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'values' ? null : 'values')}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-semibold text-gray-900">志向・価値観</span>
                      <span className="badge bg-rose-50 text-rose-600">{extractedData.careerValues.length}項目</span>
                    </div>
                    {expandedSection === 'values' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSection === 'values' && (
                    <div className="px-5 pb-5 space-y-3">
                      {extractedData.careerValues.map((v, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-800">{v.value}</p>
                            <div className="flex gap-2">
                              <span className={`badge text-xs ${strengthColor(v.strength)}`}>
                                志向強度: {strengthLabel(v.strength)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-2">{v.evidence}</p>
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                            <Sparkles className="w-3 h-3" />
                            <span>EVP照合: <strong>{v.evpMatch}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Positive Reactions */}
                <div className="card overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'reactions' ? null : 'reactions')}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-900">ポジティブ反応（刺さった訴求）</span>
                      <span className="badge bg-emerald-50 text-emerald-600">{extractedData.positiveReactions.length}項目</span>
                    </div>
                    {expandedSection === 'reactions' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSection === 'reactions' && (
                    <div className="px-5 pb-5 space-y-3">
                      {extractedData.positiveReactions.map((r, i) => (
                        <div key={i} className={`p-4 rounded-xl ${matchStrengthColor(r.matchStrength)}`}>
                          <p className="text-xs font-bold text-gray-700 mb-1">{r.topic}</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{r.reaction}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Concerns */}
                <div className="card overflow-hidden">
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === 'concerns' ? null : 'concerns')}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-900">懸念・不安</span>
                      <span className="badge bg-amber-50 text-amber-600">{extractedData.concerns.length}項目</span>
                    </div>
                    {expandedSection === 'concerns' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSection === 'concerns' && (
                    <div className="px-5 pb-5 space-y-3">
                      {extractedData.concerns.map((c, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-xs font-bold text-gray-800">{c.concern}</p>
                            <span className={`badge text-xs ${strengthColor(c.severity)}`}>深刻度: {strengthLabel(c.severity)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{c.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Questions Asked */}
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-900">候補者からの質問</span>
                    <span className="badge bg-blue-50 text-blue-600">{extractedData.questionsAsked.length}件</span>
                  </div>
                  <div className="space-y-2">
                    {extractedData.questionsAsked.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-400 font-bold flex-shrink-0">Q{i + 1}.</span>
                        <span className="leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="space-y-4">
                {/* Energy Level */}
                <div className="card p-5">
                  <p className="text-xs font-semibold text-gray-700 mb-3">エネルギーレベル</p>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`flex-1 h-3 rounded-full ${star <= extractedData.energyLevel ? 'bg-amber-400' : 'bg-gray-100'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {extractedData.energyLevel === 5 ? '非常に高い熱量。即対応が重要。' :
                     extractedData.energyLevel >= 4 ? '高い関心。積極的にアクションを。' :
                     '様子見の状態。丁寧なフォローが必要。'}
                  </p>
                </div>

                {/* Urgent Actions */}
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-semibold text-gray-700">推奨アクション</p>
                  </div>
                  <div className="space-y-2">
                    {extractedData.urgentActions.map((action, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border text-xs leading-relaxed ${priorityColor(action.priority)}`}
                      >
                        {action.priority === 'high' && <span className="font-bold">【要対応】</span>}
                        {action.action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="card p-5 bg-indigo-50 border-indigo-200">
                  <p className="text-xs font-bold text-indigo-800 mb-3">シグナルを活用した次のステップ</p>
                  <div className="space-y-2">
                    <Link
                      href={`/candidates/${id}/feedback-letter`}
                      className="w-full flex items-center gap-2 p-3 bg-white rounded-lg border border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      フィードバックレターを生成
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                    <Link
                      href={`/candidates/${id}/attract`}
                      className="w-full flex items-center gap-2 p-3 bg-white rounded-lg border border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Attractプランを更新
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                    <Link
                      href={`/candidates/${id}/brief`}
                      className="w-full flex items-center gap-2 p-3 bg-white rounded-lg border border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      面接官ブリーフを準備
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                  </div>
                </div>

                {/* Time Saved */}
                <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-800">業務効率化レポート</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-xs text-gray-400">AI処理時間</p>
                      <p className="text-lg font-bold text-emerald-600">{(elapsedMs / 1000).toFixed(1)}秒</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-xs text-gray-400">節約時間</p>
                      <p className="text-lg font-bold text-emerald-600">〜30分</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-2 text-center">
                    月20件の面談で約10時間/月の工数削減
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => { setPhase('input'); setMemo('') }}
                className="btn-secondary"
              >
                別のメモを入力する
              </button>
              <Link href={`/candidates/${id}`} className="btn-primary">
                <CheckCircle2 className="w-4 h-4" />
                候補者カルテに保存して戻る
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
