import { CreateSubscriptionInput, SubscriptionResult } from '@/lib/types/mercadopago'
import { parseResponse } from '@/lib/api/errors'

export const mpApiClient = {
  async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult> {
    const response = await fetch('/api/mp/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return parseResponse<SubscriptionResult>(response)
  },
}
