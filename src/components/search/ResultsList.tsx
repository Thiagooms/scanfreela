'use client'

import { ScoredPlace } from '@/lib/types/lead'
import { LeadCard } from '@/components/lead/LeadCard'

interface ResultsListProps {
  places: ScoredPlace[]
  savingPlaceId: string | null
  onSave: (place: ScoredPlace) => void
}

export function ResultsList({ places, savingPlaceId, onSave }: ResultsListProps) {
  if (places.length === 0) return null

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">{places.length} resultados encontrados</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map(place => (
          <LeadCard
            key={place.placeId}
            place={place}
            onSave={onSave}
            isSaving={savingPlaceId === place.placeId}
          />
        ))}
      </div>
    </div>
  )
}
