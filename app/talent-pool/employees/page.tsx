'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Users,
  Building2,
  Search,
  Plus,
  X,
  Edit3,
  Trash2,
  UserCheck,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Loader2,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  ClipboardPaste,
  Download,
  CheckCircle2,
} from 'lucide-react'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

interface Employee {
  id: string
  name: string
  department: string
  role: string
  title: string
  years_at_company: number
  skills: string[]
  personality_tags: string[]
  interview_style: string
  bio: string
  available_for: string[]
}

const ROLE_OPTIONS = ['面接官', 'リクルーター', 'マネージャー', 'メンター']
const AVAILABLE_FOR_OPTIONS = ['面接官', 'リクルーター', 'メンター', '社員面談']

const roleColors: Record<string, string> = {
  '面接官': 'bg-blue-100 text-blue-700',
  'リクルーター': 'bg-green-100 text-green-700',
  'マネージャー': 'bg-purple-100 text-purple-700',
  'メンター': 'bg-amber-100 text-amber-700',
}

const skillColors = [
  'bg-indigo-50 text-indigo-700',
  'bg-rose-50 text-rose-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-cyan-50 text-cyan-700',
  'bg-violet-50 text-violet-700',
]

function getSkillColor(index: number) {
  return skillColors[index % skillColors.length]
}

const emptyEmployee: Omit<Employee, 'id'> = {
  name: '',
  department: '',
  role: '面接官',
  title: '',
  years_at_company: 0,
  skills: [],
  personality_tags: [],
  interview_style: '',
  bio: '',
  available_for: [],
}

