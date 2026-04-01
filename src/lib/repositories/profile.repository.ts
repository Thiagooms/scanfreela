import { SupabaseClient } from '@supabase/supabase-js'
import { UserPlan } from '@/lib/types/lead'

interface Profile {
  id: string
  plan: UserPlan
  stripeCustomerId: string | null
}

export class ProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return this.toEntity(data)
  }

  async findByStripeCustomerId(customerId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error) return null
    return this.toEntity(data)
  }

  async updatePlan(userId: string, plan: UserPlan): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }

  private toEntity(row: Record<string, unknown>): Profile {
    return {
      id: row.id as string,
      plan: row.plan as UserPlan,
      stripeCustomerId: row.stripe_customer_id as string | null,
    }
  }
}
