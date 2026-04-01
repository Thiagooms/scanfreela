import { PlaceResult, PlacesSearchParams } from '@/lib/types/places'
import { ScoredPlace } from '@/lib/types/lead'
import { LeadScorer } from '@/lib/scoring/lead.scorer'

const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const PLACES_DETAIL_FIELDS = 'place_id,name,formatted_phone_number,website,rating,user_ratings_total,formatted_address,geometry'

export class PlacesService {
  constructor(private readonly scorer: LeadScorer) {}

  async search(params: PlacesSearchParams): Promise<ScoredPlace[]> {
    const places = await this.fetchPlaces(params)
    const details = await Promise.all(places.map(p => this.fetchDetails(p.place_id)))
    const validDetails = details.filter((d): d is PlaceResult => d !== null)

    return validDetails
      .map(place => this.scorer.score(place))
      .filter(place => this.matchesRatingFilter(place, params))
      .sort((a, b) => b.score - a.score)
  }

  private async fetchPlaces(params: PlacesSearchParams): Promise<{ place_id: string }[]> {
    const query = encodeURIComponent(`${params.query} em ${params.city}`)
    const url = `${PLACES_API_BASE_URL}/textsearch/json?query=${query}&key=${process.env.GOOGLE_PLACES_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`)
    }

    return data.results ?? []
  }

  private async fetchDetails(placeId: string): Promise<PlaceResult | null> {
    const url = `${PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=${PLACES_DETAIL_FIELDS}&key=${process.env.GOOGLE_PLACES_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') return null
    return data.result
  }

  private matchesRatingFilter(place: ScoredPlace, params: PlacesSearchParams): boolean {
    if (params.minRating !== undefined && (place.rating ?? 0) < params.minRating) return false
    if (params.maxRating !== undefined && (place.rating ?? 5) > params.maxRating) return false
    return true
  }
}
