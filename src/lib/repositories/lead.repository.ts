import { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, UnauthorizedError } from '@/lib/http/errors'
import { Lead, LeadPersistInput, LeadUpdateInput, LEAD_STATUSES } from '@/lib/types/lead'

function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Campo obrigatório "${fieldName}" ausente ou em formato inválido no retorno do banco de dados`)
  }
  return value
}

function assertOptionalString(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') {
    throw new Error(`Campo "${fieldName}" em formato inválido no retorno do banco de dados`)
  }
  return value
}

function assertOptionalNumber(value: unknown, fieldName: string): number | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'number') {
    throw new Error(`Campo "${fieldName}" em formato inválido no retorno do banco de dados`)
  }
  return value
}

function assertLeadStatus(value: unknown): Lead['status'] {
  if (!LEAD_STATUSES.includes(value as Lead['status'])) {
    throw new Error(`Campo "status" possui valor inválido: ${value}`)
  }
  return value as Lead['status']
}

export class LeadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAllByUser(userId: string): Promise<Lead[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map(row => this.toEntity(row))
  }

  async saveSecure(input: LeadPersistInput): Promise<Lead> {
    const { data, error } = await this.supabase
      .rpc('save_lead_secure', {
        p_name: input.name,
        p_phone: input.phone,
        p_place_id: input.placeId,
        p_rating: input.rating,
        p_total_ratings: input.totalRatings,
        p_website: input.website,
      })
      .single()

    if (error || !data) {
      const message = error?.message ?? 'Lead was not returned from save_lead_secure'

      if (message.includes('PLAN_LIMIT_REACHED')) {
        throw new ForbiddenError(
          'Você atingiu o limite do plano gratuito',
          'PLAN_LIMIT_REACHED'
        )
      }

      if (message.includes('UNAUTHORIZED')) {
        throw new UnauthorizedError()
      }

      throw new Error(message)
    }

    return this.toEntity(data as Record<string, unknown>)
  }

  async update(leadId: string, userId: string, input: LeadUpdateInput): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .update({
        ...(input.status !== undefined && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.lastContact !== undefined && { last_contact: input.lastContact }),
      })
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return this.toEntity(data)
  }

  private toEntity(row: Record<string, unknown>): Lead {
    return {
      id: assertString(row.id, 'id'),
      userId: assertString(row.user_id, 'user_id'),
      placeId: assertString(row.place_id, 'place_id'),
      name: assertString(row.name, 'name'),
      phone: assertOptionalString(row.phone, 'phone'),
      website: assertOptionalString(row.website, 'website'),
      rating: assertOptionalNumber(row.rating, 'rating'),
      totalRatings: assertOptionalNumber(row.total_ratings, 'total_ratings'),
      score: assertOptionalNumber(row.score, 'score') ?? 0,
      status: assertLeadStatus(row.status),
      notes: assertOptionalString(row.notes, 'notes'),
      lastContact: assertOptionalString(row.last_contact, 'last_contact'),
      createdAt: assertString(row.created_at, 'created_at'),
    }
  }
}
