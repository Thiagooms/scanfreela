import { SupabaseClient } from '@supabase/supabase-js'
import { ForbiddenError, UnauthorizedError } from '@/lib/http/errors'
import { Lead, LeadPersistInput, LeadUpdateInput } from '@/lib/types/lead'

export class LeadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAllByUser(userId: string): Promise<Lead[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map(this.toEntity)
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
          'Voce atingiu o limite do plano gratuito',
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
      id: row.id as string,
      userId: row.user_id as string,
      placeId: row.place_id as string,
      name: row.name as string,
      phone: row.phone as string | null,
      website: row.website as string | null,
      rating: row.rating as number | null,
      totalRatings: row.total_ratings as number | null,
      score: row.score as number,
      status: row.status as Lead['status'],
      notes: row.notes as string | null,
      lastContact: row.last_contact as string | null,
      createdAt: row.created_at as string,
    }
  }
}
