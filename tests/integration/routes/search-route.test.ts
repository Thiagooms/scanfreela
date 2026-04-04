import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const search = vi.fn()

  return {
    search,
    withAuth: vi.fn(),
    makePlacesService: vi.fn(() => ({ search })),
  }
})

vi.mock('@/lib/supabase/auth', () => ({
  withAuth: mocks.withAuth,
}))

vi.mock('@/lib/factories/service.factory', () => ({
  makePlacesService: mocks.makePlacesService,
}))

import { POST } from '@/app/api/search/route'

describe('POST /api/search', () => {
  beforeEach(() => {
    mocks.search.mockReset()
    mocks.withAuth.mockReset()
    mocks.withAuth.mockImplementation(
      async (handler: (user: { id: string }) => Promise<Response>) =>
        handler({ id: 'user-1' })
    )
  })

  it('retorna 400 quando o payload e invalido', async () => {
    const request = new NextRequest('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({ city: 'Sao Paulo' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
      },
    })
    expect(mocks.search).not.toHaveBeenCalled()
  })

  it('retorna resultados e headers de rate limit', async () => {
    mocks.search.mockResolvedValue({
      places: [
        {
          placeId: 'place-1',
          name: 'Studio Acme',
          phone: null,
          website: null,
          rating: 4.8,
          totalRatings: 120,
          score: 91,
          isHotLead: true,
          address: 'Rua A, 123',
        },
      ],
      rateLimit: {
        remaining: 9,
        resetAt: '2026-04-05T00:00:00.000Z',
      },
    })

    const request = new NextRequest('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'Designer',
        city: 'Sao Paulo',
        minRating: 4,
      }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual([
      {
        placeId: 'place-1',
        name: 'Studio Acme',
        phone: null,
        website: null,
        rating: 4.8,
        totalRatings: 120,
        score: 91,
        isHotLead: true,
        address: 'Rua A, 123',
      },
    ])
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
    expect(response.headers.get('X-RateLimit-Reset')).toBe(
      '2026-04-05T00:00:00.000Z'
    )
    expect(mocks.search).toHaveBeenCalledWith('user-1', {
      query: 'Designer',
      city: 'Sao Paulo',
      minRating: 4,
    })
  })
})
