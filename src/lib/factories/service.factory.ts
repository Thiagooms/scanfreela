import Stripe from 'stripe'
import { SupabaseClient } from '@supabase/supabase-js'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { LeadScorer } from '@/lib/scoring/lead.scorer'
import { PlanGuard } from '@/lib/guards/plan.guard'
import { LeadService } from '@/lib/services/lead.service'
import { PlacesService } from '@/lib/services/places.service'
import { StripeService } from '@/lib/services/stripe.service'
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

export function makeStripeService(): StripeService {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createAdminClient()
  const profileRepository = new ProfileRepository(supabase)
  return new StripeService(stripe, profileRepository)
}
