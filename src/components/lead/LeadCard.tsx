'use client'

import { ScoredPlace } from '@/lib/types/lead'
import { LeadScore } from './LeadScore'

interface LeadCardProps {
  place: ScoredPlace
  onSave: (place: ScoredPlace) => void
  isSaving: boolean
}

export function LeadCard({ place, onSave, isSaving }: LeadCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{place.name}</h3>
        <LeadScore score={place.score} isHotLead={place.isHotLead} />
      </div>

      {place.address && (
        <p className="text-xs text-gray-500 line-clamp-1">{place.address}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-600">
        {place.rating && (
          <span>★ {place.rating} ({place.totalRatings} avaliações)</span>
        )}
        {place.website && (
          <span className="text-green-600">✓ Site</span>
        )}
        {place.phone && (
          <span className="text-green-600">✓ Telefone</span>
        )}
      </div>

      <button
        onClick={() => onSave(place)}
        disabled={isSaving}
        className="w-full mt-1 py-1.5 px-3 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? 'Salvando...' : 'Salvar lead'}
      </button>
    </div>
  )
}
