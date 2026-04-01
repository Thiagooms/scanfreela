import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeStripeService } from '@/lib/factories/service.factory'

const stripeService = makeStripeService()

export async function POST() {
  return withAuth(async (user) => {
    const result = await stripeService.createSubscriptionIntent(user.id, user.email!)
    return NextResponse.json(result)
  })
}
