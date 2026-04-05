'use client'

import { useMemo } from 'react'
import { Lead, LeadStatus, LEAD_STATUS_FLOW, LEAD_STATUS_COLUMN_LABELS, LEAD_STATUS_ORDER } from '@/lib/types/lead'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  leads: Lead[]
  onMove: (leadId: string, status: LeadStatus) => void
  userService?: string
}

export function KanbanBoard({ leads, onMove, userService }: KanbanBoardProps) {
  const leadsByStatus = useMemo(
    () => LEAD_STATUS_ORDER.reduce<Record<LeadStatus, Lead[]>>(
      (groupedLeads, status) => ({
        ...groupedLeads,
        [status]: leads.filter(lead => lead.status === status),
      }),
      {} as Record<LeadStatus, Lead[]>
    ),
    [leads]
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {LEAD_STATUS_ORDER.map(status => (
        <KanbanColumn
          key={status}
          title={LEAD_STATUS_COLUMN_LABELS[status]}
          status={status}
          leads={leadsByStatus[status]}
          onMove={onMove}
          nextStatus={LEAD_STATUS_FLOW[status]}
          userService={userService}
        />
      ))}
    </div>
  )
}
