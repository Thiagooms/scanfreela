import { SupabaseClient } from '@supabase/supabase-js'
import { Lead, LeadCreateInput, LeadUpdateInput } from '@/lib/types/lead'

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

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return count ?? 0
  }

  async create(userId: string, input: LeadCreateInput): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert({
        user_id: userId,
        place_id: input.placeId,
        name: input.name,
        phone: input.phone,
        website: input.website,
        rating: input.rating,
        total_ratings: input.totalRatings,
        score: input.score,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return this.toEntity(data)
  }

  async update(leadId: string, userId: string, input: LeadUpdateInput): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .update({
        ...(input.status && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.lastContact && { last_contact: input.lastContact }),
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
