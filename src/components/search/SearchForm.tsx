'use client'

import { useState, useEffect } from 'react'
import { PlacesSearchParams } from '@/lib/types/places'

interface SearchFormProps {
  onSearch: (params: PlacesSearchParams) => void
  isLoading: boolean
  initialValues?: { query: string; city: string }
}

export function SearchForm({ onSearch, isLoading, initialValues }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialValues?.query ?? '')
  const [searchCity, setSearchCity] = useState(initialValues?.city ?? '')

  useEffect(() => {
    if (!initialValues?.query && !initialValues?.city) return
    setSearchQuery(initialValues.query)
    setSearchCity(initialValues.city)
  }, [initialValues])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!searchQuery.trim() || !searchCity.trim()) return
    onSearch({ query: searchQuery.trim(), city: searchCity.trim() })
  }

  const isSubmitDisabled = isLoading || !searchQuery.trim() || !searchCity.trim()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label htmlFor="search-query" className="sr-only">
          Categoria de negócio
        </label>
        <input
          id="search-query"
          type="text"
          placeholder="Categoria (ex: barbearia, restaurante)"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="w-full sm:w-48">
        <label htmlFor="search-city" className="sr-only">
          Cidade
        </label>
        <input
          id="search-city"
          type="text"
          placeholder="Cidade"
          value={searchCity}
          onChange={event => setSearchCity(event.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitDisabled}
        aria-busy={isLoading}
        className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}
