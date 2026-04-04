import {
  Lead,
  LeadCreateInput,
  LeadPersistInput,
  LeadUpdateInput,
} from '@/lib/types/lead'
import { NotFoundError, RateLimitError } from '@/lib/http/errors'
import { IGooglePlacesRepository } from '@/lib/repositories/google-places.repository'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { RateLimitRepository } from '@/lib/repositories/rate-limit.repository'
import { LeadScorer } from '@/lib/scoring/lead.scorer'

const LEAD_CREATE_RATE_LIMIT_SCOPE = 'lead_create'
const LEAD_CREATE_RATE_WINDOW_SECONDS = 60
const FREE_LEAD_CREATE_LIMIT = 10
const PAID_LEAD_CREATE_LIMIT = 30

export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly placesRepository: IGooglePlacesRepository,
    private readonly scorer: LeadScorer,
    private readonly profileRepository: ProfileRepository,
    private readonly rateLimitRepository: RateLimitRepository
  ) {}

  async listByUser(userId: string): Promise<Lead[]> {
    return this.leadRepository.findAllByUser(userId)
  }

  async save(userId: string, input: LeadCreateInput): Promise<Lead> {
    await this.applyCreateRateLimit(userId)

    const place = await this.placesRepository.getDetails(input.placeId)
    if (!place) {
      throw new NotFoundError(
        'Nao foi possivel localizar o estabelecimento informado',
        'PLACE_NOT_FOUND'
      )
    }

    const scoredPlace = this.scorer.score(place)
    const leadInput: LeadPersistInput = {
      placeId: scoredPlace.placeId,
      name: scoredPlace.name,
      phone: scoredPlace.phone,
      website: scoredPlace.website,
      rating: scoredPlace.rating,
      totalRatings: scoredPlace.totalRatings,
    }

    return this.leadRepository.saveSecure(leadInput)
  }

  async update(leadId: string, userId: string, input: LeadUpdateInput): Promise<Lead> {
    return this.leadRepository.update(leadId, userId, input)
  }

  private async applyCreateRateLimit(userId: string): Promise<void> {
    const plan = await this.profileRepository.getPlanByUserId(userId)
    const limit = plan === 'paid' ? PAID_LEAD_CREATE_LIMIT : FREE_LEAD_CREATE_LIMIT
    const rateLimit = await this.rateLimitRepository.check(
      userId,
      LEAD_CREATE_RATE_LIMIT_SCOPE,
      limit,
      LEAD_CREATE_RATE_WINDOW_SECONDS
    )

    if (!rateLimit.allowed) {
      throw new RateLimitError(
        'Limite de criacoes de lead excedido. Tente novamente em instantes.',
        'LEAD_CREATE_RATE_LIMIT_EXCEEDED'
      )
    }
  }
}
