import { PlaceResult } from '@/lib/types/places'

const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const PLACES_DETAIL_FIELDS = 'place_id,name,formatted_phone_number,website,rating,user_ratings_total,formatted_address,geometry'
const PLACES_REQUEST_TIMEOUT_MS = 8000

export interface IGooglePlacesRepository {
  searchByText(query: string, city: string): Promise<{ place_id: string }[]>
  getDetails(placeId: string): Promise<PlaceResult | null>
}

export class GooglePlacesRepository implements IGooglePlacesRepository {
  constructor(private readonly apiKey: string) {}

  async searchByText(query: string, city: string): Promise<{ place_id: string }[]> {
    const encoded = encodeURIComponent(`${query} em ${city}`)
    const url = `${PLACES_API_BASE_URL}/textsearch/json?query=${encoded}&key=${this.apiKey}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(PLACES_REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Places API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`)
    }

    return data.results ?? []
  }

  async getDetails(placeId: string): Promise<PlaceResult | null> {
    const url = `${PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=${PLACES_DETAIL_FIELDS}&key=${this.apiKey}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(PLACES_REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Places API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK') return null
    return data.result
  }
}
