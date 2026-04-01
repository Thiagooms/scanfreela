import { PlaceResult } from '@/lib/types/places'
import { ScoredPlace } from '@/lib/types/lead'

const HOT_LEAD_MIN_RATING = 3
const HOT_LEAD_MAX_RATING = 4
const MIN_RATINGS_FOR_SCORE = 10

export class LeadScorer {
  score(place: PlaceResult): ScoredPlace {
    const score = this.calcScore(place)
    const isHotLead = this.calcIsHotLead(place.rating)

    return {
      placeId: place.place_id,
      name: place.name,
      phone: place.formatted_phone_number ?? null,
      website: place.website ?? null,
      rating: place.rating ?? null,
      totalRatings: place.user_ratings_total ?? null,
      score,
      isHotLead,
      address: place.formatted_address ?? null,
    }
  }

  private calcScore(place: PlaceResult): number {
    let score = 0
    if (place.website) score++
    if (place.formatted_phone_number) score++
    if ((place.user_ratings_total ?? 0) >= MIN_RATINGS_FOR_SCORE) score++
    return score
  }

  private calcIsHotLead(rating?: number): boolean {
    if (rating === undefined) return false
    return rating >= HOT_LEAD_MIN_RATING && rating <= HOT_LEAD_MAX_RATING
  }
}
