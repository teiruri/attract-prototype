'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
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
  Upload,
  Mic,
  Play,
  Headphones,
  Edit3,
  Info,
  Video,
  FileAudio,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'

// AI抽出ステップアニメーション（録音データ用・7ステップ）
const EXTRACTION_STEPS_RECORDING = [
  { label: '音声ファイル読み込み中...', icon: FileAudio, duration: 800 },
  { label: 'AIによる文字起こし中...', icon: Mic, duration: 1200 },
  { label: '発話者の識別中...', icon: Headphones, duration: 700 },
  { label: 'キーワード・トピック抽出中...', icon: Brain, duration: 800 },
  { label: 'キャリア価値観の分析中...', icon: Heart, duration: 700 },
  { label: '懸念・ポジティブ反応の検出中...', icon: AlertTriangle, duration: 600 },
  { label: 'Attractシグナルの生成中...', icon: Sparkles, duration: 500 },
]

// AI抽出ステップアニメーション（メモ入力用・6ステップ）
const EXTRACTION_STEPS_MEMO = [
  { label: '面接メモを読み込んでいます...', icon: FileText, duration: 600 },
  { label: '発言パターンを解析中...', icon: Brain, duration: 700 },
  { label: '志向・価値観を抽出中...', icon: Heart, duration: 800 },
  { label: '懸念事項を識別中...', icon: AlertTriangle, duration: 600 },
  { label: '企業EVPとクロスリファレンス中...', icon: Target, duration: 700 },
  { label: 'シグナルを構造化しています...', icon: Sparkles, duration: 500 },
]

// デモ用文字起こしテキスト（録音データからの自動生成を想定）
const DEMO_TRANSCRIPT_NEWGRAD = `[00:00:12] 佐藤（面接官）：本日はお時間いただきありがとうございます。田村さん、まず就活の軸について教えていただけますか？

[00:00:25] 田村：はい、ありがとうございます。私が一番大切にしているのは、裁量権を持って働ける環境です。ゼミでは自分でプロジェクトの設計から実行まで全部やらせてもらっていて、それがすごく楽しかったんです。

[00:01:10] 佐藤：なるほど。大企業志向ではない？

[00:01:18] 田村：正直、大企業だと最初の3年から5年は下積みが多いと聞いていて、少し不安です。でも、成長できるなら構わないとも思っています。ただ...やっぱり早くから裁量を持ちたいですね。

[00:02:05] 田村：あと、社会に出たら「ユーザーの声に直接触れながら仕事したい」んです。これはすごく大事にしています。

[00:03:30] 佐藤：弊社では、入社半年でプロジェクトリーダーになれる機会があるんですよ。

[00:03:42] 田村：え、本当ですか？！それはすごいですね...！

[00:04:15] 佐藤：若手でも意見が通る文化があって、実際に去年入社した方が...

[00:04:50] 田村：そういう環境を探していました。若手でも意見が通るんですか？

[00:05:20] 佐藤：はい、実際の事例をお話しますね...

[00:07:00] 田村：素晴らしいですね。実は、説明会でのプロダクト説明がすごくわかりやすくて感動したんです。

[00:08:15] 田村：ただ、スタートアップで長期的に働けるか不安です...

[00:08:45] 佐藤：財務状況をお見せしますね。ARRは前年比...

[00:09:30] 田村：なるほど、それなら少し安心しました。

[00:10:00] 田村：研修制度が手厚い会社の方が安心できるかもとも思っていたんですが...

[00:10:20] 佐藤：弊社のオンボーディングについてお話しますね...

[00:11:00] 田村：それなら安心です！

[00:12:30] 佐藤：将来のビジョンについてはいかがですか？

[00:12:45] 田村：5年後は自分でプロダクトをゼロから立ち上げたいです。海外展開にも関わりたいですし、英語も活かしたいと思っています。TOEIC860点を持っています。

[00:13:50] 田村：ただ、チームを引っ張るリーダーというよりは、専門性で貢献したいタイプです。

[00:15:00] 佐藤：他社の選考状況も教えていただけますか？

[00:15:10] 田村：大手IT企業A社の最終面接待ちと、ベンチャーB社の二次面接待ちです。ただ、御社が第一志望です。`

