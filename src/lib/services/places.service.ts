import { IGooglePlacesRepository } from '@/lib/repositories/google-places.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { RateLimitRepository } from '@/lib/repositories/rate-limit.repository'
import { RateLimitError } from '@/lib/http/errors'
import { PlaceResult, PlacesSearchParams } from '@/lib/types/places'
import { ScoredPlace } from '@/lib/types/lead'
import { LeadScorer } from '@/lib/scoring/lead.scorer'
import { RateLimitResult } from '@/lib/types/rate-limit'

const MAX_DETAILS_PER_SEARCH = 10
const FREE_SEARCH_LIMIT = 12
const PAID_SEARCH_LIMIT = 60
const SEARCH_RATE_WINDOW_SECONDS = 60
const SEARCH_RATE_LIMIT_SCOPE = 'search'

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
    const uniquePlaceIds = Array.from(new Set(places.map(place => place.place_id))).slice(0, MAX_DETAILS_PER_SEARCH)
    const details = await Promise.all(uniquePlaceIds.map(placeId => this.placesRepository.getDetails(placeId)))
    const validDetails = details.filter((d): d is PlaceResult => d !== null)

    const scoredPlaces = validDetails
      .map(place => this.scorer.score(place))
      .filter(place => this.matchesRatingFilter(place, params))
      .sort((a, b) => b.score - a.score)

    return {
      places: scoredPlaces,
      rateLimit,
    }
  }

  private matchesRatingFilter(place: ScoredPlace, params: PlacesSearchParams): boolean {
    if (params.minRating !== undefined && (place.rating ?? 0) < params.minRating) return false
    if (params.maxRating !== undefined && (place.rating ?? 5) > params.maxRating) return false
    return true
  }

  private async applySearchRateLimit(userId: string): Promise<RateLimitResult> {
    const plan = await this.profileRepository.getPlanByUserId(userId)
    const limit = plan === 'paid' ? PAID_SEARCH_LIMIT : FREE_SEARCH_LIMIT
    const rateLimit = await this.rateLimitRepository.check(
      userId,
      SEARCH_RATE_LIMIT_SCOPE,
      limit,
      SEARCH_RATE_WINDOW_SECONDS
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
