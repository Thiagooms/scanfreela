import { parseResponse } from '@/lib/api/errors'
import { UserPlan } from '@/lib/types/lead'

export interface ProfileResult {
  id: string
  plan: UserPlan
  effectivePlan: UserPlan
  trialEndsAt: string | null
  service: string | null
}

export const profileApiClient = {
  async get(): Promise<ProfileResult> {
    const response = await fetch('/api/profile')
    return parseResponse<ProfileResult>(response)
  },
}