const DEMO_TRANSCRIPT_MIDCAREER = `[00:00:15] 坂本（CEO）：田中さん、本日はお越しいただきありがとうございます。まず、率直に弊社の財務状況からお話しさせてください。

[00:00:45] 坂本：現在ARRは前年比プラス180%で成長しており、ランウェイは28ヶ月あります。

[00:01:20] 田中：正直に話してもらえて安心しました。成長しているんですね。

[00:02:00] 前田（事業責任者）：田中さんのキャリアビジョンについてお聞かせください。

[00:02:15] 田中：5年後はプロダクト全体を見るVP of Productのような役割を目指したいと思っています。そのためには早いうちから事業全体に関与できる会社がいいと思っています。

[00:03:30] 前田：弊社では1年目でも事業戦略MTGに参加できますよ。

[00:03:45] 田中：それは今の会社では絶対にあり得ないですね...！

[00:05:00] 前田：田中さんには具体的に○○プロダクトの担当をお願いしたいと考えています。

[00:05:20] 田中：具体的なプロダクトを示してもらったのは初めてで、本気度が伝わりました。

[00:06:00] 坂本：そのプロダクトの課題についてどう思われますか？

[00:06:15] 田中：私だったら最初にユーザーインタビューから始めます。

[00:08:00] 田中：ストックオプションについても教えていただけますか？

[00:08:30] 坂本：はい、弊社のSOプランは...

[00:09:00] 田中：納得感があります。

[00:10:30] 田中：最終的には、自分が本当にやりたいことができるかどうかで決めたいと思います。御社は今日の面談でそれが一番クリアになりました。

[00:12:00] 田中：次のステップをできるだけ早く進めたいです。`

// デモ用インタビューメモ（メモ入力パス用）
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

◆ キャリアビジョンについて
「5年後はプロダクト全体を見るVP of Productのような役割を目指したい」と明言。
前田から「弊社では1年目でも事業戦略MTGに参加できる」と話すと「今の会社では絶対にあり得ない」と反応。

