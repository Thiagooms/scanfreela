'use client'

import { useState, useCallback } from 'react'
import { leadApiClient } from '@/lib/api/lead.client'
import { ApiError } from '@/lib/api/errors'
import { ScoredPlace } from '@/lib/types/lead'
import { PlacesSearchParams } from '@/lib/types/places'

interface UseSearchReturn {
  searchResults: ScoredPlace[]
  isSearching: boolean
  searchError: string | null
  savingPlaceId: string | null
  showPaywall: boolean
  search: (params: PlacesSearchParams) => Promise<void>
  save: (place: ScoredPlace) => Promise<void>
  dismissPaywall: () => void
}

export function useSearch(): UseSearchReturn {
  const [searchResults, setSearchResults] = useState<ScoredPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [savingPlaceId, setSavingPlaceId] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const search = useCallback(async (params: PlacesSearchParams) => {
    setIsSearching(true)
    setSearchResults([])
    setSearchError(null)

    try {
      const places = await leadApiClient.search(params)
      setSearchResults(places)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SEARCH_RATE_LIMIT_EXCEEDED') {
        setSearchError('Limite de buscas excedido. Aguarde um instante antes de tentar de novo.')
      } else {
        setSearchError('Erro ao buscar negócios. Tente novamente.')
      }
    } finally {
      setIsSearching(false)
    }
  }, [])

  const save = useCallback(async (place: ScoredPlace) => {
    setSavingPlaceId(place.placeId)

    try {
      const result = await leadApiClient.save({ placeId: place.placeId })

      if (!result.success && result.planLimitReached) {
        setShowPaywall(true)
      }
    } finally {
      setSavingPlaceId(null)
    }
  }, [])

  const dismissPaywall = useCallback(() => {
    setShowPaywall(false)
  }, [])

  return {
    searchResults,
    isSearching,
    searchError,
    savingPlaceId,
    showPaywall,
    search,
    save,
    dismissPaywall,
  }
}
