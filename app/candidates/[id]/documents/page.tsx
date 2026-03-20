'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  File,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Brain,
  Eye,
  Trash2,
  Download,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Clock,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import { getCandidateById } from '@/lib/mock-data'
import type { UploadedDocument, DocumentType, ParsedDocumentData } from '@/lib/types'

const DOCUMENT_LABELS: Record<DocumentType, { label: string; icon: typeof FileText; description: string }> = {
  resume: { label: '履歴書', icon: FileText, description: '基本情報・学歴・職歴・資格' },
  cv: { label: '職務経歴書', icon: Briefcase, description: '職務内容・実績・スキルの詳細' },
  entry_sheet: { label: 'エントリーシート', icon: BookOpen, description: '志望動機・自己PR・ガクチカ' },
  portfolio: { label: 'ポートフォリオ', icon: Eye, description: '制作物・実績集' },
  other: { label: 'その他', icon: File, description: 'その他の書類' },
}

const PARSE_STEPS = [
  { label: 'PDF/画像を読み取り中...', duration: 800 },
  { label: 'テキストを構造化中...', duration: 600 },
  { label: 'スキル・経歴を抽出中...', duration: 700 },
  { label: '強み・キーワードを分析中...', duration: 500 },
  { label: 'Attractヒントを生成中...', duration: 600 },
  { label: '候補者カルテに反映中...', duration: 400 },
]

// Demo parsed data for when user "uploads" a document
const DEMO_PARSED_DATA: Record<string, ParsedDocumentData> = {
  midcareer: {
    summary: 'SaaS企業にてプロダクトマネージャーとして3年間従事。ユーザーリサーチからロードマップ策定、開発チームとの協働までEnd-to-Endで経験。特にB2Bプロダクトの成長フェーズでの施策立案に強み。',
    keySkills: ['プロダクトマネジメント', 'ユーザーリサーチ', 'KPI設計', 'アジャイル開発', 'SQL', 'Figma'],
    careerHistory: [
      { company: 'SaaS企業X', role: 'プロダクトマネージャー', period: '2022年4月〜現在', highlights: ['担当プロダクトのARRを1.5億→3億に成長', 'ユーザーインタビュー月8件を継続実施', '開発チーム6名のスプリント設計をリード'] },
      { company: 'コンサルティングファームY', role: 'ビジネスアナリスト', period: '2019年4月〜2022年3月', highlights: ['DX戦略策定プロジェクトに4件参画', '業務プロセス分析・改善提案をリード'] },
    ],
    education: [{ school: '早稲田大学', faculty: '商学部', year: '2019年3月卒' }],
    certifications: ['PSPO I', 'Google Analytics 認定'],
    strengths: ['データドリブンな意思決定', 'ユーザーヒアリング力', 'エンジニアとの協働経験'],
    motivationKeywords: ['裁量拡大', 'プロダクト愛', '意思決定速度', '成長環境'],
    attractAngleHints: ['SaaS成長フェーズでの実績 → 即戦力として期待を伝える', '裁量拡大への欲求 → 入社後すぐにPM担当を持てることを訴求', 'ユーザーリサーチへの情熱 → 月10件のインタビュー文化を訴求'],
  },
  newgrad: {
    summary: '○○大学△△学部在籍。ゼミではデジタルマーケティングを研究し、学生団体ではプロダクト開発プロジェクトを主導。長期インターンでアプリ開発の企画を担当した経験あり。',
    keySkills: ['企画書作成', 'ユーザーインタビュー', 'プレゼンテーション', 'チームマネジメント', 'Python基礎', '英語'],
    careerHistory: [
      { company: 'IT企業Z（長期インターン）', role: 'プロダクト企画', period: '2024年6月〜2024年12月', highlights: ['新機能のユーザー調査（10件）を担当', '企画提案が実際のプロダクトに採用'] },
    ],
    education: [{ school: '○○大学', faculty: '△△学部', year: '2026年3月卒予定' }],
    certifications: ['TOEIC 780点'],
    strengths: ['課題発見・仮説構築力', 'チームリーダーシップ', '行動力と実行力'],
    motivationKeywords: ['若手裁量', 'ユーザー価値', '成長スピード', 'プロダクト志向'],
    attractAngleHints: ['インターンでのプロダクト企画経験 → 入社後すぐに実務に活かせることを訴求', '学生団体のリーダー経験 → 若手でもリーダー機会がある環境を訴求'],
  },
}