◆ 担当領域の提示
前田から「田中さんには○○プロダクトの担当をお願いしたい」と具体的に提示。
「具体的なプロダクトを示してもらったのは初めてで、本気度が伝わりました」と発言。

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
    { concern: '事業継続リスク', severity: 'low', status: '財務開示で解消済み。フォロー不要' },
    { concern: '給与水準', severity: 'low', status: 'ストックオプション説明で「納得感あり」と解消済み' },
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
  const demoTranscript = isNewGrad ? DEMO_TRANSCRIPT_NEWGRAD : DEMO_TRANSCRIPT_MIDCAREER
  const extractedData = isNewGrad ? EXTRACTED_SIGNALS_NEWGRAD : EXTRACTED_SIGNALS_MIDCAREER

  const [memo, setMemo] = useState('')
  const [phase, setPhase] = useState<'input' | 'extracting' | 'result'>('input')
  const [extractionStep, setExtractionStep] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [expandedSection, setExpandedSection] = useState<string | null>('values')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [inputMethod, setInputMethod] = useState<'recording' | 'memo' | null>(null)
  const [transcriptExpanded, setTranscriptExpanded] = useState(false)
  const [transcriptText, setTranscriptText] = useState('')
  const [isEditingTranscript, setIsEditingTranscript] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const candidateName = candidate?.fullName ?? extractedData.candidateName
  const candidateTitle = candidate?.currentTitle ?? ''

  const activeSteps = inputMethod === 'recording' ? EXTRACTION_STEPS_RECORDING : EXTRACTION_STEPS_MEMO

  const handleLoadDemo = () => {
    setMemo(demoMemo)
  }

  const handleFileUpload = (fileName: string) => {
    setUploadedFile(fileName)
    setInputMethod('recording')
    setTranscriptText(demoTranscript)
    // Auto-start extraction after brief delay
    setTimeout(() => {
      handleExtract('recording')
    }, 500)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    // Simulated file upload
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file.name)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file.name)
    }
  }

  const handleDemoUpload = () => {
    handleFileUpload('interview_recording_2025-03-15.mp3')
  }

  const handleExtract = async (method: 'recording' | 'memo') => {
    setInputMethod(method)
    setPhase('extracting')
    setExtractionStep(0)
    const startTime = Date.now()
    const steps = method === 'recording' ? EXTRACTION_STEPS_RECORDING : EXTRACTION_STEPS_MEMO

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, steps[i].duration))
      setExtractionStep(i + 1)
    }

    if (method === 'recording') {
      setTranscriptText(demoTranscript)
    }

    setElapsedMs(Date.now() - startTime)
    setPhase('result')
  }

  const handleMemoExtract = () => {
    setInputMethod('memo')
    handleExtract('memo')
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
          <span className="text-gray-700">面接データ取り込み</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">面接データ取り込み</h1>
              <span className="badge bg-indigo-100 text-indigo-700">AI自動抽出</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{candidateName}{candidateTitle ? ` / ${candidateTitle}` : ''}</p>
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
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="flex-1">
              {/* Step 1 Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">データ取り込み</h2>
                  <p className="text-xs text-gray-500">面接の録音データまたはメモを取り込み、AIがシグナルを自動抽出します</p>
                </div>
              </div>

              {/* Two input methods side by side */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Card A: Recording Upload */}
                <div className="card p-6 border-2 border-indigo-200 relative">
                  <div className="absolute -top-3 left-4">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">推奨</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Mic className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">録音データから取り込み</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    AIが録音を自動でテキスト化し、面接のハイライトと傾向を抽出します
                  </p>

                  {/* Upload Area */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-50'
                        : uploadedFile
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,.mp4,.webm"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    {uploadedFile ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-emerald-700">{uploadedFile}</p>
                        <p className="text-xs text-emerald-500 mt-1">アップロード完了</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                          ファイルをドラッグ＆ドロップ
                        </p>
                        <p className="text-xs text-gray-400 mt-1">またはクリックして選択</p>
                        <p className="text-[10px] text-gray-400 mt-2">MP3, WAV, M4A, MP4, WebM</p>
                      </>
                    )}
                  </div>

                  {/* Demo upload button */}
                  <button
                    onClick={handleDemoUpload}
                    className="w-full mt-3 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-2 px-3 transition-colors font-medium"
                  >
                    <Play className="w-3 h-3 inline mr-1" />
                    デモ録音で試してみる
                  </button>
                </div>

                {/* Card B: Memo/Transcript Input */}
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">メモ・議事録から取り込み</h3>
                      <span className="text-[10px] text-gray-400">追記</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    面接後のメモや議事録をペーストすると、AIがシグナルを抽出します
                  </p>

                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="面接の議事録やメモを貼り付けてください。箇条書きでも、雑なメモでも大丈夫です。"
                    rows={8}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none font-mono"
                  />

                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={handleLoadDemo}
                      className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-1.5 px-3 transition-colors font-medium"
                    >
                      デモデータを入力
                    </button>
                    <div className="flex gap-2">
                      {memo.length > 0 && (
                        <button
                          onClick={() => setMemo('')}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          クリア
                        </button>
                      )}
                      <button
                        onClick={handleMemoExtract}
                        disabled={memo.length < 20}
                        className={`btn-primary text-xs px-4 py-2 ${memo.length < 20 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        AIで抽出
                      </button>
                    </div>
                  </div>
                  {memo.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-2">{memo.length}文字入力済み</p>
                  )}
                </div>
              </div>

              {/* Efficiency banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold mb-1">録音データ → シグナル抽出、AIが全自動で処理</h2>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                      面接の録音ファイルをアップロードするだけ。AIが文字起こし・発話者識別・シグナル抽出を<br />
                      ワンステップで完了し、Attractプランとフィードバックレターの生成に即座に活用します。
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
                        <p className="text-xs text-indigo-200">カケハシOS</p>
                        <p className="text-2xl font-bold text-yellow-300">~10秒</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 flex-shrink-0 space-y-4">
              {/* Recording Tips */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-gray-800">録音のヒント</h3>
                </div>
                <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Mic className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>静かな環境で録音すると精度が向上します</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Headphones className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>マイクは発話者に近い位置に配置してください</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Video className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Zoom/Teams等の録画ファイルもそのまま使えます</span>
                  </div>
                </div>
              </div>

              {/* AI Accuracy */}
              <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-emerald-800">AI精度</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-700">文字起こし精度</span>
                      <span className="text-sm font-bold text-emerald-700">97.5%</span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '97.5%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-700">シグナル検出精度</span>
                      <span className="text-sm font-bold text-emerald-700">94.2%</span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '94.2%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Formats */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileAudio className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-bold text-gray-800">対応フォーマット</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { ext: 'MP3', desc: '音声ファイル', icon: '🎵' },
                    { ext: 'WAV', desc: '高品質音声', icon: '🎵' },
                    { ext: 'M4A', desc: 'Apple音声', icon: '🎵' },
                    { ext: 'MP4', desc: '動画ファイル', icon: '🎬' },
                    { ext: 'WebM', desc: 'Web動画', icon: '🎬' },
                  ].map((fmt) => (
                    <div key={fmt.ext} className="flex items-center gap-2 text-xs">
                      <span className="w-12 font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-center">{fmt.ext}</span>
                      <span className="text-gray-500">{fmt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
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
                {inputMethod === 'recording' ? (
                  <Mic className="w-7 h-7 text-indigo-600" />
                ) : (
                  <Brain className="w-7 h-7 text-indigo-600" />
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {inputMethod === 'recording' ? 'AIが録音データを処理中...' : 'AIがシグナルを抽出中...'}
            </h2>
            <p className="text-sm text-gray-400 mb-2">
              {inputMethod === 'recording'
                ? '録音データから文字起こしとシグナル抽出を行っています'
                : '面談メモを解析してシグナルを構造化しています'}
            </p>
            {uploadedFile && inputMethod === 'recording' && (
              <p className="text-xs text-gray-400 mb-8 flex items-center justify-center gap-1.5">
                <FileAudio className="w-3.5 h-3.5" />
                {uploadedFile}
              </p>
            )}

            <div className="text-left space-y-2 max-w-sm mx-auto">
              {activeSteps.map((step, i) => {
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
            {/* Step 2 Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <h2 className="text-base font-bold text-gray-900">AI抽出結果</h2>
                <p className="text-xs text-gray-500">
                  {inputMethod === 'recording' ? '録音データから抽出されたシグナル' : 'メモから抽出されたシグナル'}
                </p>
              </div>
            </div>

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

            {/* Transcript Section (for recording input) */}
            {inputMethod === 'recording' && transcriptText && (
              <div className="card overflow-hidden mb-6">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900">文字起こしテキスト</span>
                    <span className="badge bg-indigo-50 text-indigo-600 text-[10px]">自動生成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!transcriptExpanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTranscriptExpanded(true)
                          setIsEditingTranscript(true)
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        編集・追記
                      </button>
                    )}
                    {transcriptExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>
                {transcriptExpanded && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">AI文字起こし精度: 97.5%</p>
                      <button
                        onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded ${
                          isEditingTranscript ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditingTranscript ? '編集中' : '編集・追記'}
                      </button>
                    </div>
                    {isEditingTranscript ? (
                      <textarea
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        rows={15}
                        className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none font-mono bg-gray-50"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
                          {transcriptText}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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

                {/* Step 3: Next Steps */}
                <div className="card p-5 bg-indigo-50 border-indigo-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</div>
                    <p className="text-xs font-bold text-indigo-800">次のステップ</p>
                  </div>
                  <p className="text-[10px] text-indigo-500 mb-3">シグナルを活用してアクションを起こす</p>
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
                      <p className="text-lg font-bold text-emerald-600">~30分</p>
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
                onClick={() => { setPhase('input'); setMemo(''); setUploadedFile(null); setInputMethod(null); setTranscriptText('') }}
                className="btn-secondary"
              >
                別のデータを取り込む
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
