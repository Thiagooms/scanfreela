export type LeadStatus = 'new' | 'approached' | 'negotiating' | 'closed'

export type UserPlan = 'free' | 'paid'

export const LEAD_STATUSES = ['new', 'approached', 'negotiating', 'closed'] as const
export const USER_PLANS = ['free', 'paid'] as const

export const LEAD_STATUS_FLOW: Record<LeadStatus, LeadStatus | null> = {
  new: 'approached',
  approached: 'negotiating',
  negotiating: 'closed',
  closed: null,
}

export const LEAD_STATUS_COLUMN_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  approached: 'Abordado',
  negotiating: 'Negociando',
  closed: 'Fechado',
}

export const LEAD_STATUS_ACTION_LABELS: Record<LeadStatus, string> = {
  new: 'Marcar como Abordado',
  approached: 'Marcar como Negociando',
  negotiating: 'Marcar como Fechado',
  closed: '',
}

export const LEAD_STATUS_ORDER: LeadStatus[] = ['new', 'approached', 'negotiating', 'closed']

export interface Lead {
  id: string
  userId: string
  placeId: string
  name: string
  phone: string | null
  website: string | null
  rating: number | null
  totalRatings: number | null
  score: number
  status: LeadStatus
  notes: string | null
  lastContact: string | null
  createdAt: string
}

export interface LeadCreateInput {
  placeId: string
}

export interface LeadPersistInput {
  placeId: string
  name: string
  phone: string | null
  website: string | null
  rating: number | null
  totalRatings: number | null
}

export interface LeadUpdateInput {
  status?: LeadStatus
  notes?: string | null
  lastContact?: string | null
}

export interface ScoredPlace {
  placeId: string
  name: string
  phone: string | null
  website: string | null
  rating: number | null
  totalRatings: number | null
  score: number
  isHotLead: boolean
  address: string | null
}
