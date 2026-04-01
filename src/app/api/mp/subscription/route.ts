import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeMercadoPagoService } from '@/lib/factories/service.factory'
import { CreateSubscriptionInput } from '@/lib/types/mercadopago'

const mpService = makeMercadoPagoService()

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    const body: CreateSubscriptionInput = await request.json()
    const result = await mpService.createSubscription(user.id, body)
    return NextResponse.json(result)
  })
}
