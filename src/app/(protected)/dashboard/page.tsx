'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/search/SearchForm'
import { ResultsList } from '@/components/search/ResultsList'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import { leadApiClient } from '@/lib/api/lead.client'
import { ScoredPlace } from '@/lib/types/lead'
import { PlacesSearchParams } from '@/lib/types/places'

export default function DashboardPage() {
  const [results, setResults] = useState<ScoredPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [savingPlaceId, setSavingPlaceId] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  async function handleSearch(params: PlacesSearchParams) {
    setIsSearching(true)
    setResults([])
    setSearchError(null)

    try {
      const places = await leadApiClient.search(params)
      setResults(places)
    } catch {
      setSearchError('Erro ao buscar negócios. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSave(place: ScoredPlace) {
    setSavingPlaceId(place.placeId)

    try {
      const result = await leadApiClient.save({
        placeId: place.placeId,
        name: place.name,
        phone: place.phone,
        website: place.website,
        rating: place.rating,
        totalRatings: place.totalRatings,
        score: place.score,
      })

      if (!result.success && result.planLimitReached) {
        setShowPaywall(true)
      }
    } finally {
      setSavingPlaceId(null)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Buscar leads</h1>
        <p className="text-sm text-gray-500">Encontre negócios por categoria e cidade</p>
      </div>

      <div className="mb-8">
        <SearchForm onSearch={handleSearch} isLoading={isSearching} />
      </div>

      {isSearching && (
        <p className="text-sm text-gray-500 text-center py-12">Buscando negócios...</p>
      )}

      {searchError && (
        <p className="text-sm text-red-600 text-center py-12">{searchError}</p>
      )}

      <ResultsList
        places={results}
        savingPlaceId={savingPlaceId}
        onSave={handleSave}
      />

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </main>
  )
}
