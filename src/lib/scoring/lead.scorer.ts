import { PlaceResult } from '@/lib/types/places'
import { ScoredPlace } from '@/lib/types/lead'
import { SCORING_RULES } from '@/lib/config/business-rules'

export class LeadScorer {
  score(place: PlaceResult): ScoredPlace {
    const calculatedScore = this.calculateScore(place)
    const isHotLead = this.isRatingInHotLeadRange(place.rating)

    return {
      placeId: place.place_id,
      name: place.name,
      phone: place.formatted_phone_number ?? null,
      website: place.website ?? null,
      rating: place.rating ?? null,
      totalRatings: place.user_ratings_total ?? null,
      score: calculatedScore,
      isHotLead,
      address: place.formatted_address ?? null,
    }
  }

  private calculateScore(place: PlaceResult): number {
    let score = 0
    if (place.website) score++
    if (place.formatted_phone_number) score++
    if ((place.user_ratings_total ?? 0) >= SCORING_RULES.MIN_RATINGS_FOR_BONUS_SCORE) score++
    return score
  }

  private isRatingInHotLeadRange(rating?: number): boolean {
    if (rating === undefined) return false
    return rating >= SCORING_RULES.HOT_LEAD_MIN_RATING && rating <= SCORING_RULES.HOT_LEAD_MAX_RATING
  }
}
