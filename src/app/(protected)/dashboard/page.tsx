'use client'

import { useEffect, useState } from 'react'
import { SearchForm } from '@/components/search/SearchForm'
import { ResultsList } from '@/components/search/ResultsList'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import { useSearch } from '@/hooks/useSearch'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('')
  const {
    searchResults,
    isSearching,
    searchError,
    savingPlaceId,
    showPaywall,
    search,
    save,
    dismissPaywall,
  } = useSearch()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? '')
    })
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Buscar leads</h1>
        <p className="text-sm text-gray-500">Encontre negócios por categoria e cidade</p>
      </div>

      <div className="mb-8">
        <SearchForm onSearch={search} isLoading={isSearching} />
      </div>

      {isSearching && (
        <p role="status" className="text-sm text-gray-500 text-center py-12">
          Buscando negócios...
        </p>
      )}

      {searchError && (
        <p role="alert" className="text-sm text-red-600 text-center py-12">
          {searchError}
        </p>
      )}

      <ResultsList
        places={searchResults}
        savingPlaceId={savingPlaceId}
        onSave={save}
      />

      <PaywallModal
        isOpen={showPaywall}
        payerEmail={userEmail}
        onClose={dismissPaywall}
      />
    </main>
  )
}
