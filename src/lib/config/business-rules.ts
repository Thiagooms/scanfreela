export const SCORING_RULES = {
  HOT_LEAD_MIN_RATING: 3,
  HOT_LEAD_MAX_RATING: 4,
  MIN_RATINGS_FOR_BONUS_SCORE: 10,
} as const

export const RATE_LIMIT_RULES = {
  FREE_SEARCH_LIMIT_PER_WINDOW: 12,
  PAID_SEARCH_LIMIT_PER_WINDOW: 60,
  SEARCH_WINDOW_SECONDS: 60,
  SEARCH_SCOPE: 'search',
  MAX_PLACE_DETAILS_PER_SEARCH: 10,
} as const

export const SUBSCRIPTION_RULES = {
  LOCK_TTL_SECONDS: 60,
  PLAN_REASON: 'SpotLead - Plano Pro',
  PLAN_AMOUNT: 49,
  PLAN_CURRENCY: 'BRL',
  PROVIDER: 'mercadopago',
} as const

export const PAID_SUBSCRIPTION_STATUSES = new Set(['active', 'authorized'])

export const NON_REUSABLE_SUBSCRIPTION_STATUSES = new Set([
  'canceled',
  'cancelled',
  'expired',
  'paused',
  'rejected',
])

export const FREE_PLAN_LEAD_LIMIT = 30
