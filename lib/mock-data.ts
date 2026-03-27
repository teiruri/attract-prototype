import type {
  Candidate,
  CompanyAttractionProfile,
} from './types'

// ==========================================
// 企業魅力プロファイル（空）
// ==========================================
export const companyAttractionProfile: CompanyAttractionProfile | null = null

// ==========================================
// 候補者データ（空 - Supabase APIから取得）
// ==========================================
export const candidates: Candidate[] = []

// ユーティリティ関数
export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find((c) => c.id === id)
}

export function getApplicationById(candidateId: string, appId: string) {
  const candidate = getCandidateById(candidateId)
  return candidate?.applications.find((a) => a.id === appId)
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    briefing: '企業説明会・OB訪問',
    es: 'ES選考',
    aptitude: '適性検査',
    casual: 'カジュアル面談',
    gd: 'グループディスカッション',
    interview_1: '一次面接',
    interview_2: '二次面接',
    final: '最終面接',
    offer: 'オファー・内定',
    hired: '内定承諾',
    rejected: '不合格',
    withdrawn: '辞退',
  }
  return labels[stage] ?? stage
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    briefing: 'bg-teal-50 text-teal-700',
    es: 'bg-cyan-100 text-cyan-700',
    aptitude: 'bg-sky-100 text-sky-700',
    casual: 'bg-gray-100 text-gray-700',
    gd: 'bg-lime-100 text-lime-700',
    interview_1: 'bg-blue-100 text-blue-700',
    interview_2: 'bg-indigo-100 text-indigo-700',
    final: 'bg-purple-100 text-purple-700',
    offer: 'bg-amber-100 text-amber-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-500',
  }
  return colors[stage] ?? 'bg-gray-100 text-gray-700'
}

export function getSignalStrengthLabel(strength: string): string {
  return { high: '強', medium: '中', low: '低' }[strength] ?? strength
}

export function getSignalStrengthColor(strength: string): string {
  return (
    { high: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', low: 'text-gray-500 bg-gray-50' }[strength] ??
    'text-gray-500 bg-gray-50'
  )
}
