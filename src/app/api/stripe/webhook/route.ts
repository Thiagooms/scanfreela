import { NextRequest, NextResponse } from 'next/server'
import { makeStripeService } from '@/lib/factories/service.factory'

const stripeService = makeStripeService()

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  try {
    await stripeService.handleWebhook(payload, signature)
    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
