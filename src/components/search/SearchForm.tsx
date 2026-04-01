'use client'

import { useState } from 'react'
import { PlacesSearchParams } from '@/lib/types/places'

interface SearchFormProps {
  onSearch: (params: PlacesSearchParams) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || !city.trim()) return
    onSearch({ query: query.trim(), city: city.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Categoria (ex: barbearia, restaurante)"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="Cidade"
        value={city}
        onChange={e => setCity(e.target.value)}
        className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim() || !city.trim()}
        className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}
