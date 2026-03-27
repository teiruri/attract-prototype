'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  File,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Brain,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react'

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
  graduation_year?: number
  summary?: string
}

interface DocResult {
  fileName: string
  status: 'pending' | 'parsing' | 'done' | 'error'
  extracted?: ExtractedData
  error?: string
}

interface CandidateDocument {
  id: string
  candidate_id: string
  document_type: string
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  created_at: string
}

interface Candidate {
  id: string
  full_name: string
  email?: string
  phone?: string
  current_company?: string
  current_title?: string
  university?: string
  faculty?: string
  work_experience?: Array<{ company?: string; title?: string; period?: string; description?: string }>
  candidate_documents?: CandidateDocument[]
  [key: string]: unknown
}

const DOC_TYPE_LABELS: Record<string, string> = {
  resume: '履歴書',
  cv: '職務経歴書',
  entry_sheet: 'エントリーシート',
  portfolio: 'ポートフォリオ',
  other: 'その他',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return dateStr
  }
}

export default function DocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Candidate data
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Upload state
  const [docResults, setDocResults] = useState<DocResult[]>([])
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'parsing' | 'preview' | 'saving' | 'done'>('idle')
  const [uploadError, setUploadError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  // Fetch candidate data on mount
  const fetchCandidate = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/candidates/${id}`)
      if (!res.ok) {
        setFetchError('候補者データの取得に失敗しました')
        return
      }
      const data = await res.json()
      setCandidate(data.candidate)
    } catch {
      setFetchError('候補者データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCandidate()
  }, [fetchCandidate])

  // Process files (shared between click and drag-drop)
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp']
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!validTypes.includes(ext)) {
        errors.push(`${file.name}: 対応していない形式です`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: 10MBを超えています`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      setUploadError(errors.join('、'))
      return
    }

    setUploadError(errors.length > 0 ? errors.join('、') : '')

    // Initialize results
    const initialResults: DocResult[] = validFiles.map(f => ({
      fileName: f.name,
      status: 'pending',
    }))
    setDocResults(initialResults)
    setUploadPhase('parsing')

    // Process files sequentially
    const updatedResults = [...initialResults]
    for (let i = 0; i < validFiles.length; i++) {
      updatedResults[i] = { ...updatedResults[i], status: 'parsing' }
      setDocResults([...updatedResults])

      try {
        const formData = new FormData()
        formData.append('file', validFiles[i])
        formData.append('save', 'false')

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000)

        const res = await fetch('/api/candidates/import-document', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        const data = await res.json()

        if (!res.ok) {
          updatedResults[i] = { ...updatedResults[i], status: 'error', error: data.error || '解析失敗' }
        } else {
          updatedResults[i] = { ...updatedResults[i], status: 'done', extracted: data.extracted }
        }
      } catch (err) {
        const message = err instanceof DOMException && err.name === 'AbortError'
          ? 'タイムアウト: AI解析に時間がかかりすぎています。'
          : '通信エラーが発生しました。'
        updatedResults[i] = { ...updatedResults[i], status: 'error', error: message }
      }
      setDocResults([...updatedResults])
    }

    // Also upload each file to storage via the documents API
    for (const file of validFiles) {
      try {
        const storageForm = new FormData()
        storageForm.append('file', file)
        storageForm.append('document_type', 'other')
        storageForm.append('tenant_id', '00000000-0000-0000-0000-000000000001')

        await fetch(`/api/candidates/${id}/documents`, {
          method: 'POST',
          body: storageForm,
        })
      } catch {
        // Storage upload failure is non-blocking
      }
    }

    setUploadPhase('preview')

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) processFiles(files)
  }

  // Merge extracted data and update candidate
  const handleUpdateCandidate = async () => {
    const allExtracted = docResults
      .filter(r => r.status === 'done' && r.extracted)
      .map(r => r.extracted!)

    if (allExtracted.length === 0) return

    // Merge all extracted data
    const merged: ExtractedData = {}
    for (const data of allExtracted) {
      if (!merged.full_name && data.full_name) merged.full_name = data.full_name
      if (!merged.email && data.email) merged.email = data.email
      if (!merged.phone && data.phone) merged.phone = data.phone
      if (!merged.current_company && data.current_company) merged.current_company = data.current_company
      if (!merged.current_title && data.current_title) merged.current_title = data.current_title
      if (!merged.university && data.university) merged.university = data.university
      if (!merged.faculty && data.faculty) merged.faculty = data.faculty
      if (data.skills?.length) {
        merged.skills = [...new Set([...(merged.skills || []), ...data.skills])]
      }
      if (data.work_experience?.length) {
        merged.work_experience = [...(merged.work_experience || []), ...data.work_experience]
      }
      if (data.summary) {
        merged.summary = merged.summary ? `${merged.summary} ${data.summary}` : data.summary
      }
    }

    // Merge with existing candidate data (only fill in missing fields)
    const updatePayload: Record<string, unknown> = {}
    if (merged.full_name && (!candidate?.full_name || candidate.full_name === '氏名不明'))
      updatePayload.full_name = merged.full_name
    if (merged.email && !candidate?.email) updatePayload.email = merged.email
    if (merged.phone && !candidate?.phone) updatePayload.phone = merged.phone
    if (merged.university && !candidate?.university) updatePayload.university = merged.university
    if (merged.faculty && !candidate?.faculty) updatePayload.faculty = merged.faculty

    // Always merge work experience (append new entries)
    if (merged.work_experience?.length) {
      const existing = candidate?.work_experience || []
      updatePayload.work_experience = [...existing, ...merged.work_experience]
    }

    if (Object.keys(updatePayload).length === 0) {
      // Nothing to update, still mark as done
      setUploadPhase('done')
      await fetchCandidate()
      return
    }

    setUploadPhase('saving')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        setUploadError('候補者情報の更新に失敗しました')
        setUploadPhase('preview')
        return
      }

      setUploadPhase('done')
      await fetchCandidate()
    } catch {
      setUploadError('候補者情報の更新に失敗しました')
      setUploadPhase('preview')
    }
  }

  const successCount = docResults.filter(r => r.status === 'done').length
  const errorCount = docResults.filter(r => r.status === 'error').length
  const existingDocs = candidate?.candidate_documents || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
      </div>
    )
  }

  if (fetchError || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">{fetchError || '候補者が見つかりません'}</p>
          <Link href="/candidates" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
            候補者一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <Link href="/candidates" className="hover:text-gray-600">候補者管理</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/candidates/${id}`} className="hover:text-gray-600">{candidate.full_name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">書類管理</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/candidates/${id}`)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{candidate.full_name} の書類管理</h1>
              <p className="text-sm text-gray-500 mt-0.5">書類のアップロードとAI自動解析</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-6">

        {/* Existing Documents */}
        {existingDocs.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-900">登録済み書類（{existingDocs.length}件）</h2>
            </div>
            <div className="space-y-2">
              {existingDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <File className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                    <p className="text-xs text-gray-400">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type} — {formatFileSize(doc.file_size)} — {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">書類をアップロード（AI自動解析）</h2>
              <p className="text-xs text-gray-400">履歴書・職務経歴書をAIが自動解析し、候補者情報を更新します</p>
            </div>
            <span className="badge bg-indigo-50 text-indigo-600 ml-auto">
              <Sparkles className="w-3 h-3 mr-0.5" />AI解析
            </span>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />

          {uploadPhase === 'idle' && (
            <>
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{uploadError}</p>
                  <button onClick={() => setUploadError('')} className="ml-auto text-red-400 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                }`}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragOver ? 'text-indigo-500' : 'text-gray-300'}`} />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  クリックまたはドラッグ&ドロップでファイルを選択（複数選択可）
                </p>
                <p className="text-xs text-gray-400">PDF / Word / 画像ファイル対応（各最大10MB）</p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="badge bg-gray-100 text-gray-500">履歴書</span>
                  <span className="badge bg-gray-100 text-gray-500">職務経歴書</span>
                  <span className="badge bg-gray-100 text-gray-500">エントリーシート</span>
                </div>
              </div>
            </>
          )}

          {uploadPhase === 'parsing' && (
            <div className="py-2">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-gray-900">AI書類解析中...</p>
                  <p className="text-xs text-gray-400">
                    {docResults.filter(r => r.status === 'done' || r.status === 'error').length} / {docResults.length} 件処理済み
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {docResults.map((result, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.status === 'done' ? 'bg-emerald-50' :
                      result.status === 'parsing' ? 'bg-indigo-50' :
                      result.status === 'error' ? 'bg-red-50' :
                      'bg-gray-50'
                    }`}
                  >
                    {result.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    {result.status === 'parsing' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />}
                    {result.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    {result.status === 'pending' && <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        result.status === 'done' ? 'text-emerald-700' :
                        result.status === 'parsing' ? 'text-indigo-700 font-medium' :
                        result.status === 'error' ? 'text-red-700' :
                        'text-gray-400'
                      }`}>
                        {result.fileName}
                      </p>
                      {result.status === 'done' && result.extracted?.full_name && (
                        <p className="text-xs text-emerald-600 mt-0.5">&#x2192; {result.extracted.full_name}</p>
                      )}
                      {result.status === 'error' && (
                        <p className="text-xs text-red-500 mt-0.5">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadPhase === 'preview' && (
            <div className="py-2">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-gray-900">
                  解析完了 &#x2014; <span className="text-emerald-600">{successCount}件</span>成功
                  {errorCount > 0 && <span className="text-red-500 ml-1">（{errorCount}件エラー）</span>}
                </p>
              </div>

              {/* Show extracted data from each file */}
              <div className="space-y-3 mb-4">
                {docResults.filter(r => r.status === 'done' && r.extracted).map((result, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-400 truncate">{result.fileName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {result.extracted?.full_name && (
                        <div>
                          <p className="text-[10px] text-gray-400">氏名</p>
                          <p className="text-sm font-medium text-gray-900">{result.extracted.full_name}</p>
                        </div>
                      )}
                      {result.extracted?.email && (
                        <div>
                          <p className="text-[10px] text-gray-400">メール</p>
                          <p className="text-sm text-gray-700">{result.extracted.email}</p>
                        </div>
                      )}
                      {result.extracted?.current_company && (
                        <div>
                          <p className="text-[10px] text-gray-400">現職</p>
                          <p className="text-sm text-gray-700">{result.extracted.current_company}</p>
                        </div>
                      )}
                      {result.extracted?.current_title && (
                        <div>
                          <p className="text-[10px] text-gray-400">役職</p>
                          <p className="text-sm text-gray-700">{result.extracted.current_title}</p>
                        </div>
                      )}
                      {result.extracted?.university && (
                        <div>
                          <p className="text-[10px] text-gray-400">大学</p>
                          <p className="text-sm text-gray-700">{result.extracted.university}</p>
                        </div>
                      )}
                    </div>
                    {result.extracted?.skills && result.extracted.skills.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {result.extracted.skills.slice(0, 6).map((skill, j) => (
                            <span key={j} className="badge bg-blue-50 text-blue-700 text-[10px]">{skill}</span>
                          ))}
                          {result.extracted.skills.length > 6 && (
                            <span className="badge bg-gray-100 text-gray-400 text-[10px]">+{result.extracted.skills.length - 6}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {result.extracted?.summary && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{result.extracted.summary}</p>
                    )}
                  </div>
                ))}

                {docResults.filter(r => r.status === 'error').map((result, i) => (
                  <div key={`err-${i}`} className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-700">{result.fileName}</p>
                      <p className="text-xs text-red-500">{result.error}</p>
                    </div>
                  </div>
                ))}
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-600">{uploadError}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setUploadPhase('idle'); setDocResults([]); setUploadError('') }}
                  className="btn-secondary"
                >
                  やり直す
                </button>
                {successCount > 0 && (
                  <button onClick={handleUpdateCandidate} className="btn-primary">
                    <Sparkles className="w-4 h-4" />
                    抽出データで候補者情報を更新
                  </button>
                )}
              </div>
            </div>
          )}

          {uploadPhase === 'saving' && (
            <div className="py-6 text-center">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-900">候補者情報を更新中...</p>
            </div>
          )}

          {uploadPhase === 'done' && (
            <div className="py-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">書類をアップロードし、候補者情報を更新しました</p>
              <p className="text-sm text-gray-500 mb-4">
                {successCount}件の書類から情報を抽出・反映しました
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setUploadPhase('idle'); setDocResults([]); setUploadError('') }}
                  className="btn-secondary"
                >
                  続けてアップロード
                </button>
                <Link href={`/candidates/${id}`} className="btn-primary">
                  候補者詳細を確認
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
