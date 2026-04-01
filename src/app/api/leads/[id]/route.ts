import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeLeadService } from '@/lib/factories/service.factory'
import { LeadUpdateInput } from '@/lib/types/lead'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const supabase = await createClient()
    const { id } = await params
    const body: LeadUpdateInput = await request.json()
    const leadService = makeLeadService(supabase)
    const lead = await leadService.update(id, user.id, body)
    return NextResponse.json(lead)
  })
}
