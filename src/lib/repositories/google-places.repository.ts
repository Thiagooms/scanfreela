import { PlaceResult } from '@/lib/types/places'

const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const PLACES_DETAIL_FIELDS = 'place_id,name,formatted_phone_number,website,rating,user_ratings_total,formatted_address,geometry'
const PLACES_REQUEST_TIMEOUT_MS = 8000

interface PlacesSearchApiResponse {
  status: string
  results: Array<{ place_id: string }>
}

interface PlacesDetailApiResponse {
  status: string
  result?: PlaceResult
}

export interface IGooglePlacesRepository {
  searchByText(query: string, city: string): Promise<{ place_id: string }[]>
  getDetails(placeId: string): Promise<PlaceResult | null>
}

function assertPlacesSearchResponse(data: unknown): asserts data is PlacesSearchApiResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Google Places API retornou uma resposta inválida')
  }

  const response = data as Record<string, unknown>

  if (typeof response.status !== 'string') {
    throw new Error('Google Places API: campo "status" ausente ou em formato inválido')
  }

  if (response.results !== undefined && !Array.isArray(response.results)) {
    throw new Error('Google Places API: campo "results" em formato inválido')
  }
}

function assertPlacesDetailResponse(data: unknown): asserts data is PlacesDetailApiResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Google Places API retornou uma resposta de detalhe inválida')
  }

  const response = data as Record<string, unknown>

  if (typeof response.status !== 'string') {
    throw new Error('Google Places API: campo "status" ausente na resposta de detalhe')
  }
}

export class GooglePlacesRepository implements IGooglePlacesRepository {
  constructor(private readonly apiKey: string) {}

  async searchByText(query: string, city: string): Promise<{ place_id: string }[]> {
    const encodedQuery = encodeURIComponent(`${query} em ${city}`)
    const url = `${PLACES_API_BASE_URL}/textsearch/json?query=${encodedQuery}&key=${this.apiKey}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(PLACES_REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Google Places API respondeu com status HTTP ${response.status}`)
    }

    const rawData = await response.json()
    assertPlacesSearchResponse(rawData)

    if (rawData.status !== 'OK' && rawData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API retornou erro: ${rawData.status}`)
    }

    return rawData.results ?? []
  }

  async getDetails(placeId: string): Promise<PlaceResult | null> {
    const url = `${PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=${PLACES_DETAIL_FIELDS}&key=${this.apiKey}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(PLACES_REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Google Places API respondeu com status HTTP ${response.status} ao buscar detalhes`)
    }

    const rawData = await response.json()
    assertPlacesDetailResponse(rawData)

    if (rawData.status !== 'OK') return null

    return rawData.result ?? null
  }
}
