import { ConfigurationError } from '@/lib/http/errors'

function requireEnvVar(variableName: string): string {
  const value = process.env[variableName]?.trim()
  if (!value) {
    throw new ConfigurationError(
      `Variável de ambiente obrigatória não configurada: ${variableName}`,
      'ENV_VAR_MISSING'
    )
  }
  return value
}

function requirePublicEnvVar(variableName: string): string {
  const value = process.env[variableName]?.trim()
  if (!value) {
    throw new ConfigurationError(
      `Variável de ambiente pública obrigatória não configurada: ${variableName}`,
      'ENV_VAR_MISSING'
    )
  }
  return value
}

export function getSupabaseUrl(): string {
  return requirePublicEnvVar('NEXT_PUBLIC_SUPABASE_URL')
}

export function getSupabaseAnonKey(): string {
  return requirePublicEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnvVar('SUPABASE_SERVICE_ROLE_KEY')
}

export function getGooglePlacesApiKey(): string {
  return requireEnvVar('GOOGLE_PLACES_API_KEY')
}

export function getMercadoPagoAccessToken(): string {
  return requireEnvVar('MP_ACCESS_TOKEN')
}

export function getMercadoPagoPublicKey(): string {
  return requirePublicEnvVar('NEXT_PUBLIC_MP_PUBLIC_KEY')
}

export function getMercadoPagoWebhookSecret(): string | null {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim()
  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new ConfigurationError(
      'MP_WEBHOOK_SECRET não configurado em produção',
      'MP_WEBHOOK_SECRET_MISSING'
    )
  }

  return null
}
