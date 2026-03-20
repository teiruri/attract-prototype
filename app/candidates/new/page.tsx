'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Brain,
  Sparkles,
  Zap,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  Link2,
  Users,
  Eye,
  ArrowRight,
  Info,
  ChevronDown,
} from 'lucide-react'

type ImportPhase = 'idle' | 'parsing' | 'preview' | 'done'
type CsvPhase = 'idle' | 'detecting' | 'preview' | 'done'

const PARSE_STEPS = [
  { label: '書類読み取り', duration: 700 },
  { label: 'テキスト抽出', duration: 500 },
  { label: '基本情報の特定', duration: 600 },
  { label: 'スキル・経歴の構造化', duration: 700 },
  { label: 'Attractヒント生成', duration: 600 },
  { label: '候補者カルテ作成', duration: 500 },
]

const CSV_PLATFORMS = [
  'リクナビ',
  'マイナビ',
  'doda',
  'ビズリーチ',
  'Green',
  'Wantedly',
  'その他',
]

const DEMO_EXTRACTED = {
  name: '田中 美咲',
  email: 'tanaka.misaki@example.com',
  company: '株式会社テックフォワード',
  title: 'プロダクトマネージャー',
  skills: ['プロダクトマネジメント', 'ユーザーリサーチ', 'KPI設計', 'アジャイル開発', 'SQL', 'Figma'],
}

const DEMO_CSV_CANDIDATES = [
  { name: '佐藤 健太', email: 'sato.kenta@example.com', position: 'フロントエンドエンジニア', source: 'ビズリーチ' },
  { name: '鈴木 麻衣', email: 'suzuki.mai@example.com', position: 'バックエンドエンジニア', source: 'ビズリーチ' },
  { name: '高橋 拓也', email: 'takahashi.takuya@example.com', position: 'プロダクトマネージャー', source: 'ビズリーチ' },
]

