import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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

async function getProfile() {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('id, metadata')
    .eq('tenant_id', TENANT_ID)
    .single()
  if (error) throw error
  return data
}

async function updateEmployees(profileId: string, employees: Employee[]) {
  const { error } = await supabase
    .from('company_profiles')
    .update({ metadata: { employees } })
    .eq('id', profileId)
  if (error) throw error
}

// GET: Fetch all employees
export async function GET() {
  try {
    const profile = await getProfile()
    const employees: Employee[] = profile?.metadata?.employees || []
    return NextResponse.json({ employees })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// POST: Create a new employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const profile = await getProfile()
    const employees: Employee[] = profile?.metadata?.employees || []

    const newEmployee: Employee = {
      id: randomUUID(),
      name: body.name,
      department: body.department,
      role: body.role,
      title: body.title,
      years_at_company: body.years_at_company || 0,
      skills: body.skills || [],
      personality_tags: body.personality_tags || [],
      interview_style: body.interview_style || '',
      bio: body.bio || '',
      available_for: body.available_for || [],
    }

    employees.push(newEmployee)
    await updateEmployees(profile.id, employees)

    return NextResponse.json({ employee: newEmployee }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// PUT: Update an employee by id
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const profile = await getProfile()
    const employees: Employee[] = profile?.metadata?.employees || []
    const idx = employees.findIndex((e) => e.id === id)

    if (idx === -1) {
      return NextResponse.json({ error: '社員が見つかりません' }, { status: 404 })
    }

    employees[idx] = { ...employees[idx], ...updates }
    await updateEmployees(profile.id, employees)

    return NextResponse.json({ employee: employees[idx] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE: Delete an employee by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const profile = await getProfile()
    const employees: Employee[] = profile?.metadata?.employees || []
    const filtered = employees.filter((e) => e.id !== id)

    if (filtered.length === employees.length) {
      return NextResponse.json({ error: '社員が見つかりません' }, { status: 404 })
    }

    await updateEmployees(profile.id, filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
