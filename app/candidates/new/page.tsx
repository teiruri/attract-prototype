'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Target,
  TrendingUp,
  Link2,
  Users,
  Info,
  ChevronDown,
  Loader2,
} from 'lucide-react'

type DocPhase = 'idle' | 'uploading' | 'parsing' | 'preview' | 'saving' | 'done'
type CsvPhase = 'idle' | 'uploading' | 'preview' | 'importing' | 'done'

const CSV_PLATFORMS = [
  'リクナビ',
  'マイナビ',
  'doda',
  'ビズリーチ',
  'Green',
  'Wantedly',
  'その他',
]

const ATS_SYSTEMS = [
  { name: 'HRMOS', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'SmartHR', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'HERP', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { name: 'Talentio', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'カオナビ', color: 'bg-pink-50 text-pink-700 border-pink-200' },
]

interface ExtractedData {
  full_name?: string
  email?: string
  phone?: string
  current_company?: string
  current_title?: string
  skills?: string[]
  work_experience?: Array<{ company?: string; title?: string; period?: string; description?: string }>
  university?: string
  faculty?: string
  summary?: string
}

interface CsvPreview {
  candidates: Array<{ full_name?: string; email?: string; phone?: string; university?: string }>
  total: number
  columns: Record<string, string>
}

export default function NewCandidatePage() {
  const router = useRouter()

  // Document import state
  const [docPhase, setDocPhase] = useState<DocPhase>('idle')
  const [docError, setDocError] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [docFileName, setDocFileName] = useState('')
  const docFileRef = useRef<File | null>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // CSV import state
  const [csvPhase, setCsvPhase] = useState<CsvPhase>('idle')
  const [csvError, setCsvError] = useState('')
  const [csvPlatform, setCsvPlatform] = useState('ビズリーチ')
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null)
  const csvFileRef = useRef<File | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  // ========== Document Import ==========
  const handleDocFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!validTypes.includes(ext)) {
      setDocError('対応していないファイル形式です。PDF, Word, 画像ファイルをアップロードしてください。')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setDocError('ファイルサイズが10MBを超えています。')
      return
    }

    docFileRef.current = file
    setDocFileName(file.name)
    setDocError('')
    setDocPhase('parsing')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/candidates/import-document', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setDocError(data.error || '書類の解析に失敗しました')
        setDocPhase('idle')
        return
      }

      setExtractedData(data.extracted)
      setDocPhase('preview')
    } catch {
      setDocError('書類の解析に失敗しました。もう一度お試しください。')
      setDocPhase('idle')
    }
  }

  const handleCreateCandidate = async () => {
    if (!extractedData) return
    setDocPhase('done')
  }

  // ========== CSV Import ==========
  const handleCsvFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (ext !== '.csv' && ext !== '.xlsx' && ext !== '.xls') {
      setCsvError('CSV または Excel ファイルをアップロードしてください。')
      return
    }

    csvFileRef.current = file
    setCsvError('')
    setCsvPhase('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('platform', csvPlatform)

      const res = await fetch('/api/candidates/import-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setCsvError(data.error || 'CSVの解析に失敗しました')
        setCsvPhase('idle')
        return
      }

      setCsvPreview(data)
      setCsvPhase('preview')
    } catch {
      setCsvError('CSVの解析に失敗しました。')
      setCsvPhase('idle')
    }
  }

  const handleBulkImport = async () => {
    if (!csvFileRef.current) return
    setCsvPhase('importing')

    try {
      const formData = new FormData()
      formData.append('file', csvFileRef.current)
      formData.append('platform', csvPlatform)
      formData.append('confirm', 'true')

      const res = await fetch('/api/candidates/import-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setCsvError(data.error || '取り込みに失敗しました')
        setCsvPhase('preview')
        return
      }

      setCsvPhase('done')
    } catch {
      setCsvError('取り込みに失敗しました。')
      setCsvPhase('preview')
    }
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
          <div className="col-span-2 space-y-6">

            {/* ===== Card 1: 書類から取り込み ===== */}
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
                {/* Hidden file input */}
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleDocFileSelect}
                  className="hidden"
                />

                {docPhase === 'idle' && (
                  <>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex items-start gap-2.5">
                      <Brain className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        AIが書類を解析し、候補者情報を自動抽出します。手作業での入力は不要です。
                      </p>
                    </div>

                    {docError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-600">{docError}</p>
                      </div>
                    )}

                    <div
                      onClick={() => docInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        クリックしてファイルを選択
                      </p>
                      <p className="text-xs text-gray-400">PDF / Word / 画像ファイル対応（最大10MB）</p>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="badge bg-gray-100 text-gray-500">履歴書</span>
                        <span className="badge bg-gray-100 text-gray-500">職務経歴書</span>
                        <span className="badge bg-gray-100 text-gray-500">エントリーシート</span>
                      </div>
                    </div>
                  </>
                )}

                {docPhase === 'parsing' && (
                  <div className="py-6 text-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">AI書類解析中...</p>
                    <p className="text-xs text-gray-400 mb-1">{docFileName} を解析しています</p>
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin mx-auto mt-3" />
                  </div>
                )}

                {docPhase === 'preview' && extractedData && (
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm font-bold text-gray-900">解析完了 - 抽出結果のプレビュー</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        {extractedData.full_name && (
                          <div>
                            <p className="label mb-1">氏名</p>
                            <p className="text-sm font-medium text-gray-900">{extractedData.full_name}</p>
                          </div>
                        )}
                        {extractedData.email && (
                          <div>
                            <p className="label mb-1">メールアドレス</p>
                            <p className="text-sm text-gray-700">{extractedData.email}</p>
                          </div>
                        )}
                        {extractedData.current_company && (
                          <div>
                            <p className="label mb-1">現職企業</p>
                            <p className="text-sm text-gray-700">{extractedData.current_company}</p>
                          </div>
                        )}
                        {extractedData.current_title && (
                          <div>
                            <p className="label mb-1">役職</p>
                            <p className="text-sm text-gray-700">{extractedData.current_title}</p>
                          </div>
                        )}
                        {extractedData.university && (
                          <div>
                            <p className="label mb-1">大学</p>
                            <p className="text-sm text-gray-700">{extractedData.university}</p>
                          </div>
                        )}
                        {extractedData.phone && (
                          <div>
                            <p className="label mb-1">電話番号</p>
                            <p className="text-sm text-gray-700">{extractedData.phone}</p>
                          </div>
                        )}
                      </div>
                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div>
                          <p className="label mb-2">抽出スキル</p>
                          <div className="flex flex-wrap gap-1.5">
                            {extractedData.skills.map((skill, i) => (
                              <span key={i} className="badge bg-blue-50 text-blue-700">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {extractedData.summary && (
                        <div>
                          <p className="label mb-1">サマリー</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{extractedData.summary}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => { setDocPhase('idle'); setExtractedData(null) }} className="btn-secondary">
                        やり直す
                      </button>
                      <button onClick={handleCreateCandidate} className="btn-primary">
                        <Sparkles className="w-4 h-4" />
                        候補者として登録
                      </button>
                    </div>
                  </div>
                )}

                {docPhase === 'done' && (
                  <div className="py-6 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">候補者を登録しました！</p>
                    <p className="text-sm text-gray-500 mb-4">{extractedData?.full_name} さんの情報が保存されました</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setDocPhase('idle'); setExtractedData(null) }} className="btn-secondary">
                        続けて取り込む
                      </button>
                      <Link href="/candidates" className="btn-primary">
                        候補者一覧へ
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Card 2: 媒体CSVから一括取り込み ===== */}
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
                {/* Hidden file input */}
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCsvFileSelect}
                  className="hidden"
                />

                {csvPhase === 'idle' && (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-start gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        CSVファイルから候補者を一括登録します。各媒体のフォーマットに自動対応。
                      </p>
                    </div>

                    {csvError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-600">{csvError}</p>
                      </div>
                    )}

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
                      onClick={() => csvInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                    >
                      <FileSpreadsheet className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        クリックしてCSVファイルを選択
                      </p>
                      <p className="text-xs text-gray-400">CSV形式（最大50MB）</p>
                    </div>
                  </>
                )}

                {csvPhase === 'uploading' && (
                  <div className="py-6 text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">CSVを解析中...</p>
                    <p className="text-xs text-gray-400">{csvPlatform}のフォーマットで候補者を検出しています</p>
                  </div>
                )}

                {csvPhase === 'preview' && csvPreview && (
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm font-bold text-gray-900">
                        <span className="text-emerald-600">{csvPreview.total}名</span>の候補者が検出されました
                      </p>
                      <span className="badge bg-gray-100 text-gray-500 ml-1">{csvPlatform}</span>
                    </div>

                    {csvError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-600">{csvError}</p>
                      </div>
                    )}

                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">氏名</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">メール</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">電話</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">大学</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {csvPreview.candidates.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{c.full_name || '—'}</td>
                              <td className="px-4 py-2.5 text-sm text-gray-500">{c.email || '—'}</td>
                              <td className="px-4 py-2.5 text-sm text-gray-500">{c.phone || '—'}</td>
                              <td className="px-4 py-2.5 text-sm text-gray-500">{c.university || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvPreview.total > csvPreview.candidates.length && (
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                          <p className="text-xs text-gray-400">他 {csvPreview.total - csvPreview.candidates.length}名... プレビューは上位{csvPreview.candidates.length}名を表示</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button onClick={() => { setCsvPhase('idle'); setCsvPreview(null); setCsvError('') }} className="btn-secondary">
                        キャンセル
                      </button>
                      <button onClick={handleBulkImport} className="btn-primary">
                        <Users className="w-4 h-4" />
                        一括取り込み（{csvPreview.total}名）
                      </button>
                    </div>
                  </div>
                )}

                {csvPhase === 'importing' && (
                  <div className="py-6 text-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-900 mb-1">取り込み中...</p>
                    <p className="text-xs text-gray-400">候補者をデータベースに登録しています</p>
                  </div>
                )}

                {csvPhase === 'done' && (
                  <div className="py-6 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">{csvPreview?.total}名の候補者を取り込みました！</p>
                    <p className="text-sm text-gray-500 mb-4">候補者一覧から確認できます</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setCsvPhase('idle'); setCsvPreview(null) }} className="btn-secondary">
                        続けて取り込む
                      </button>
                      <Link href="/candidates" className="btn-primary">
                        候補者一覧へ
                      </Link>
                    </div>
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
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2.5 border border-indigo-200">
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    <span className="font-semibold">書類取り込み:</span> Claude AIが履歴書・職務経歴書から氏名、スキル、経歴を自動抽出します。
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
              <p className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI解析について
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700">基本情報（氏名・連絡先）を自動抽出</p>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700">スキル・経歴を構造化データに変換</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700">候補者のサマリーを自動生成</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
