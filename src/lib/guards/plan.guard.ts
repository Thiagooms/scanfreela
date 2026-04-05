import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { ForbiddenError } from '@/lib/http/errors'
import { UserPlan } from '@/lib/types/lead'

const FREE_PLAN_LEAD_LIMIT = 30

export class PlanGuard {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getPlan(userId: string): Promise<UserPlan> {
    return this.profileRepository.getPlanByUserId(userId)
  }

  async assertPaidPlan(userId: string): Promise<void> {
    const plan = await this.getPlan(userId)
    if (plan !== 'paid') {
      throw new ForbiddenError(
        'Seu plano atual nao possui acesso a este recurso',
        'PAID_PLAN_REQUIRED'
      )
    }
  }

  async assertAuthenticated(userId: string): Promise<void> {
    const profile = await this.profileRepository.findById(userId)
    if (!profile) {
      throw new ForbiddenError('Perfil nao encontrado', 'PROFILE_NOT_FOUND')
    }
  }
}

export { FREE_PLAN_LEAD_LIMIT }
