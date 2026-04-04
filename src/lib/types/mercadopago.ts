export interface SubscriptionResult {
  subscriptionId: string
  status: string
}

export interface CreateSubscriptionInput {
  cardToken: string
}

export interface MercadoPagoWebhookPayload {
  action?: string
  dataId: string
  eventId?: string
  type: string
}

export interface ParsedMercadoPagoWebhook {
  payload: Record<string, unknown>
  webhook: MercadoPagoWebhookPayload
}
