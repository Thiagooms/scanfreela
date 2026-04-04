import { afterEach, describe, expect, it } from 'vitest'
import { RateLimitRepository } from '@/lib/repositories/rate-limit.repository'
import {
  createAuthenticatedTestUser,
  hasSupabaseIntegrationEnv,
} from './test-env'

const describeIf = hasSupabaseIntegrationEnv ? describe : describe.skip

describeIf('RateLimitRepository with real Supabase', () => {
  let cleanup: (() => Promise<void>) | null = null

  afterEach(async () => {
    if (cleanup) {
      await cleanup()
      cleanup = null
    }
  })

  it('aplica rate limit via service role e bloqueia apos exceder o limite', async () => {
    const context = await createAuthenticatedTestUser('free')
    cleanup = context.cleanup

    const repository = new RateLimitRepository(context.admin)

    const first = await repository.check(context.userId, 'integration-search', 2, 60)
    const second = await repository.check(context.userId, 'integration-search', 2, 60)
    const third = await repository.check(context.userId, 'integration-search', 2, 60)

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(true)
    expect(third.allowed).toBe(false)
    expect(third.remaining).toBe(0)
  })

  it('nega a RPC de rate limit para usuario autenticado comum', async () => {
    const context = await createAuthenticatedTestUser('free')
    cleanup = context.cleanup

    const repository = new RateLimitRepository(context.client)

    await expect(
      repository.check(context.userId, 'integration-search', 1, 60)
    ).rejects.toThrow(/FORBIDDEN|Could not find the function/)
  })
})
