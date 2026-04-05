'use client'

import { Lead, LeadStatus, LEAD_STATUS_ACTION_LABELS } from '@/lib/types/lead'
import { WhatsAppButton } from './WhatsAppButton'

interface KanbanCardProps {
  lead: Lead
  onMove: (leadId: string, status: LeadStatus) => void
  nextStatus: LeadStatus | null
  userService?: string
}

export function KanbanCard({ lead, onMove, nextStatus, userService }: KanbanCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <p className="text-sm font-medium text-gray-900 mb-1">{lead.name}</p>
      {lead.phone && (
        <p className="text-xs text-gray-500 mb-1">{lead.phone}</p>
      )}
      {lead.notes && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{lead.notes}</p>
      )}
      <div className="flex flex-col gap-1.5 mt-2">
        <WhatsAppButton lead={lead} userService={userService} onMove={onMove} />
        {nextStatus && (
          <button
            onClick={() => onMove(lead.id, nextStatus)}
            className="w-full text-xs py-1 px-2 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            {LEAD_STATUS_ACTION_LABELS[lead.status]}
          </button>
        )}
      </div>
    </div>
  )
}
