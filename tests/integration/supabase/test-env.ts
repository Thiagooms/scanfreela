import { randomUUID } from 'node:crypto'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

type TestPlan = 'free' | 'paid'

interface SupabaseIntegrationConfig {
  anonKey: string
  serviceRoleKey: string
  url: string
}

interface TestUserContext {
  admin: SupabaseClient
  client: SupabaseClient
  cleanup: () => Promise<void>
  email: string
  password: string
  userId: string
}

const config = readConfig()

function readConfig(): SupabaseIntegrationConfig | null {
  if (process.env.VITEST_SUPABASE_MODE !== 'true') {
    return null
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !anonKey || !serviceRoleKey) {
    return null
  }

  return {
    anonKey,
    serviceRoleKey,
    url,
  }
}

export const hasSupabaseIntegrationEnv = config !== null

export function createAdminTestClient(): SupabaseClient {
  if (!config) {
    throw new Error('Supabase integration tests are not configured')
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createUserTestClient(): SupabaseClient {
  if (!config) {
    throw new Error('Supabase integration tests are not configured')
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createAuthenticatedTestUser(
  plan: TestPlan = 'free'
): Promise<TestUserContext> {
  const admin = createAdminTestClient()
  const client = createUserTestClient()
  const email = `integration-${randomUUID()}@example.com`
  const password = `Test-${randomUUID()}-Aa1`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  })

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Failed to create integration test user')
  }

  const userId = data.user.id

  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        mp_subscription_id: null,
        plan,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    throw new Error(profileError.message)
  }

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    await safeCleanup(admin, userId)
    throw new Error(signInError.message)
  }

  return {
    admin,
    client,
    cleanup: async () => {
      await client.auth.signOut()
      await safeCleanup(admin, userId)
    },
    email,
    password,
    userId,
  }
}

async function safeCleanup(admin: SupabaseClient, userId: string): Promise<void> {
  await admin.from('api_rate_limits').delete().eq('user_id', userId)
  await admin.from('leads').delete().eq('user_id', userId)
  await admin.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)
}
