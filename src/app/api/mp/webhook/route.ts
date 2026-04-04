import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { makeMercadoPagoService } from '@/lib/factories/service.factory'
import { getMercadoPagoWebhookSecret } from '@/lib/config/env'
import { UnauthorizedError } from '@/lib/http/errors'
import { handleRouteError } from '@/lib/http/responses'
import { parseMercadoPagoWebhookPayload } from '@/lib/validation/mercadopago'

const mpService = makeMercadoPagoService()

const HMAC_HEX_STRING_LENGTH = 64

function computeHmacSignature(secret: string, manifest: string): string {
  return createHmac('sha256', secret).update(manifest).digest('hex')
}

function compareSignaturesInConstantTime(expectedHex: string, receivedHex: string): boolean {
  const paddedExpected = Buffer.alloc(HMAC_HEX_STRING_LENGTH)
  const paddedReceived = Buffer.alloc(HMAC_HEX_STRING_LENGTH)

  Buffer.from(expectedHex.toLowerCase()).copy(paddedExpected)
  Buffer.from(receivedHex.toLowerCase()).copy(paddedReceived)

  return timingSafeEqual(paddedExpected, paddedReceived)
}

async function isValidWebhookSignature(
  request: NextRequest,
  dataId: string
): Promise<boolean> {
  const webhookSecret = getMercadoPagoWebhookSecret()
  if (!webhookSecret) return true

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  const signatureParts = Object.fromEntries(
    xSignature.split(',').map(part => {
      const [key, ...rest] = part.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
  )

  const timestamp = signatureParts.ts
  const receivedSignatureHex = signatureParts.v1
  if (!timestamp || !receivedSignatureHex) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`
  const expectedSignatureHex = computeHmacSignature(webhookSecret, manifest)

  return compareSignaturesInConstantTime(expectedSignatureHex, receivedSignatureHex)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const { payload: parsedPayload, webhook } = parseMercadoPagoWebhookPayload(rawBody)

    const signatureIsValid = await isValidWebhookSignature(request, webhook.dataId)
    if (!signatureIsValid) {
      throw new UnauthorizedError(
        'Assinatura do webhook inválida',
        'INVALID_WEBHOOK_SIGNATURE'
      )
    }

    await mpService.handleWebhook({
      action: webhook.action,
      eventId: webhook.eventId,
      payload: parsedPayload,
      requestId: request.headers.get('x-request-id'),
      resourceId: webhook.dataId,
      type: webhook.type,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    return handleRouteError(error, 'MP webhook error:')
  }
}
