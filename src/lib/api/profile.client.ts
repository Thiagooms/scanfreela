import { parseResponse } from '@/lib/api/errors'
import { UserPlan } from '@/lib/types/lead'

interface ProfileResult {
  id: string
  plan: UserPlan
  mpSubscriptionId: string | null
}

export const profileApiClient = {
  async get(): Promise<ProfileResult> {
    const response = await fetch('/api/profile')
    return parseResponse<ProfileResult>(response)
  },
}
