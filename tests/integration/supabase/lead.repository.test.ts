import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import {
  createAuthenticatedTestUser,
  hasSupabaseIntegrationEnv,
} from './test-env'

const describeIf = hasSupabaseIntegrationEnv ? describe : describe.skip

describeIf('LeadRepository with real Supabase', () => {
  let cleanup: (() => Promise<void>) | null = null

  afterEach(async () => {
    if (cleanup) {
      await cleanup()
      cleanup = null
    }
  })

  it('persiste o lead via save_lead_secure com score calculado no banco', async () => {
    const context = await createAuthenticatedTestUser('free')
    cleanup = context.cleanup

    const repository = new LeadRepository(context.client)
    const lead = await repository.saveSecure({
      name: 'Studio Acme',
      phone: '11999999999',
      placeId: `place-${randomUUID()}`,
      rating: 4.8,
      totalRatings: 42,
      website: 'https://studio-acme.test',
    })

    expect(lead.userId).toBe(context.userId)
    expect(lead.name).toBe('Studio Acme')
    expect(lead.score).toBe(3)
    expect(lead.placeId).toMatch(/^place-/)
  })

  it('bloqueia o 11o lead para usuario free', async () => {
    const context = await createAuthenticatedTestUser('free')
    cleanup = context.cleanup

    const repository = new LeadRepository(context.client)

    for (let index = 0; index < 10; index += 1) {
      await repository.saveSecure({
        name: `Studio ${index}`,
        phone: null,
        placeId: `place-${randomUUID()}`,
        rating: null,
        totalRatings: null,
        website: null,
      })
    }

    await expect(
      repository.saveSecure({
        name: 'Studio 11',
        phone: null,
        placeId: `place-${randomUUID()}`,
        rating: null,
        totalRatings: null,
        website: null,
      })
    ).rejects.toMatchObject({
      code: 'PLAN_LIMIT_REACHED',
      status: 403,
    })
  })
})
