import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeLeadService } from '@/lib/factories/service.factory'
import { PlanLimitError } from '@/lib/guards/plan.guard'
import { LeadCreateInput } from '@/lib/types/lead'

export async function GET() {
  return withAuth(async (user) => {
    const supabase = await createClient()
    const leadService = makeLeadService(supabase)
    const leads = await leadService.listByUser(user.id)
    return NextResponse.json(leads)
  })
}

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    const supabase = await createClient()
    const body: LeadCreateInput = await request.json()
    const leadService = makeLeadService(supabase)

    try {
      const lead = await leadService.save(user.id, body)
      return NextResponse.json(lead, { status: 201 })
    } catch (error) {
      if (error instanceof PlanLimitError) {
        return NextResponse.json({ error: 'PLAN_LIMIT_REACHED' }, { status: 403 })
      }
      throw error
    }
  })
}
