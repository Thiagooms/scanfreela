import { createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const handleWebhook = vi.fn()

  return {
    handleWebhook,
    makeMercadoPagoService: vi.fn(() => ({ handleWebhook })),
  }
})

vi.mock('@/lib/factories/service.factory', () => ({
  makeMercadoPagoService: mocks.makeMercadoPagoService,
}))

import { POST } from '@/app/api/mp/webhook/route'

function buildSignature(secret: string, dataId: string, requestId: string, ts: string) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  return createHmac('sha256', secret).update(manifest).digest('hex')
}

describe('POST /api/mp/webhook', () => {
  const secret = 'test-webhook-secret'

  beforeEach(() => {
    process.env.MP_WEBHOOK_SECRET = secret
    mocks.handleWebhook.mockReset()
  })

  afterEach(() => {
    delete process.env.MP_WEBHOOK_SECRET
  })

  it('retorna 401 quando a assinatura e invalida', async () => {
    const request = new NextRequest('http://localhost/api/mp/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-1',
        'x-signature': 'ts=1712236800,v1=invalid-signature',
      },
      body: JSON.stringify({
        action: 'payment.updated',
        data: { id: 'resource-1' },
        id: 'event-1',
        type: 'payment',
      }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload).toEqual({
      error: {
        code: 'INVALID_WEBHOOK_SIGNATURE',
        message: 'Assinatura do webhook invalida',
      },
    })
    expect(mocks.handleWebhook).not.toHaveBeenCalled()
  })

  it('retorna 400 quando o payload JSON do webhook e invalido', async () => {
    const request = new NextRequest('http://localhost/api/mp/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-1',
        'x-signature': 'ts=1712236800,v1=invalid-signature',
      },
      body: '{"data":',
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      error: {
        code: 'INVALID_WEBHOOK_PAYLOAD',
        message: 'Payload do webhook invalido',
      },
    })
    expect(mocks.handleWebhook).not.toHaveBeenCalled()
  })

  it('processa o webhook quando a assinatura e valida', async () => {
    const ts = '1712236800'
    const requestId = 'request-1'
    const dataId = 'resource-1'
    const signature = buildSignature(secret, dataId, requestId, ts)

    const request = new NextRequest('http://localhost/api/mp/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': requestId,
        'x-signature': `ts=${ts},v1=${signature}`,
      },
      body: JSON.stringify({
        action: 'subscription_preapproval',
        data: { id: dataId },
        id: 'event-1',
        type: 'subscription_preapproval',
      }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ received: true })
    expect(mocks.handleWebhook).toHaveBeenCalledWith({
      action: 'subscription_preapproval',
      eventId: 'event-1',
      payload: {
        action: 'subscription_preapproval',
        data: { id: dataId },
        id: 'event-1',
        type: 'subscription_preapproval',
      },
      requestId,
      resourceId: dataId,
      type: 'subscription_preapproval',
    })
  })
})
