import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

// Column mapping patterns for Japanese recruitment platforms
const COLUMN_PATTERNS: Record<string, RegExp> = {
  full_name: /氏名|名前|フルネーム|姓名|name/i,
  email: /メール|メールアドレス|e-?mail/i,
  phone: /電話|電話番号|tel|phone/i,
  university: /大学|学校|university|school/i,
  faculty: /学部|学科|専攻|faculty|department|major/i,
  graduation_year: /卒業年|卒年|graduation/i,
  current_company: /会社|勤務先|現職|company|employer/i,
  current_title: /役職|職位|ポジション|title|position/i,
  source_note: /職種|応募職種|希望職種|position.*applied/i,
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function decodeCSVText(buffer: ArrayBuffer): string {
  // Try UTF-8 first
  const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
  try {
    return utf8Decoder.decode(buffer)
  } catch {
    // Fallback to Shift-JIS
    const sjisDecoder = new TextDecoder('shift-jis')
    return sjisDecoder.decode(buffer)
  }
}

function detectColumnMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}

  headers.forEach((header, index) => {
    const trimmedHeader = header.trim()
    for (const [field, pattern] of Object.entries(COLUMN_PATTERNS)) {
      if (pattern.test(trimmedHeader) && !(field in mapping)) {
        mapping[field] = index
        break
      }
    }
  })

  return mapping
}

interface ParsedCandidate {
  full_name: string | null
  email: string | null
  phone: string | null
  university: string | null
  faculty: string | null
  graduation_year: number | null
  current_company: string | null
  current_title: string | null
  source_note: string | null
}

function mapRowToCandidate(
  row: string[],
  mapping: Record<string, number>
): ParsedCandidate {
  const getValue = (field: string): string | null => {
    const index = mapping[field]
    if (index === undefined || index >= row.length) return null
    const val = row[index].trim()
    return val || null
  }

  const gradYearStr = getValue('graduation_year')
  let graduationYear: number | null = null
  if (gradYearStr) {
    const parsed = parseInt(gradYearStr.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(parsed)) graduationYear = parsed
  }

  return {
    full_name: getValue('full_name'),
    email: getValue('email'),
    phone: getValue('phone'),
    university: getValue('university'),
    faculty: getValue('faculty'),
    graduation_year: graduationYear,
    current_company: getValue('current_company'),
    current_title: getValue('current_title'),
    source_note: getValue('source_note'),
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const jobId = formData.get('job_id') as string | null
    const platform = formData.get('platform') as string | null
    const confirm = formData.get('confirm') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'CSVファイルが指定されていません' }, { status: 400 })
    }

    // Read and decode CSV
    const arrayBuffer = await file.arrayBuffer()
    const text = decodeCSVText(arrayBuffer)

    // Parse lines (handle \r\n and \n)
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSVファイルにデータが含まれていません（ヘッダー行とデータ行が必要です）' },
        { status: 400 }
      )
    }

    // Parse header and detect column mapping
    const headers = parseCSVLine(lines[0])
    const mapping = detectColumnMapping(headers)

    if (Object.keys(mapping).length === 0) {
      return NextResponse.json(
        {
          error: 'カラムの自動マッピングに失敗しました。CSVのヘッダーに氏名・メール等のカラムが見つかりません。',
          headers,
        },
        { status: 400 }
      )
    }

    // Parse all data rows
    const allRows = lines.slice(1).map((line) => parseCSVLine(line))
    const allCandidates = allRows.map((row) => mapRowToCandidate(row, mapping))

    // Filter out rows with no useful data (at least full_name or email)
    const validCandidates = allCandidates.filter(
      (c) => c.full_name || c.email
    )

    // Preview: return first 5 rows
    const preview = validCandidates.slice(0, 5)

    if (!confirm) {
      return NextResponse.json({
        preview,
        total_count: validCandidates.length,
        detected_mapping: Object.fromEntries(
          Object.entries(mapping).map(([field, index]) => [field, headers[index]])
        ),
        headers,
        message: 'プレビューデータです。インポートを実行するには confirm=true を指定してください。',
      })
    }

    // Actual import
    const db = createServerClient()
    const insertData = validCandidates.map((c) => ({
      tenant_id: TENANT_ID,
      job_id: jobId || null,
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      source: platform ? `csv_import_${platform}` : 'csv_import',
      hiring_type: c.current_company ? 'mid_career' : 'new_graduate',
      status: 'active' as const,
      university: c.university,
      faculty: c.faculty,
      graduation_year: c.graduation_year,
      work_experience: [],
    }))

    const { data: inserted, error: dbError } = await db
      .from('candidates')
      .insert(insertData)
      .select()

    if (dbError) {
      return NextResponse.json(
        {
          error: 'データベースへの一括保存に失敗しました',
          detail: dbError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imported_count: inserted?.length ?? 0,
      total_count: validCandidates.length,
      preview,
      detected_mapping: Object.fromEntries(
        Object.entries(mapping).map(([field, index]) => [field, headers[index]])
      ),
      candidates: inserted,
    })
  } catch (err) {
    console.error('import-csv error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
