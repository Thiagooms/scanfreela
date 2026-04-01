import { Lead, LeadCreateInput, LeadUpdateInput, ScoredPlace } from '@/lib/types/lead'
import { PlacesSearchParams } from '@/lib/types/places'
import { ApiError, parseResponse } from '@/lib/api/errors'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export type SaveLeadResult =
  | { success: true; lead: Lead }
  | { success: false; planLimitReached: true }

export const leadApiClient = {
  async search(params: PlacesSearchParams): Promise<ScoredPlace[]> {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(params),
    })
    return parseResponse<ScoredPlace[]>(response)
  },

  async list(): Promise<Lead[]> {
    const response = await fetch('/api/leads')
    return parseResponse<Lead[]>(response)
  },

  async save(input: LeadCreateInput): Promise<SaveLeadResult> {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    })

    if (response.status === 403) {
      return { success: false, planLimitReached: true }
    }

    const lead = await parseResponse<Lead>(response)
    return { success: true, lead }
  },

  async update(leadId: string, input: LeadUpdateInput): Promise<Lead> {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    })
    return parseResponse<Lead>(response)
  },
}
