import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import {
  createAuthenticatedTestUser,
  hasSupabaseIntegrationEnv,
} from './test-env'

const describeIf = hasSupabaseIntegrationEnv ? describe : describe.skip

describeIf('ProfileRepository lock RPCs with real Supabase', () => {
  let cleanup: (() => Promise<void>) | null = null

  afterEach(async () => {
    if (cleanup) {
      await cleanup()
      cleanup = null
    }
  })

  it('adquire e libera o lock de assinatura apenas via service role', async () => {
    const context = await createAuthenticatedTestUser('free')
    cleanup = context.cleanup

    const adminRepository = new ProfileRepository(context.admin)
    const userRepository = new ProfileRepository(context.client)
    const firstLockId = randomUUID()
    const secondLockId = randomUUID()

    await expect(
      userRepository.tryAcquireSubscriptionLock(context.userId, firstLockId, 60)
    ).rejects.toThrow(/FORBIDDEN|Could not find the function/)

    expect(
      await adminRepository.tryAcquireSubscriptionLock(context.userId, firstLockId, 60)
    ).toBe(true)

    expect(
      await adminRepository.tryAcquireSubscriptionLock(context.userId, secondLockId, 60)
    ).toBe(false)

    await adminRepository.releaseSubscriptionLock(context.userId, firstLockId)

    expect(
      await adminRepository.tryAcquireSubscriptionLock(context.userId, secondLockId, 60)
    ).toBe(true)
  })
})