export default function DocumentsPage() {
  const params = useParams()
  const id = params.id as string
  const candidate = getCandidateById(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<UploadedDocument[]>(candidate?.documents ?? [])
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'selecting' | 'parsing' | 'done'>('idle')
  const [parseStep, setParseStep] = useState(0)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('resume')
  const [expandedDoc, setExpandedDoc] = useState<string | null>(documents.length > 0 ? documents[0].id : null)
  const [viewTab, setViewTab] = useState<'documents' | 'parsed'>('documents')
  const [showUploadModal, setShowUploadModal] = useState(false)

  if (!candidate) return <div className="p-8">候補者が見つかりません</div>

  const isNewgrad = candidate.hiringType === 'newgrad'

  const handleUpload = async () => {
    setUploadPhase('parsing')
    setParseStep(0)

    for (let i = 0; i < PARSE_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, PARSE_STEPS[i].duration))
      setParseStep(i + 1)
    }

    const demoData = isNewgrad ? DEMO_PARSED_DATA.newgrad : DEMO_PARSED_DATA.midcareer
    const newDoc: UploadedDocument = {
      id: `doc_new_${Date.now()}`,
      candidateId: candidate.id,
      type: selectedDocType,
      fileName: `${candidate.fullName.replace(' ', '')}_${DOCUMENT_LABELS[selectedDocType].label}.pdf`,
      fileSize: `${Math.floor(Math.random() * 300 + 100)} KB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: '佐藤 彩花',
      parseStatus: 'parsed',
      parsedData: demoData,
    }

    setDocuments((prev) => [...prev, newDoc])
    setUploadPhase('done')
    setExpandedDoc(newDoc.id)

    setTimeout(() => {
      setUploadPhase('idle')
      setShowUploadModal(false)
    }, 1500)
  }

  // 全書類からのスキル統合
  const allSkills = [...new Set(documents.flatMap(d => d.parsedData?.keySkills ?? []))]
  const allCerts = [...new Set(documents.flatMap(d => d.parsedData?.certifications ?? []))]
  const allStrengths = [...new Set(documents.flatMap(d => d.parsedData?.strengths ?? []))]
  const allAttractHints = [...new Set(documents.flatMap(d => d.parsedData?.attractAngleHints ?? []))]
  const allMotivation = [...new Set(documents.flatMap(d => d.parsedData?.motivationKeywords ?? []))]
  const parsedCount = documents.filter(d => d.parseStatus === 'parsed').length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.fullName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">書類管理・AI解析</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-gray-900">書類管理・AI解析</h1>
              {isNewgrad && (
                <span className="badge bg-pink-50 text-pink-700">
                  <GraduationCap className="w-3 h-3 mr-1" />新卒
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{candidate.fullName} — アップロード書類とAI抽出結果</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowUploadModal(true)} className="btn-primary">
              <Upload className="w-4 h-4" />
              書類をアップロード
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">書類をアップロード</h2>
              <button onClick={() => { setShowUploadModal(false); setUploadPhase('idle') }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {uploadPhase === 'idle' && (
                <>
                  {/* Document Type Selection */}
                  <p className="label mb-3">書類の種類を選択</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {(Object.entries(DOCUMENT_LABELS) as [DocumentType, typeof DOCUMENT_LABELS[DocumentType]][])
                      .filter(([key]) => isNewgrad ? true : key !== 'entry_sheet')
                      .map(([key, val]) => {
                        const Icon = val.icon
                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedDocType(key)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              selectedDocType === key
                                ? 'border-indigo-400 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-4 h-4 ${selectedDocType === key ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${selectedDocType === key ? 'text-indigo-900' : 'text-gray-700'}`}>
                                {val.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{val.description}</p>
                          </button>
                        )
                      })}
                  </div>

                  {/* Upload Area */}
                  <div
                    onClick={() => handleUpload()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                  >
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      クリックしてファイルを選択
                    </p>
                    <p className="text-xs text-gray-400">PDF / Word / 画像ファイル（最大10MB）</p>
                    <p className="text-xs text-gray-400 mt-1">※ デモ版ではクリックするとAI解析のデモが始まります</p>
                  </div>
                </>
              )}

              {uploadPhase === 'parsing' && (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">AI書類解析中...</p>
                      <p className="text-xs text-gray-400">書類の内容を読み取り、候補者カルテに反映します</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {PARSE_STEPS.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          parseStep > i ? 'bg-emerald-50' :
                          parseStep === i ? 'bg-indigo-50' :
                          'bg-gray-50'
                        }`}
                      >
                        {parseStep > i ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : parseStep === i ? (
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          parseStep > i ? 'text-emerald-700' :
                          parseStep === i ? 'text-indigo-700 font-medium' :
                          'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadPhase === 'done' && (
                <div className="py-6 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-1">AI解析完了！</p>
                  <p className="text-sm text-gray-500 mb-4">書類の内容が候補者カルテに反映されました</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-500" />スキル抽出</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3 text-emerald-500" />強み分析</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-violet-500" />Attractヒント生成</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Efficiency Banner */}
        {parsedCount > 0 && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">書類AI解析による業務効率化</p>
                <p className="text-xs text-violet-200">手作業で読み込む場合と比較</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{parsedCount}件</p>
                <p className="text-[10px] text-violet-200">解析済み書類</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{parsedCount * 15}分</p>
                <p className="text-[10px] text-violet-200">読込時間を節約</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-300">10秒</p>
                <p className="text-[10px] text-violet-200">AI解析（1件あたり）</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Document List + Details */}
          <div className="col-span-2 space-y-4">
            {/* Tab Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setViewTab('documents')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewTab === 'documents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                アップロード書類（{documents.length}）
              </button>
              <button
                onClick={() => setViewTab('parsed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewTab === 'parsed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Brain className="w-3.5 h-3.5 inline mr-1.5" />
                AI統合ビュー
              </button>
            </div>

            {viewTab === 'documents' && (
              <>
                {documents.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-base font-semibold text-gray-600 mb-2">書類がまだアップロードされていません</p>
                    <p className="text-sm text-gray-400 mb-4">
                      {isNewgrad
                        ? '履歴書・エントリーシートをアップロードすると、AIが自動解析して候補者カルテに反映します'
                        : '履歴書・職務経歴書をアップロードすると、AIが自動解析して候補者カルテに反映します'
                      }
                    </p>
                    <button onClick={() => setShowUploadModal(true)} className="btn-primary text-base px-6 py-3">
                      <Upload className="w-5 h-5" />
                      書類をアップロード
                    </button>
                  </div>
                ) : (
                  documents.map((doc) => {
                    const docLabel = DOCUMENT_LABELS[doc.type]
                    const DocIcon = docLabel.icon
                    const isExpanded = expandedDoc === doc.id
                    return (
                      <div key={doc.id} className={`card overflow-hidden ${isExpanded ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}>
                        <button
                          className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            doc.parseStatus === 'parsed' ? 'bg-indigo-50' : 'bg-gray-100'
                          }`}>
                            <DocIcon className={`w-5 h-5 ${doc.parseStatus === 'parsed' ? 'text-indigo-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900">{docLabel.label}</p>
                              {doc.parseStatus === 'parsed' && (
                                <span className="badge bg-emerald-50 text-emerald-700">
                                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />AI解析済み
                                </span>
                              )}
                              {doc.parseStatus === 'pending' && (
                                <span className="badge bg-amber-50 text-amber-600">
                                  <Clock className="w-2.5 h-2.5 mr-0.5" />解析待ち
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{doc.fileName} — {doc.fileSize} — {doc.uploadedAt}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {isExpanded && doc.parsedData && (
                          <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                            {/* Summary */}
                            <div>
                              <p className="label mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-500" />AI要約
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                {doc.parsedData.summary}
                              </p>
                            </div>

                            {/* Skills */}
                            <div>
                              <p className="label mb-2">抽出スキル</p>
                              <div className="flex flex-wrap gap-1.5">
                                {doc.parsedData.keySkills.map((skill, i) => (
                                  <span key={i} className="badge bg-blue-50 text-blue-700">{skill}</span>
                                ))}
                              </div>
                            </div>

                            {/* Career History */}
                            {doc.parsedData.careerHistory.length > 0 && (
                              <div>
                                <p className="label mb-2">経歴</p>
                                <div className="space-y-2">
                                  {doc.parsedData.careerHistory.map((career, i) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-800">{career.company}</p>
                                        <span className="text-xs text-gray-400">{career.period}</span>
                                      </div>
                                      <p className="text-xs text-gray-500 mb-1.5">{career.role}</p>
                                      <div className="space-y-0.5">
                                        {career.highlights.map((h, j) => (
                                          <div key={j} className="flex items-start gap-1.5">
                                            <span className="text-indigo-400 text-xs mt-0.5">•</span>
                                            <p className="text-xs text-gray-600">{h}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Certifications */}
                            {doc.parsedData.certifications.length > 0 && (
                              <div>
                                <p className="label mb-2 flex items-center gap-1">
                                  <Award className="w-3 h-3 text-amber-500" />資格・認定
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {doc.parsedData.certifications.map((cert, i) => (
                                    <span key={i} className="badge bg-amber-50 text-amber-700">{cert}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Strengths */}
                            <div>
                              <p className="label mb-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />強み
                              </p>
                              <div className="space-y-1">
                                {doc.parsedData.strengths.map((s, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">{s}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Attract Angle Hints */}
                            <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                              <p className="text-xs font-bold text-violet-800 mb-2 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5" />
                                AIが提案するAttractヒント
                              </p>
                              <div className="space-y-1.5">
                                {doc.parsedData.attractAngleHints.map((hint, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-1" />
                                    <p className="text-xs text-violet-700 leading-relaxed">{hint}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </>
            )}

            {viewTab === 'parsed' && parsedCount > 0 && (
              <div className="space-y-4">
                {/* Consolidated Profile from Documents */}
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-bold text-gray-900">書類から抽出した候補者プロファイル</h2>
                    <span className="badge bg-indigo-50 text-indigo-600">{parsedCount}件の書類を統合</span>
                  </div>

                  {/* Skills Matrix */}
                  <div className="mb-5">
                    <p className="label mb-2">スキル一覧（全書類統合）</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allSkills.map((skill, i) => (
                        <span key={i} className="badge bg-blue-50 text-blue-700">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {allCerts.length > 0 && (
                    <div className="mb-5">
                      <p className="label mb-2 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />資格・認定
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {allCerts.map((cert, i) => (
                          <span key={i} className="badge bg-amber-50 text-amber-700">{cert}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  <div className="mb-5">
                    <p className="label mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />強み（AI分析結果）
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {allStrengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 bg-emerald-50 rounded-lg p-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-800">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Motivation Keywords */}
                  <div className="mb-5">
                    <p className="label mb-2">モチベーションキーワード</p>
                    <div className="flex flex-wrap gap-2">
                      {allMotivation.map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full text-xs font-medium text-indigo-700 border border-indigo-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attract Hints Consolidated */}
                <div className="card p-5 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-violet-600" />
                    <h2 className="text-sm font-bold text-violet-900">AIが書類から提案するAttractヒント</h2>
                  </div>
                  <p className="text-xs text-violet-600 mb-3">
                    これらのヒントはAttract戦略の生成時に自動的に参照され、より精度の高い訴求ポイントの提案に活用されます。
                  </p>
                  <div className="space-y-2">
                    {allAttractHints.map((hint, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-violet-100">
                        <span className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-violet-800 leading-relaxed">{hint}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/candidates/${id}/attract`} className="btn-primary text-xs py-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Attract戦略に反映する
                    </Link>
                    <Link href={`/candidates/${id}`} className="btn-secondary text-xs py-2">
                      候補者カルテを確認
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {viewTab === 'parsed' && parsedCount === 0 && (
              <div className="card p-12 text-center">
                <Brain className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-base font-semibold text-gray-600 mb-2">AI統合ビューを利用するには</p>
                <p className="text-sm text-gray-400">書類をアップロードしてAI解析を実行してください</p>
              </div>
            )}
          </div>

          {/* Right: Summary Panel */}
          <div className="space-y-4">
            {/* Candidate Quick Info */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${candidate.avatarColor} flex items-center justify-center`}>
                  <span className="text-sm font-bold text-white">{candidate.avatarInitials[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{candidate.fullName}</p>
                  <p className="text-xs text-gray-400">{candidate.currentTitle}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">アップロード書類</span>
                  <span className="font-bold text-gray-700">{documents.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">AI解析済み</span>
                  <span className="font-bold text-emerald-600">{parsedCount}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">抽出スキル数</span>
                  <span className="font-bold text-indigo-600">{allSkills.length}件</span>
                </div>
              </div>
            </div>

            {/* What to Upload */}
            <div className="card p-5">
              <p className="text-xs font-bold text-gray-700 mb-3">アップロード推奨書類</p>
              <div className="space-y-2">
                {(isNewgrad
                  ? [
                      { type: 'resume', label: '履歴書', required: true },
                      { type: 'entry_sheet', label: 'エントリーシート', required: true },
                      { type: 'portfolio', label: 'ポートフォリオ', required: false },
                    ]
                  : [
                      { type: 'resume', label: '履歴書', required: true },
                      { type: 'cv', label: '職務経歴書', required: true },
                      { type: 'portfolio', label: 'ポートフォリオ', required: false },
                    ]
                ).map((item) => {
                  const uploaded = documents.some(d => d.type === item.type)
                  return (
                    <div key={item.type} className="flex items-center gap-2.5">
                      {uploaded ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                      )}
                      <span className={`text-xs ${uploaded ? 'text-emerald-700 line-through' : 'text-gray-600'}`}>
                        {item.label}
                      </span>
                      {item.required && !uploaded && (
                        <span className="badge bg-red-50 text-red-600 text-[10px]">必須</span>
                      )}
                      {uploaded && (
                        <span className="badge bg-emerald-50 text-emerald-600 text-[10px]">済</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Benefits */}
            <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
              <p className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                書類AI解析のメリット
              </p>
              <div className="space-y-2">
                {[
                  { title: 'カルテ精度が向上', desc: '書類情報がAIカルテに自動反映され、より精密な候補者理解が可能に' },
                  { title: 'Attract戦略が強化', desc: '書類から抽出したキーワードがAttract戦略の生成に活用される' },
                  { title: '面接準備時間を短縮', desc: '書類の読み込み・要約をAIが代行し、面接官は重要ポイントに集中できる' },
                ].map((b, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-800 mb-0.5">{b.title}</p>
                    <p className="text-[11px] text-indigo-600 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="card p-5">
              <p className="text-xs font-bold text-gray-700 mb-3">関連アクション</p>
              <div className="space-y-2">
                <Link href={`/candidates/${id}`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-gray-700">候補者詳細を見る</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                </Link>
                <Link href={`/candidates/${id}/signal-input`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <Brain className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-gray-700">シグナル入力</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                </Link>
                <Link href={`/candidates/${id}/attract`} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-gray-700">Attract戦略ボード</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
