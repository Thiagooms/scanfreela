export interface CheckoutSessionResult {
  url: string
}

export interface StripeWebhookPayload {
  customerId: string
  subscriptionStatus: string
}
