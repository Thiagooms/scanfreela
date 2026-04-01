import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { LeadRepository } from '@/lib/repositories/lead.repository'

const FREE_PLAN_LEAD_LIMIT = 10

export class PlanLimitError extends Error {
  constructor() {
    super('Lead limit reached for free plan')
    this.name = 'PlanLimitError'
  }
}

export class PlanGuard {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly leadRepository: LeadRepository
  ) {}

  async assertCanSaveLead(userId: string): Promise<void> {
    const profile = await this.profileRepository.findById(userId)

    if (profile?.plan === 'paid') return

    const leadCount = await this.leadRepository.countByUser(userId)

    if (leadCount >= FREE_PLAN_LEAD_LIMIT) {
      throw new PlanLimitError()
    }
  }
}
