export interface SubscriptionResult {
  subscriptionId: string
  status: string
}

export interface CreateSubscriptionInput {
  cardToken: string
  payerEmail: string
}
