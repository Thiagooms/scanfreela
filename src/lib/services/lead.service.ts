import {
  Lead,
  LeadCreateInput,
  LeadPersistInput,
  LeadUpdateInput,
} from '@/lib/types/lead'
import { NotFoundError } from '@/lib/http/errors'
import { IGooglePlacesRepository } from '@/lib/repositories/google-places.repository'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { LeadScorer } from '@/lib/scoring/lead.scorer'

export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly placesRepository: IGooglePlacesRepository,
    private readonly scorer: LeadScorer
  ) {}

  async listByUser(userId: string): Promise<Lead[]> {
    return this.leadRepository.findAllByUser(userId)
  }

  async save(input: LeadCreateInput): Promise<Lead> {
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
}
