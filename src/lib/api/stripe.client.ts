import { parseResponse } from '@/lib/api/errors'

export interface SubscriptionIntentResult {
  clientSecret: string
  subscriptionId: string
}

export const stripeApiClient = {
  async createSubscriptionIntent(): Promise<SubscriptionIntentResult> {
    const response = await fetch('/api/stripe/subscription-intent', { method: 'POST' })
    return parseResponse<SubscriptionIntentResult>(response)
  },
}
