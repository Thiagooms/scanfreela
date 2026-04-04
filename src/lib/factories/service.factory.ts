import { SupabaseClient } from '@supabase/supabase-js'
import MercadoPagoConfig, { PreApproval, PreApprovalPlan } from 'mercadopago'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { GooglePlacesRepository } from '@/lib/repositories/google-places.repository'
import { RateLimitRepository } from '@/lib/repositories/rate-limit.repository'
import { WebhookEventRepository } from '@/lib/repositories/webhook-event.repository'
import { LeadScorer } from '@/lib/scoring/lead.scorer'
import { PlanGuard } from '@/lib/guards/plan.guard'
import { LeadService } from '@/lib/services/lead.service'
import { PlacesService } from '@/lib/services/places.service'
import { MercadoPagoService } from '@/lib/services/mercadopago.service'
import { createAdminClient } from '@/lib/supabase/admin'

// Pattern:
// - services that depend on a user SupabaseClient are created per request
// - services without a user SupabaseClient are safe to reuse as module singletons
const adminSupabase = createAdminClient()
const sharedLeadScorer = new LeadScorer()
const sharedPlacesRepository = new GooglePlacesRepository(process.env.GOOGLE_PLACES_API_KEY!)
const sharedProfileRepository = new ProfileRepository(adminSupabase)
const sharedRateLimitRepository = new RateLimitRepository(adminSupabase)
const sharedWebhookEventRepository = new WebhookEventRepository(adminSupabase)
const sharedMercadoPagoClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
const sharedPreApproval = new PreApproval(sharedMercadoPagoClient)
const sharedPreApprovalPlan = new PreApprovalPlan(sharedMercadoPagoClient)
const sharedPlacesService = new PlacesService(
  sharedLeadScorer,
  sharedPlacesRepository,
  sharedProfileRepository,
  sharedRateLimitRepository
)
const sharedMercadoPagoService = new MercadoPagoService(
  sharedProfileRepository,
  sharedPreApproval,
  sharedPreApprovalPlan,
  sharedWebhookEventRepository
)

export function makeLeadScorer(): LeadScorer {
  return sharedLeadScorer
}

export function makePlacesRepository(): GooglePlacesRepository {
  return sharedPlacesRepository
}

export function makeLeadService(supabase: SupabaseClient): LeadService {
  const leadRepository = new LeadRepository(supabase)
  const scorer = makeLeadScorer()
  const placesRepository = makePlacesRepository()
  return new LeadService(
    leadRepository,
    placesRepository,
    scorer,
    sharedProfileRepository,
    sharedRateLimitRepository
  )
}

export function makeProfileRepository(supabase: SupabaseClient): ProfileRepository {
  return new ProfileRepository(supabase)
}

export function makePlanGuard(supabase: SupabaseClient): PlanGuard {
  return new PlanGuard(makeProfileRepository(supabase))
}

export function makeRateLimitRepository(supabase: SupabaseClient): RateLimitRepository {
  return new RateLimitRepository(supabase)
}

export function makePlacesService(): PlacesService {
  return sharedPlacesService
}

export function makeMercadoPagoService(): MercadoPagoService {
  return sharedMercadoPagoService
}
