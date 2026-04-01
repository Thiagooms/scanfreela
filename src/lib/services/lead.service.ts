import { Lead, LeadCreateInput, LeadUpdateInput } from '@/lib/types/lead'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { PlanGuard } from '@/lib/guards/plan.guard'

export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly planGuard: PlanGuard
  ) {}

  async listByUser(userId: string): Promise<Lead[]> {
    return this.leadRepository.findAllByUser(userId)
  }

  async save(userId: string, input: LeadCreateInput): Promise<Lead> {
    await this.planGuard.assertCanSaveLead(userId)
    return this.leadRepository.create(userId, input)
  }

  async update(leadId: string, userId: string, input: LeadUpdateInput): Promise<Lead> {
    return this.leadRepository.update(leadId, userId, input)
  }
}
