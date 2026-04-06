import { SupabaseClient } from '@supabase/supabase-js'
import { UserPlan } from '@/lib/types/lead'

export interface Profile {
  id: string
  plan: UserPlan
  trialEndsAt: string | null
  mpSubscriptionId: string | null
  service: string | null
  city: string | null
  onboardingCompletedAt: string | null
}

export class ProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return this.toEntity(data)
  }

  async findByMpSubscriptionId(subscriptionId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('mp_subscription_id', subscriptionId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return this.toEntity(data)
  }

  async getPlanByUserId(userId: string): Promise<UserPlan> {
    const profile = await this.findById(userId)

    if (!profile) return 'free'
    if (profile.plan === 'paid') return 'paid'
    if (profile.trialEndsAt && new Date(profile.trialEndsAt) > new Date()) return 'paid'

    return 'free'
  }

  async ensureProfile(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .upsert({ id: userId, plan: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

    if (error) throw new Error(error.message)
  }

  async updatePlan(userId: string, plan: UserPlan): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }

  async updateMpSubscriptionId(userId: string, subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ mp_subscription_id: subscriptionId })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }

  async tryAcquireSubscriptionLock(
    userId: string,
    lockId: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('try_acquire_subscription_lock', {
      p_lock_id: lockId,
      p_lock_ttl_seconds: ttlSeconds,
      p_user_id: userId,
    })

    if (error) throw new Error(error.message)
    return data === true
  }

  async releaseSubscriptionLock(userId: string, lockId: string): Promise<void> {
    const { error } = await this.supabase.rpc('release_subscription_lock', {
      p_lock_id: lockId,
      p_user_id: userId,
    })

    if (error) throw new Error(error.message)
  }

  async updateOnboarding(userId: string, service: string, city: string): Promise<void> {
    const { error, data } = await this.supabase
      .from('profiles')
      .update({
        service,
        city,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id')

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Perfil nao encontrado ou acesso negado')
  }

  private toEntity(row: Record<string, unknown> | null): Profile | null {
    if (!row) return null

    return {
      id: row.id as string,
      plan: row.plan as UserPlan,
      trialEndsAt: row.trial_ends_at as string | null,
      mpSubscriptionId: row.mp_subscription_id as string | null,
      service: row.service as string | null,
      city: row.city as string | null,
      onboardingCompletedAt: row.onboarding_completed_at as string | null,
    }
  }
}
