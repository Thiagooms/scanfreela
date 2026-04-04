import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { makeMercadoPagoService } from '@/lib/factories/service.factory'
import {
  ConfigurationError,
  UnauthorizedError,
} from '@/lib/http/errors'
import { handleRouteError } from '@/lib/http/responses'
import { parseMercadoPagoWebhookPayload } from '@/lib/validation/mercadopago'

const mpService = makeMercadoPagoService()

function getWebhookSecret(): string | null {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim()
  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new ConfigurationError(
      'Webhook do Mercado Pago sem segredo configurado',
      'MP_WEBHOOK_SECRET_MISSING'
    )
  }

  return null
}

function safeCompareHex(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false

  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')
  if (expectedBuffer.length !== receivedBuffer.length) return false

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}

async function isValidSignature(
  request: NextRequest,
  dataId: string
): Promise<boolean> {
  const secret = getWebhookSecret()
  if (!secret) return true

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map(part => {
      const [key, ...rest] = part.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
  )

  const ts = parts.ts
  const v1 = parts.v1?.toLowerCase()
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expectedSignature = createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  return safeCompareHex(expectedSignature, v1)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const parsedPayload = JSON.parse(rawBody) as unknown
    const payload = parseMercadoPagoWebhookPayload(rawBody)
    const valid = await isValidSignature(request, payload.dataId)

    if (!valid) {
      throw new UnauthorizedError(
        'Assinatura do webhook invalida',
        'INVALID_WEBHOOK_SIGNATURE'
      )
    }

    await mpService.handleWebhook({
      action: payload.action,
      eventId: payload.eventId,
      payload: parsedPayload,
      requestId: request.headers.get('x-request-id'),
      resourceId: payload.dataId,
      type: payload.type,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    return handleRouteError(error, 'MP webhook error:')
  }
}
