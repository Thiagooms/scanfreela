export type LeadStatus = 'new' | 'approached' | 'negotiating' | 'closed'

export type UserPlan = 'free' | 'paid'

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
  name: string
  phone: string | null
  website: string | null
  rating: number | null
  totalRatings: number | null
  score: number
}

export interface LeadUpdateInput {
  status?: LeadStatus
  notes?: string
  lastContact?: string
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
