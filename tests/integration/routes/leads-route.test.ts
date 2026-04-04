import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForbiddenError, RateLimitError } from '@/lib/http/errors'

const mocks = vi.hoisted(() => {
  return {
    createClient: vi.fn(),
    withAuth: vi.fn(),
    listByUser: vi.fn(),
    save: vi.fn(),
    assertPaidPlan: vi.fn(),
    makeLeadService: vi.fn(),
    makePlanGuard: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/supabase/auth', () => ({
  withAuth: mocks.withAuth,
}))

vi.mock('@/lib/factories/service.factory', () => ({
  makeLeadService: mocks.makeLeadService,
  makePlanGuard: mocks.makePlanGuard,
}))

import { GET, POST } from '@/app/api/leads/route'

describe('/api/leads', () => {
  beforeEach(() => {
    mocks.createClient.mockReset()
    mocks.withAuth.mockReset()
    mocks.listByUser.mockReset()
    mocks.save.mockReset()
    mocks.assertPaidPlan.mockReset()
    mocks.makeLeadService.mockReset()
    mocks.makePlanGuard.mockReset()

    mocks.createClient.mockResolvedValue({ supabase: true })
    mocks.withAuth.mockImplementation(
      async (
        handler: (user: { id: string; email: string }) => Promise<Response>
      ) => handler({ id: 'user-1', email: 'user@example.com' })
    )
    mocks.makeLeadService.mockReturnValue({
      listByUser: mocks.listByUser,
      save: mocks.save,
    })
    mocks.makePlanGuard.mockReturnValue({
      assertPaidPlan: mocks.assertPaidPlan,
    })
  })

  it('bloqueia listagem para usuario sem plano pago', async () => {
    mocks.assertPaidPlan.mockRejectedValue(
      new ForbiddenError('Plano pago necessario', 'PAID_PLAN_REQUIRED')
    )

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload).toEqual({
      error: {
        code: 'PAID_PLAN_REQUIRED',
        message: 'Plano pago necessario',
      },
    })
    expect(mocks.listByUser).not.toHaveBeenCalled()
  })

  it('lista leads para usuario com plano pago', async () => {
    mocks.listByUser.mockResolvedValue([
      {
        id: 'lead-1',
        userId: 'user-1',
        placeId: 'place-1',
        name: 'Studio Acme',
        phone: null,
        website: null,
        rating: 4.7,
        totalRatings: 35,
        score: 88,
        status: 'new',
        notes: null,
        lastContact: null,
        createdAt: '2026-04-04T10:00:00.000Z',
      },
    ])

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toHaveLength(1)
    expect(mocks.assertPaidPlan).toHaveBeenCalledWith('user-1')
    expect(mocks.listByUser).toHaveBeenCalledWith('user-1')
  })

  it('cria lead quando recebe payload valido', async () => {
    mocks.save.mockResolvedValue({
      id: 'lead-1',
      placeId: 'place-1',
      name: 'Studio Acme',
    })

    const request = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ placeId: 'place-1' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(payload).toEqual({
      id: 'lead-1',
      placeId: 'place-1',
      name: 'Studio Acme',
    })
    expect(mocks.save).toHaveBeenCalledWith('user-1', { placeId: 'place-1' })
  })

  it('retorna 429 quando o rate limit de criacao de lead e excedido', async () => {
    mocks.save.mockRejectedValue(
      new RateLimitError(
        'Limite de criacoes de lead excedido. Tente novamente em instantes.',
        'LEAD_CREATE_RATE_LIMIT_EXCEEDED'
      )
    )

    const request = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ placeId: 'place-1' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload).toEqual({
      error: {
        code: 'LEAD_CREATE_RATE_LIMIT_EXCEEDED',
        message: 'Limite de criacoes de lead excedido. Tente novamente em instantes.',
      },
    })
  })

  it('retorna 400 quando o corpo JSON e invalido', async () => {
    const request = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: '{"placeId":',
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Payload JSON invalido',
      },
    })
    expect(mocks.save).not.toHaveBeenCalled()
  })
})