const ATS_SYSTEMS = [
  { name: 'HRMOS', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'SmartHR', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'HERP', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { name: 'Talentio', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'カオナビ', color: 'bg-pink-50 text-pink-700 border-pink-200' },
]

export default function NewCandidatePage() {
  // Document import state
  const [docPhase, setDocPhase] = useState<ImportPhase>('idle')
  const [parseStep, setParseStep] = useState(0)

  // CSV import state
  const [csvPhase, setCsvPhase] = useState<CsvPhase>('idle')
  const [csvPlatform, setCsvPlatform] = useState('ビズリーチ')
  const [csvCount] = useState(12)

  // Success states
  const [docSuccess, setDocSuccess] = useState(false)
  const [csvSuccess, setCsvSuccess] = useState(false)

  const handleDocUpload = async () => {
    setDocPhase('parsing')
    setParseStep(0)

    for (let i = 0; i < PARSE_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, PARSE_STEPS[i].duration))
      setParseStep(i + 1)
    }

    setDocPhase('preview')
  }

  const handleCreateKarte = () => {
    setDocPhase('done')
    setDocSuccess(true)
    setTimeout(() => {
      setDocPhase('idle')
      setDocSuccess(false)
    }, 3000)
  }

  const handleCsvUpload = async () => {
    setCsvPhase('detecting')
    await new Promise((r) => setTimeout(r, 1200))
    setCsvPhase('preview')
  }

  const handleBulkImport = () => {
    setCsvPhase('done')
    setCsvSuccess(true)
    setTimeout(() => {
      setCsvPhase('idle')
      setCsvSuccess(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">候補者を取り込む</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">候補者を取り込む</h1>
            <p className="text-sm text-gray-500 mt-0.5">書類・CSV・ATS連携から候補者を自動インポート</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main content: 2 columns */}
          <div className="col-span-2 space-y-6">

            {/* Card 1: 書類から取り込み */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">書類から取り込み（AI自動解析）</h2>
                  <p className="text-xs text-gray-400">履歴書・職務経歴書・エントリーシートをAIが自動解析</p>
                </div>
                <span className="badge bg-indigo-50 text-indigo-600 ml-auto">
                  <Sparkles className="w-3 h-3 mr-0.5" />推奨
                </span>
              </div>

              <div className="mt-4">
                {docPhase === 'idle' && !docSuccess && (
                  <>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex items-start gap-2.5">
                      <Brain className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        AIが書類を解析し、候補者カルテを自動生成します。手作業での入力は不要です。
                      </p>
                    </div>
                    <div
                      onClick={handleDocUpload}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        ドラッグ＆ドロップ または クリックしてファイルを選択
                      </p>
                      <p className="text-xs text-gray-400">PDF / Word / 画像ファイル対応（最大10MB）</p>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="badge bg-gray-100 text-gray-500">履歴書</span>
                        <span className="badge bg-gray-100 text-gray-500">職務経歴書</span>
                        <span className="badge bg-gray-100 text-gray-500">エントリーシート</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-3">※ デモ版ではクリックするとAI解析のデモが始まります</p>
                    </div>
                  </>
                )}

                {docPhase === 'parsing' && (
                  <div className="py-2">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">AI書類解析中...</p>
                        <p className="text-xs text-gray-400">書類の内容を読み取り、候補者カルテに反映します</p>
                      </div>
                    </div>
                    <div className="space-y-2">
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

                {docPhase === 'preview' && (
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm font-bold text-gray-900">解析完了 - 抽出結果のプレビュー</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="label mb-1">氏名</p>
                          <p className="text-sm font-medium text-gray-900">{DEMO_EXTRACTED.name}</p>
                        </div>
                        <div>
                          <p className="label mb-1">メールアドレス</p>
                          <p className="text-sm text-gray-700">{DEMO_EXTRACTED.email}</p>
                        </div>
                        <div>
                          <p className="label mb-1">現職企業</p>
                          <p className="text-sm text-gray-700">{DEMO_EXTRACTED.company}</p>
                        </div>
                        <div>
                          <p className="label mb-1">役職</p>
                          <p className="text-sm text-gray-700">{DEMO_EXTRACTED.title}</p>
                        </div>
                      </div>
                      <div>
                        <p className="label mb-2">抽出スキル</p>
                        <div className="flex flex-wrap gap-1.5">
                          {DEMO_EXTRACTED.skills.map((skill, i) => (
                            <span key={i} className="badge bg-blue-50 text-blue-700">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setDocPhase('idle')} className="btn-secondary">
                        やり直す
                      </button>
                      <button onClick={handleCreateKarte} className="btn-primary">
                        <Sparkles className="w-4 h-4" />
                        カルテを作成
                      </button>
                    </div>
                  </div>
                )}

                {docSuccess && (
                  <div className="py-6 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">候補者カルテを作成しました！</p>
                    <p className="text-sm text-gray-500">デモ版のため実際のデータは保存されません</p>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-500" />スキル抽出完了</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3 text-emerald-500" />強み分析完了</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-violet-500" />Attractヒント生成完了</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: 媒体CSVから一括取り込み */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">媒体CSVから一括取り込み</h2>
                  <p className="text-xs text-gray-400">求人媒体からエクスポートしたCSVを一括インポート</p>
                </div>
              </div>

              <div className="mt-4">
                {csvPhase === 'idle' && !csvSuccess && (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-start gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        CSVファイルから候補者を一括登録します。各媒体のフォーマットに自動対応。
                      </p>
                    </div>

                    {/* Platform selector */}
                    <div className="mb-4">
                      <p className="label mb-2">媒体を選択</p>
                      <div className="relative">
                        <select
                          value={csvPlatform}
                          onChange={(e) => setCsvPlatform(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white pr-8"
                        >
                          {CSV_PLATFORMS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div
                      onClick={handleCsvUpload}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                    >
                      <FileSpreadsheet className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        CSVファイルをドロップ または クリック
                      </p>
                      <p className="text-xs text-gray-400">CSV / Excel形式（最大50MB）</p>
                      <p className="text-[11px] text-gray-400 mt-2">※ デモ版ではクリックするとCSV取り込みのデモが始まります</p>
                    </div>
                  </>
                )}

                {csvPhase === 'detecting' && (
                  <div className="py-6 text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">CSVを解析中...</p>
                    <p className="text-xs text-gray-400">{csvPlatform}のフォーマットで候補者を検出しています</p>
                  </div>
                )}

                {csvPhase === 'preview' && (
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm font-bold text-gray-900">
                        <span className="text-emerald-600">{csvCount}名</span>の候補者が検出されました
                      </p>
                      <span className="badge bg-gray-100 text-gray-500 ml-1">{csvPlatform}</span>
                    </div>

                    {/* Preview table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">氏名</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">メール</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">希望職種</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">媒体</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {DEMO_CSV_CANDIDATES.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{c.name}</td>
                              <td className="px-4 py-2.5 text-sm text-gray-500">{c.email}</td>
                              <td className="px-4 py-2.5 text-sm text-gray-700">{c.position}</td>
                              <td className="px-4 py-2.5">
                                <span className="badge bg-gray-100 text-gray-600">{c.source}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-400">他 {csvCount - 3}名... プレビューは上位3名を表示</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setCsvPhase('idle')} className="btn-secondary">
                        キャンセル
                      </button>
                      <button onClick={handleBulkImport} className="btn-primary">
                        <Users className="w-4 h-4" />
                        一括取り込み（{csvCount}名）
                      </button>
                    </div>
                  </div>
                )}

                {csvSuccess && (
                  <div className="py-6 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">{csvCount}名の候補者を取り込みました！</p>
                    <p className="text-sm text-gray-500">デモ版のため実際のデータは保存されません</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: ATS連携 */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">ATS連携（自動同期）</h2>
                  <p className="text-xs text-gray-400">既存のATSと連携し、候補者情報を自動同期します</p>
                </div>
                <span className="badge bg-amber-50 text-amber-600 ml-auto">Phase 2で対応予定</span>
              </div>

              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    既存のATSと連携し、候補者情報を自動同期します。一度連携すれば、ATS上で新規候補者が登録されると自動的に取り込まれます。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {ATS_SYSTEMS.map((ats) => (
                    <div key={ats.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Link2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{ats.name}</span>
                      </div>
                      <span className="badge bg-gray-100 text-gray-400">連携準備中</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom: Back link */}
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <Link href="/candidates" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                候補者一覧に戻る
              </Link>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Import stats */}
            <div className="card p-5">
              <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                今月の取り込み
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">書類から取り込み</span>
                  <span className="text-sm font-bold text-gray-900">24名</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">CSV一括取り込み</span>
                  <span className="text-sm font-bold text-gray-900">48名</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">ATS連携</span>
                  <span className="text-sm font-bold text-gray-400">-</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">合計</span>
                  <span className="text-base font-bold text-indigo-600">72名</span>
                </div>
              </div>
            </div>

            {/* AI accuracy */}
            <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
              <p className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI解析パフォーマンス
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-indigo-600">AI解析の精度</span>
                    <span className="text-lg font-bold text-indigo-800">98.5%</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '98.5%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-indigo-600">平均処理時間</span>
                    <span className="text-lg font-bold text-indigo-800">8秒<span className="text-xs font-normal text-indigo-500">/件</span></span>
                  </div>
                </div>
                <div className="border-t border-indigo-200 pt-2 flex justify-between items-center">
                  <span className="text-xs text-indigo-600">手作業比での時短効果</span>
                  <span className="text-sm font-bold text-emerald-600">約95%削減</span>
                </div>
              </div>
            </div>

            {/* Supported formats tip */}
            <div className="card p-5">
              <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                対応フォーマット
              </p>
              <div className="space-y-2.5">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">書類取り込み</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">PDF</span>
                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">Word (.docx)</span>
                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">画像 (JPG/PNG)</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">CSV取り込み</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">CSV (.csv)</span>
                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">Excel (.xlsx)</span>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <span className="font-semibold">Tip:</span> 複数書類を同時にアップロードすると、AIが自動で書類種別を判定します。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
