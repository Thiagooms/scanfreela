'use client'

import { useEffect, useState } from 'react'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import { leadApiClient } from '@/lib/api/lead.client'
import { Lead, LeadStatus } from '@/lib/types/lead'

export function PipelinePageClient() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    leadApiClient.list()
      .then(data => {
        setLeads(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  async function handleMove(leadId: string, status: LeadStatus) {
    setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status } : lead))
    await leadApiClient.update(leadId, { status })
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pipeline</h1>
        <p className="text-sm text-gray-500">Acompanhe seus leads em cada etapa</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 text-center py-12">Carregando leads...</p>
      ) : (
        <KanbanBoard leads={leads} onMove={handleMove} />
      )}
    </main>
  )
}