export default function EmployeeTalentPoolPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(emptyEmployee)
  const [saving, setSaving] = useState(false)
  const [skillsInput, setSkillsInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkMode, setBulkMode] = useState<'csv' | 'paste'>('paste')
  const [bulkText, setBulkText] = useState('')
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ success: number; errors: string[] } | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/employees')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setEmployees(json.employees || [])
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  )

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (deptFilter !== 'all' && e.department !== deptFilter) return false
      if (roleFilter !== 'all' && e.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const searchable = `${e.name}${e.department}${e.role}${e.title}${e.skills.join('')}${e.personality_tags.join('')}`
        return searchable.toLowerCase().includes(q)
      }
      return true
    })
  }, [employees, searchQuery, deptFilter, roleFilter])

  const openAddModal = () => {
    setEditingEmployee(null)
    setFormData(emptyEmployee)
    setSkillsInput('')
    setTagsInput('')
    setShowModal(true)
  }

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp)
    setFormData({
      name: emp.name,
      department: emp.department,
      role: emp.role,
      title: emp.title,
      years_at_company: emp.years_at_company,
      skills: emp.skills,
      personality_tags: emp.personality_tags,
      interview_style: emp.interview_style,
      bio: emp.bio,
      available_for: emp.available_for,
    })
    setSkillsInput(emp.skills.join(', '))
    setTagsInput(emp.personality_tags.join(', '))
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...formData,
        skills: skillsInput.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
        personality_tags: tagsInput.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
      }

      if (editingEmployee) {
        const res = await fetch('/api/employees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEmployee.id, ...payload }),
        })
        const json = await res.json()
        if (json.error) throw new Error(json.error)
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (json.error) throw new Error(json.error)
      }

      setShowModal(false)
      fetchEmployees()
    } catch (err) {
      alert('保存に失敗しました: ' + String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この社員を削除しますか？')) return
    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      fetchEmployees()
    } catch (err) {
      alert('削除に失敗しました: ' + String(err))
    }
  }

  const toggleAvailableFor = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      available_for: prev.available_for.includes(item)
        ? prev.available_for.filter((a) => a !== item)
        : [...prev.available_for, item],
    }))
  }

  // --- Bulk Import ---
  const openBulkModal = () => {
    setBulkText('')
    setBulkResult(null)
    setBulkMode('paste')
    setShowBulkModal(true)
  }

  const parseCsvRows = (text: string): Omit<Employee, 'id'>[] => {
    const lines = text.trim().split('\n').filter(Boolean)
    if (lines.length === 0) return []

    // Detect header row
    const firstLine = lines[0].toLowerCase()
    const hasHeader = firstLine.includes('名前') || firstLine.includes('氏名') || firstLine.includes('name') || firstLine.includes('部署')
    const dataLines = hasHeader ? lines.slice(1) : lines

    return dataLines.map((line) => {
      // Support tab or comma as delimiter
      const cols = line.includes('\t') ? line.split('\t') : line.split(',')
      const get = (i: number) => (cols[i] || '').trim()
      return {
        name: get(0),
        department: get(1),
        title: get(2),
        role: get(3) || '面接官',
        years_at_company: parseInt(get(4)) || 0,
        skills: get(5) ? get(5).split(/[;；|｜\/]/).map(s => s.trim()).filter(Boolean) : [],
        personality_tags: get(6) ? get(6).split(/[;；|｜\/]/).map(s => s.trim()).filter(Boolean) : [],
        interview_style: get(7) || '',
        bio: get(8) || '',
        available_for: get(9) ? get(9).split(/[;；|｜\/]/).map(s => s.trim()).filter(Boolean) : [],
      }
    }).filter(e => e.name) // name is required
  }

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setBulkText(text)
      setBulkMode('csv')
    }
    reader.readAsText(file, 'UTF-8')

    if (csvInputRef.current) csvInputRef.current.value = ''
  }

  const handleBulkImport = async () => {
    const rows = parseCsvRows(bulkText)
    if (rows.length === 0) {
      setBulkResult({ success: 0, errors: ['有効なデータが見つかりませんでした'] })
      return
    }

    setBulkImporting(true)
    const errors: string[] = []
    let success = 0

    for (const row of rows) {
      try {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        })
        const json = await res.json()
        if (json.error) {
          errors.push(`${row.name}: ${json.error}`)
        } else {
          success++
        }
      } catch (err) {
        errors.push(`${row.name}: ${String(err)}`)
      }
    }

    setBulkResult({ success, errors })
    setBulkImporting(false)
    if (success > 0) fetchEmployees()
  }

  const downloadCsvTemplate = () => {
    const header = '氏名,部署,肩書,役割,在籍年数,スキル(;区切り),パーソナリティ(;区切り),面接スタイル,紹介文,対応可能(;区切り)'
    const sample1 = '山田太郎,エンジニアリング部,テックリード,面接官,5,TypeScript;React;AWS,論理的;共感力,構造化面接,フルスタックエンジニア,面接官;メンター'
    const sample2 = '田中花子,人事部,採用マネージャー,リクルーター,3,採用戦略;面談設計,コミュニケーション力;傾聴力,カジュアル面談型,採用チームリーダー,リクルーター;社員面談'
    const bom = '\uFEFF'
    const csv = bom + [header, sample1, sample2].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タレントプール</h1>
          <p className="text-sm text-gray-500 mt-1">
            候補者と社員を管理し、最適なマッチングを実現します
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openBulkModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            一括登録
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            社員を追加
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <Link
          href="/talent-pool/candidates"
          className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
        >
          <Users className="w-4 h-4" />
          候補者
        </Link>
        <div className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-white text-indigo-700 shadow-sm">
          <UserCheck className="w-4 h-4" />
          社員
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">登録社員数</p>
            <p className="text-lg font-bold text-gray-900">{employees.length}名</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">部署数</p>
            <p className="text-lg font-bold text-gray-900">{departments.length}部署</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">面接官登録</p>
            <p className="text-lg font-bold text-gray-900">
              {employees.filter((e) => e.available_for?.includes('面接官')).length}名
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">メンター登録</p>
            <p className="text-lg font-bold text-gray-900">
              {employees.filter((e) => e.available_for?.includes('メンター')).length}名
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">すべての役割</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">データの取得に失敗しました</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && employees.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            まだ社員が登録されていません
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            面接官やメンター候補を登録して、候補者との最適なマッチングを始めましょう
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            最初の社員を登録する
          </button>
        </div>
      )}

      {/* No results for filter */}
      {!loading && !error && employees.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">該当する社員が見つかりません</p>
        </div>
      )}

      {/* Employee grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 p-5"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {emp.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{emp.name}</h3>
                    <p className="text-xs text-gray-500">
                      {emp.department} / {emp.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Role & years */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[emp.role] || 'bg-gray-100 text-gray-700'}`}>
                  {emp.role}
                </span>
                <span className="text-xs text-gray-400">
                  在籍 {emp.years_at_company}年
                </span>
              </div>

              {/* Available for tags */}
              {emp.available_for && emp.available_for.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {emp.available_for.map((a) => (
                    <span
                      key={a}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[11px] font-medium"
                    >
                      {a}対応可
                    </span>
                  ))}
                </div>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {emp.skills.slice(0, 4).map((s, i) => (
                  <span
                    key={s}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getSkillColor(i)}`}
                  >
                    {s}
                  </span>
                ))}
                {emp.skills.length > 4 && (
                  <span className="px-2 py-0.5 text-gray-400 text-[11px]">
                    +{emp.skills.length - 4}
                  </span>
                )}
              </div>

              {/* Personality tags */}
              {emp.personality_tags && emp.personality_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {emp.personality_tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Interview style */}
              {emp.interview_style && (
                <div className="flex items-start gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500">{emp.interview_style}</p>
                </div>
              )}

              {/* Bio */}
              {emp.bio && (
                <p className="text-xs text-gray-400 line-clamp-2">{emp.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hidden CSV input */}
      <input ref={csvInputRef} type="file" accept=".csv,.tsv,.txt" onChange={handleCsvFileUpload} className="hidden" />

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">社員の一括登録</h2>
                  <p className="text-xs text-gray-400">CSVファイルまたはテキストの貼り付けで複数の社員を一括登録</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Mode tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkMode('paste')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bulkMode === 'paste' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" />
                  テキスト貼り付け
                </button>
                <button
                  onClick={() => { setBulkMode('csv'); csvInputRef.current?.click() }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bulkMode === 'csv' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSVアップロード
                </button>
                <button
                  onClick={downloadCsvTemplate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  テンプレート
                </button>
              </div>

              {/* Format guide */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">入力フォーマット（カンマまたはタブ区切り）</p>
                <p className="text-[11px] text-gray-500 font-mono leading-relaxed">
                  氏名, 部署, 肩書, 役割, 在籍年数, スキル(;区切り), パーソナリティ(;区切り), 面接スタイル, 紹介文, 対応可能(;区切り)
                </p>
                <p className="text-[11px] text-gray-400 mt-2">
                  ※ 必須: 氏名。その他は空欄でもOK。1行目がヘッダー行の場合は自動検出されます。
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  例: <span className="font-mono text-gray-500">山田太郎, エンジニアリング部, テックリード, 面接官, 5, TypeScript;React, 論理的;共感力</span>
                </p>
              </div>

              {/* Text area */}
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono leading-relaxed"
                placeholder={`山田太郎, エンジニアリング部, テックリード, 面接官, 5, TypeScript;React;AWS, 論理的;共感力\n田中花子, 人事部, 採用マネージャー, リクルーター, 3, 採用戦略;面談設計, コミュニケーション力\n佐藤次郎, 営業部, 営業部長, マネージャー, 8, 営業戦略;交渉力, 熱量がある;リーダーシップ`}
              />

              {/* Preview count */}
              {bulkText.trim() && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="text-gray-600">
                    {parseCsvRows(bulkText).length}名のデータを検出
                  </span>
                </div>
              )}

              {/* Result */}
              {bulkResult && (
                <div className={`rounded-xl border p-4 ${bulkResult.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={`w-5 h-5 ${bulkResult.errors.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="text-sm font-semibold text-gray-800">
                      {bulkResult.success}名を登録しました
                      {bulkResult.errors.length > 0 && ` / ${bulkResult.errors.length}件のエラー`}
                    </span>
                  </div>
                  {bulkResult.errors.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {bulkResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-amber-700">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {bulkResult && bulkResult.success > 0 ? '閉じる' : 'キャンセル'}
              </button>
              <button
                onClick={handleBulkImport}
                disabled={bulkImporting || !bulkText.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    一括登録する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingEmployee ? '社員を編集' : '社員を追加'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">氏名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="山田 太郎"
                />
              </div>

              {/* Department & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">部署 *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="エンジニアリング部"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">肩書 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="テックリード"
                  />
                </div>
              </div>

              {/* Role & Years */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">役割 *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">在籍年数</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.years_at_company}
                    onChange={(e) => setFormData({ ...formData, years_at_company: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スキル（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="TypeScript, React, AWS"
                />
              </div>

              {/* Personality tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パーソナリティタグ（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="論理的, 共感力が高い, 熱量がある"
                />
              </div>

              {/* Interview style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">面接スタイル</label>
                <input
                  type="text"
                  value={formData.interview_style}
                  onChange={(e) => setFormData({ ...formData, interview_style: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="構造化面接が得意、雑談からの深掘り型"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">紹介文</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="簡単な自己紹介..."
                />
              </div>

              {/* Available for */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対応可能な役割</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FOR_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAvailableFor(item)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        formData.available_for.includes(item)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.department || !formData.title}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingEmployee ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
