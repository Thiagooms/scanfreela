import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const createSubscription = vi.fn()

  return {
    withAuth: vi.fn(),
    createSubscription,
    makeMercadoPagoService: vi.fn(() => ({ createSubscription })),
  }
})

vi.mock('@/lib/supabase/auth', () => ({
  withAuth: mocks.withAuth,
}))

vi.mock('@/lib/factories/service.factory', () => ({
  makeMercadoPagoService: mocks.makeMercadoPagoService,
}))

import { POST } from '@/app/api/mp/subscription/route'

describe('POST /api/mp/subscription', () => {
  beforeEach(() => {
    mocks.withAuth.mockReset()
    mocks.createSubscription.mockReset()
  })

  it('retorna 400 quando o usuario nao possui email valido', async () => {
    mocks.withAuth.mockImplementation(
      async (
        handler: (user: { id: string; email: string | null }) => Promise<Response>
      ) => handler({ id: 'user-1', email: null })
    )

    const request = new NextRequest('http://localhost/api/mp/subscription', {
      method: 'POST',
      body: JSON.stringify({ cardToken: 'card-token-123' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      error: {
        code: 'USER_EMAIL_REQUIRED',
        message: 'Usuario autenticado sem e-mail valido',
      },
    })
    expect(mocks.createSubscription).not.toHaveBeenCalled()
  })

  it('cria a assinatura com payload valido', async () => {
    mocks.withAuth.mockImplementation(
      async (
        handler: (user: { id: string; email: string | null }) => Promise<Response>
      ) => handler({ id: 'user-1', email: 'user@example.com' })
    )
    mocks.createSubscription.mockResolvedValue({
      subscriptionId: 'sub-1',
      status: 'authorized',
    })

    const request = new NextRequest('http://localhost/api/mp/subscription', {
      method: 'POST',
      body: JSON.stringify({ cardToken: 'card-token-123' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      subscriptionId: 'sub-1',
      status: 'authorized',
    })
    expect(mocks.createSubscription).toHaveBeenCalledWith(
      'user-1',
      'user@example.com',
      { cardToken: 'card-token-123' }
    )
  })
})
