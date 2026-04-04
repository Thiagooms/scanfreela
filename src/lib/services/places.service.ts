import { IGooglePlacesRepository } from '@/lib/repositories/google-places.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { RateLimitRepository } from '@/lib/repositories/rate-limit.repository'
import { RateLimitError } from '@/lib/http/errors'
import { PlaceResult, PlacesSearchParams } from '@/lib/types/places'
import { ScoredPlace } from '@/lib/types/lead'
import { LeadScorer } from '@/lib/scoring/lead.scorer'
import { RateLimitResult } from '@/lib/types/rate-limit'
import { RATE_LIMIT_RULES } from '@/lib/config/business-rules'

export interface PlacesSearchResult {
  places: ScoredPlace[]
  rateLimit: RateLimitResult
}

export class PlacesService {
  constructor(
    private readonly scorer: LeadScorer,
    private readonly placesRepository: IGooglePlacesRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly rateLimitRepository: RateLimitRepository
  ) {}

  async search(userId: string, params: PlacesSearchParams): Promise<PlacesSearchResult> {
    const rateLimit = await this.applySearchRateLimit(userId)

    const places = await this.placesRepository.searchByText(params.query, params.city)

    const uniquePlaceIds = Array.from(new Set(places.map(place => place.place_id)))
      .slice(0, RATE_LIMIT_RULES.MAX_PLACE_DETAILS_PER_SEARCH)

    const detailResults = await Promise.allSettled(
      uniquePlaceIds.map(placeId => this.placesRepository.getDetails(placeId))
    )

    const validDetails = detailResults
      .filter((result): result is PromiseFulfilledResult<PlaceResult | null> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter((detail): detail is PlaceResult => detail !== null)

    const scoredPlaces = validDetails
      .map(place => this.scorer.score(place))
      .filter(place => this.matchesRatingFilter(place, params))
      .sort((first, second) => second.score - first.score)

    return { places: scoredPlaces, rateLimit }
  }

  private matchesRatingFilter(place: ScoredPlace, params: PlacesSearchParams): boolean {
    if (params.minRating !== undefined && (place.rating ?? 0) < params.minRating) return false
    if (params.maxRating !== undefined && (place.rating ?? 5) > params.maxRating) return false
    return true
  }

  private async applySearchRateLimit(userId: string): Promise<RateLimitResult> {
    const userPlan = await this.profileRepository.getPlanByUserId(userId)
    const searchLimit = userPlan === 'paid'
      ? RATE_LIMIT_RULES.PAID_SEARCH_LIMIT_PER_WINDOW
      : RATE_LIMIT_RULES.FREE_SEARCH_LIMIT_PER_WINDOW

    const rateLimit = await this.rateLimitRepository.check(
      userId,
      RATE_LIMIT_RULES.SEARCH_SCOPE,
      searchLimit,
      RATE_LIMIT_RULES.SEARCH_WINDOW_SECONDS
    )

    if (!rateLimit.allowed) {
      throw new RateLimitError(
        'Limite de buscas excedido. Tente novamente em instantes.',
        'SEARCH_RATE_LIMIT_EXCEEDED'
      )
    }

    return rateLimit
  }
}
