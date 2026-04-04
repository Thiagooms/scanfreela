import { SupabaseClient } from '@supabase/supabase-js'
import { RateLimitResult } from '@/lib/types/rate-limit'

interface RateLimitRow {
  allowed: boolean
  remaining: number
  reset_at: string
}

export class RateLimitRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async check(
    userId: string,
    scope: string,
    limit: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const { data, error } = await this.supabase
      .rpc('check_rate_limit', {
        p_limit: limit,
        p_scope: scope,
        p_user_id: userId,
        p_window_seconds: windowSeconds,
      })
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? 'Rate limit data was not returned')
    }

    const row = data as RateLimitRow

    return {
      allowed: row.allowed,
      remaining: row.remaining,
      resetAt: row.reset_at,
    }
  }
}
