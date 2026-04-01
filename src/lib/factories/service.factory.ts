import { SupabaseClient } from '@supabase/supabase-js'
import MercadoPagoConfig, { PreApproval, PreApprovalPlan } from 'mercadopago'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { LeadScorer } from '@/lib/scoring/lead.scorer'
import { PlanGuard } from '@/lib/guards/plan.guard'
import { LeadService } from '@/lib/services/lead.service'
import { PlacesService } from '@/lib/services/places.service'
import { MercadoPagoService } from '@/lib/services/mercadopago.service'
import { createAdminClient } from '@/lib/supabase/admin'

export function makeLeadService(supabase: SupabaseClient): LeadService {
  const leadRepository = new LeadRepository(supabase)
  const profileRepository = new ProfileRepository(supabase)
  const planGuard = new PlanGuard(profileRepository, leadRepository)
  return new LeadService(leadRepository, planGuard)
}

export function makePlacesService(): PlacesService {
  const scorer = new LeadScorer()
  return new PlacesService(scorer)
}

export function makeMercadoPagoService(): MercadoPagoService {
  const supabase = createAdminClient()
  const profileRepository = new ProfileRepository(supabase)
  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const preApproval = new PreApproval(mpClient)
  const preApprovalPlan = new PreApprovalPlan(mpClient)
  return new MercadoPagoService(profileRepository, preApproval, preApprovalPlan)
}
