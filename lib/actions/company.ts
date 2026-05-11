'use server'

import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import Company from '@/lib/models/company'

const CompanySchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  phoneNumber: z.string().min(11, 'Phone number is required').max(50),
  purchasePerson: z
    .string()
    .min(1, 'Purchase person name is required')
    .max(200),
  notes: z.string().max(2000).optional(),
})

export type CompanyFormData = z.infer<typeof CompanySchema>

export type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function saveCompany(
  data: CompanyFormData
): Promise<ActionResult> {
  const parsed = CompanySchema.safeParse(data)

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? 'Validation failed'
    return { success: false, error: firstError }
  }

  try {
    await dbConnect()
    await Company.create(parsed.data)
    return { success: true }
  } catch (err) {
    console.error('[saveCompany] DB error:', err)
    return {
      success: false,
      error: 'Failed to save. Please try again.',
    }
  }
}

export async function getCompanies(
  startDate?: Date,
  endDate?: Date,
  searchName?: string
) {
  try {
    await dbConnect()

    const query: Record<string, any> = {}

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = startDate
      }
      if (endDate) {
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        query.createdAt.$lt = nextDay
      }
    }

    if (searchName && searchName.trim()) {
      query.companyName = {
        $regex: searchName.trim(),
        $options: 'i',
      }
    }

    const companies = await Company.find(query).sort({ createdAt: -1 })

    return {
      success: true,
      data: JSON.parse(JSON.stringify(companies)),
    }
  } catch (err) {
    console.error('[getCompanies] DB error:', err)
    return {
      success: false,
      data: [],
      error: 'Failed to fetch companies. Please try again.',
    }
  }
}
