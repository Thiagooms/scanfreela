import { NextRequest, NextResponse } from 'next/server'
import { makeMercadoPagoService } from '@/lib/factories/service.factory'

const mpService = makeMercadoPagoService()

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (!type || !data?.id) {
      return NextResponse.json({ received: true })
    }

    await mpService.handleWebhook(type, data.id)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ received: true })
  }
}
