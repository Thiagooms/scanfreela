import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForbiddenError } from '@/lib/http/errors'

const mocks = vi.hoisted(() => {
  return {
    createClient: vi.fn(),
    withAuth: vi.fn(),
    update: vi.fn(),
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

import { PATCH } from '@/app/api/leads/[id]/route'

describe('PATCH /api/leads/[id]', () => {
  beforeEach(() => {
    mocks.createClient.mockReset()
    mocks.withAuth.mockReset()
    mocks.update.mockReset()
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
      update: mocks.update,
    })
    mocks.makePlanGuard.mockReturnValue({
      assertPaidPlan: mocks.assertPaidPlan,
    })
  })

  it('bloqueia update para usuario sem plano pago', async () => {
    mocks.assertPaidPlan.mockRejectedValue(
      new ForbiddenError('Plano pago necessario', 'PAID_PLAN_REQUIRED')
    )

    const request = new NextRequest('http://localhost/api/leads/lead-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approached' }),
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'lead-1' }),
    })
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload).toEqual({
      error: {
        code: 'PAID_PLAN_REQUIRED',
        message: 'Plano pago necessario',
      },
    })
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('atualiza o lead quando o plano e pago', async () => {
    mocks.update.mockResolvedValue({
      id: 'lead-1',
      status: 'approached',
      notes: 'Primeiro contato feito',
      lastContact: '2026-04-04T12:00:00.000Z',
    })

    const request = new NextRequest('http://localhost/api/leads/lead-1', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'approached',
        notes: 'Primeiro contato feito',
        lastContact: '2026-04-04T12:00:00.000Z',
      }),
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'lead-1' }),
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      id: 'lead-1',
      status: 'approached',
      notes: 'Primeiro contato feito',
      lastContact: '2026-04-04T12:00:00.000Z',
    })
    expect(mocks.assertPaidPlan).toHaveBeenCalledWith('user-1')
    expect(mocks.update).toHaveBeenCalledWith('lead-1', 'user-1', {
      status: 'approached',
      notes: 'Primeiro contato feito',
      lastContact: '2026-04-04T12:00:00.000Z',
    })
  })
})
