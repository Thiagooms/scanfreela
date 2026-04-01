'use client'

import { Lead, LeadStatus } from '@/lib/types/lead'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  title: string
  status: LeadStatus
  leads: Lead[]
  onMove: (leadId: string, status: LeadStatus) => void
  nextStatus: LeadStatus | null
}

export function KanbanColumn({ title, leads, onMove, nextStatus }: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 min-h-24">
        {leads.map(lead => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onMove={onMove}
            nextStatus={nextStatus}
          />
        ))}
      </div>
    </div>
  )
}
