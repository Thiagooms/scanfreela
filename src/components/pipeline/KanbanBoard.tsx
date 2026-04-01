'use client'

import { Lead, LeadStatus } from '@/lib/types/lead'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  leads: Lead[]
  onMove: (leadId: string, status: LeadStatus) => void
}

const COLUMNS: { title: string; status: LeadStatus; nextStatus: LeadStatus | null }[] = [
  { title: 'Novo', status: 'new', nextStatus: 'approached' },
  { title: 'Abordado', status: 'approached', nextStatus: 'negotiating' },
  { title: 'Negociando', status: 'negotiating', nextStatus: 'closed' },
  { title: 'Fechado', status: 'closed', nextStatus: null },
]

export function KanbanBoard({ leads, onMove }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          leads={leads.filter(l => l.status === col.status)}
          onMove={onMove}
          nextStatus={col.nextStatus}
        />
      ))}
    </div>
  )
}
