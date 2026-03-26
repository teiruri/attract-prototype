/**
 * データベースモデルの型定義
 * Supabase テーブルと対応
 */

export type InterviewStage =
  | 'interview_1'
  | 'interview_2'
  | 'interview_3'
  | 'interview_4'
  | 'interview_final'

export type OutputType = 'match_analysis' | 'attract_story' | 'result_letter' | 'handover_note' | 'personal_offer'
export type OutputStatus = 'generating' | 'draft' | 'reviewed' | 'sent'
export type CandidateStatus = 'active' | 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'on_hold'
export type HiringType = 'new_graduate' | 'mid_career' | 'other'

export const STAGE_LABELS: Record<InterviewStage, string> = {
  interview_1: '一次選考',
  interview_2: '二次選考',
  interview_3: '三次選考',
  interview_4: '四次選考',
  interview_final: '最終選考',
}

export const STAGE_ORDER: InterviewStage[] = [
  'interview_1', 'interview_2', 'interview_3', 'interview_4', 'interview_final'
]

export interface DbTenant {
  id: string
  name: string
  slug: string
  plan: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbCompanyProfile {
  id: string
  tenant_id: string
  company_name: string
  industry?: string
  company_size?: string
  mission?: string
  vision?: string
  values?: string
  evp: Record<string, unknown>
  culture_keywords?: string[]
  attraction_points: Array<Record<string, unknown>>
  website_url?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbJob {
  id: string
  tenant_id: string
  title: string
  department?: string
  position_type?: string
  description?: string
  requirements: unknown[]
  preferred: unknown[]
  target_persona: Record<string, unknown>
  hiring_type: HiringType
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbCandidate {
  id: string
  tenant_id: string
  job_id?: string
  full_name: string
  email?: string
  phone?: string
  source?: string
  hiring_type: HiringType
  status: CandidateStatus
  current_stage?: InterviewStage
  university?: string
  faculty?: string
  graduation_year?: number
  work_experience: unknown[]
  profile_summary?: string
  tags?: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbCandidateDocument {
  id: string
  tenant_id: string
  candidate_id: string
  document_type: 'resume' | 'entry_sheet' | 'portfolio' | 'other'
  file_name: string
  file_size?: number
  mime_type?: string
  storage_path: string
  extracted_text?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbInterview {
  id: string
  tenant_id: string
  candidate_id: string
  job_id?: string
  stage: InterviewStage
  interviewer_name?: string
  interviewer_role?: string
  interview_date?: string
  interview_text?: string
  candidate_survey: Record<string, unknown>
  interviewer_evaluation: Record<string, unknown>
  temperature_score?: number
  result?: 'pass' | 'fail' | 'hold' | 'pending'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbGeneratedOutput {
  id: string
  tenant_id: string
  candidate_id: string
  interview_id?: string
  job_id?: string
  output_type: OutputType
  status: OutputStatus
  stage?: InterviewStage
  content: Record<string, unknown>
  generation_params: Record<string, unknown>
  reviewed_by?: string
  reviewed_at?: string
  version: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}
