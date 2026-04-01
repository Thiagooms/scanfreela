export interface PlacesSearchParams {
  query: string
  city: string
  minRating?: number
  maxRating?: number
}

export interface PlaceResult {
  place_id: string
  name: string
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  formatted_address?: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

export interface PlacesApiResponse {
  results: PlaceResult[]
  status: string
  next_page_token?: string
}
