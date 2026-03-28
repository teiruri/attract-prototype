import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

interface MatchResult {
  employee: Employee
  score: number
  reasons: string[]
  recommended_role: string
  recommended_reason: string
}

function calculateMatch(
  employee: Employee,
  candidate: Record<string, unknown>,
  job: Record<string, unknown> | null,
  interviews: Record<string, unknown>[]
): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Skills overlap with job requirements
  const jobRequirements: string[] = (job?.requirements as string[]) || (job?.skills as string[]) || []
  const empSkillsLower = employee.skills.map((s) => s.toLowerCase())
  let skillMatches = 0
  for (const req of jobRequirements) {
    if (empSkillsLower.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
      skillMatches++
    }
  }
  score += Math.min(skillMatches * 10, 40)
  if (skillMatches > 0) {
    reasons.push(`求人スキル要件と${skillMatches}件のスキルが一致`)
  }

  // Department match
  const jobDepartment = (job?.department as string) || ''
  if (jobDepartment && employee.department.includes(jobDepartment)) {
    score += 20
    reasons.push(`同じ${employee.department}の経験者`)
  }

  // Personality complementary analysis based on interview signals
  const hasInterviews = interviews && interviews.length > 0
  if (hasInterviews) {
    // Check interview results and feedback for signals
    const positiveInterviews = interviews.filter(
      (i) => i.result === 'pass' || i.result === 'strong_pass'
    )
    if (positiveInterviews.length > 0 && employee.personality_tags.length > 0) {
      score += 10
      const tags = employee.personality_tags.slice(0, 2).join('・')
      reasons.push(`${tags}な性格が候補者との相性良好`)
    }
  }

  // Personality tags bonus
  if (employee.personality_tags.includes('共感力が高い')) {
    score += 5
    if (!reasons.some((r) => r.includes('共感力'))) {
      reasons.push('共感力の高いコミュニケーションスタイル')
    }
  }
  if (employee.personality_tags.includes('論理的')) {
    score += 5
  }

  // Role suitability
  const isInterviewer = employee.available_for.includes('面接官')
  const isMentor = employee.available_for.includes('メンター')
  const isRecruiter = employee.available_for.includes('リクルーター')

  if (isInterviewer) score += 10
  if (isMentor) score += 5
  if (isRecruiter) score += 5

  // Years of experience bonus
  if (employee.years_at_company >= 3) {
    score += 5
    reasons.push(`社歴${employee.years_at_company}年の経験を活かした対応が可能`)
  }

  // Cap at 100
  score = Math.min(score, 100)

  // Determine recommended role
  let recommended_role = '社員面談の担当者'
  let recommended_reason = '候補者に社内の雰囲気を伝えられるため'

  const candidateStatus = candidate.status as string
  if (isInterviewer && (candidateStatus === 'active' || candidateStatus === 'screening')) {
    const interviewCount = interviews?.length || 0
    if (interviewCount === 0) {
      recommended_role = '一次面接の面接官'
      recommended_reason = '候補者の基礎スキルを正確に評価できるため'
    } else if (interviewCount === 1) {
      recommended_role = '二次面接の面接官'
      recommended_reason = '候補者が重視する成長環境について、自身の経験を語れるため'
    } else {
      recommended_role = '最終面接の面接官'
      recommended_reason = '候補者のカルチャーフィットを総合的に判断できるため'
    }
  } else if (isMentor) {
    recommended_role = 'メンター候補'
    recommended_reason = '入社後の立ち上がりをサポートできるスキルセットを持つため'
  } else if (isRecruiter) {
    recommended_role = 'リクルーター補助'
    recommended_reason = '候補者のキャリア志向と経歴が類似しており、共感を得やすいため'
  }

  if (reasons.length === 0) {
    reasons.push('基本的なマッチング条件を満たしています')
  }

  return {
    employee,
    score,
    reasons,
    recommended_role,
    recommended_reason,
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Fetch candidate with interviews
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .select('*, interviews(*)')
      .eq('id', id)
      .single()

    if (candError) {
      return NextResponse.json({ error: candError.message }, { status: 500 })
    }

    // Fetch job if candidate has one
    let job = null
    if (candidate.job_id) {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', candidate.job_id)
        .single()
      job = jobData
    }

    // Fetch employees from company_profiles metadata
    const { data: profile, error: profError } = await supabase
      .from('company_profiles')
      .select('metadata')
      .eq('tenant_id', TENANT_ID)
      .single()

    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 500 })
    }

    const employees: Employee[] = profile?.metadata?.employees || []
    const interviews = candidate.interviews || []

    // Calculate matches for each employee
    const matches: MatchResult[] = employees
      .map((emp) => calculateMatch(emp, candidate, job, interviews))
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ matches })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
