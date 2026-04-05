import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeLeadService, makePlanGuard } from '@/lib/factories/service.factory'
import { handleRouteError } from '@/lib/http/responses'
import { readJsonBody } from '@/lib/http/request'
import { parseLeadCreateInput } from '@/lib/validation/lead'

export async function GET() {
  return withAuth(async (user) => {
    try {
      const supabase = await createClient()
      const leadService = makeLeadService(supabase)
      const planGuard = makePlanGuard(supabase)

      await planGuard.assertAuthenticated(user.id)

      const leads = await leadService.listByUser(user.id)
      return NextResponse.json(leads)
    } catch (error) {
      return handleRouteError(error, 'Lead list API error:')
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      const supabase = await createClient()
      const body = parseLeadCreateInput(await readJsonBody(request))
      const leadService = makeLeadService(supabase)
      const lead = await leadService.save(user.id, body)

      return NextResponse.json(lead, { status: 201 })
    } catch (error) {
      return handleRouteError(error, 'Lead create API error:')
    }
  })
}
