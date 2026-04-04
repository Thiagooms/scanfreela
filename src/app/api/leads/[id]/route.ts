import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeLeadService, makePlanGuard } from '@/lib/factories/service.factory'
import { readJsonBody } from '@/lib/http/request'
import { handleRouteError } from '@/lib/http/responses'
import { readRequiredString } from '@/lib/validation/base'
import { parseLeadUpdateInput } from '@/lib/validation/lead'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    try {
      const supabase = await createClient()
      const { id } = await params
      const leadId = readRequiredString(id, { field: 'id', maxLength: 255 })
      const body = parseLeadUpdateInput(await readJsonBody(request))
      const leadService = makeLeadService(supabase)
      const planGuard = makePlanGuard(supabase)

      await planGuard.assertPaidPlan(user.id)

      const lead = await leadService.update(leadId, user.id, body)
      return NextResponse.json(lead)
    } catch (error) {
      return handleRouteError(error, 'Lead update API error:')
    }
  })
}
