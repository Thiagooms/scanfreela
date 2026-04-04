import { PreApproval, PreApprovalPlan } from 'mercadopago'
import { WebhookEventRepository } from '@/lib/repositories/webhook-event.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { CreateSubscriptionInput, SubscriptionResult } from '@/lib/types/mercadopago'

const MP_PLAN_REASON = 'SpotLead - Plano Pro'
const MP_PLAN_AMOUNT = 50
const MP_PLAN_CURRENCY = 'BRL'
const MP_BACK_URL = process.env.NEXT_PUBLIC_APP_URL!
const MP_PROVIDER = 'mercadopago'

interface MercadoPagoWebhookEvent {
  action?: string
  eventId?: string
  payload: unknown
  requestId: string | null
  resourceId: string
  type: string
}

export class MercadoPagoService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly preApproval: PreApproval,
    private readonly preApprovalPlan: PreApprovalPlan,
    private readonly webhookEventRepository: WebhookEventRepository
  ) {}

  async createSubscription(
    userId: string,
    payerEmail: string,
    input: CreateSubscriptionInput
  ): Promise<SubscriptionResult> {
    const planId = await this.resolvePlanId()

    const subscription = await this.preApproval.create({
      body: {
        preapproval_plan_id: planId,
        reason: MP_PLAN_REASON,
        payer_email: payerEmail,
        card_token_id: input.cardToken,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: MP_PLAN_AMOUNT,
          currency_id: MP_PLAN_CURRENCY,
        },
        back_url: MP_BACK_URL,
        status: 'authorized',
      },
    })

    if (!subscription.id || !subscription.status) {
      throw new Error('Resposta invalida do Mercado Pago ao criar assinatura')
    }

    await this.profileRepository.updateMpSubscriptionId(userId, subscription.id)

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
    }
  }

  async handleWebhook(event: MercadoPagoWebhookEvent): Promise<void> {
    const providerEventId = event.eventId
      ?? event.requestId
      ?? `${event.type}:${event.resourceId}:${event.action ?? 'unknown'}`

    if (await this.webhookEventRepository.isProcessed(MP_PROVIDER, providerEventId)) {
      return
    }

    await this.markProcessing(event, providerEventId)

    try {
      if (event.type !== 'subscription_preapproval') {
        await this.markIgnored(event, providerEventId)
        return
      }

      const subscription = await this.preApproval.get({ id: event.resourceId })
      const profile = await this.profileRepository.findByMpSubscriptionId(event.resourceId)

      if (!profile) {
        await this.markIgnored(event, providerEventId)
        return
      }

      if (subscription.status === 'authorized') {
        await this.profileRepository.updatePlan(profile.id, 'paid')
      }

      if (subscription.status === 'cancelled') {
        await this.profileRepository.updatePlan(profile.id, 'free')
      }

      await this.markProcessed(event, providerEventId)
    } catch (error) {
      await this.markFailed(event, providerEventId, error)

      throw error
    }
  }

  private async markProcessing(
    event: MercadoPagoWebhookEvent,
    providerEventId: string
  ): Promise<void> {
    await this.webhookEventRepository.upsert(
      this.buildWebhookEventRecord(event, providerEventId, 'processing')
    )
  }

  private async markIgnored(
    event: MercadoPagoWebhookEvent,
    providerEventId: string
  ): Promise<void> {
    await this.webhookEventRepository.upsert(
      this.buildWebhookEventRecord(event, providerEventId, 'ignored')
    )
  }

  private async markProcessed(
    event: MercadoPagoWebhookEvent,
    providerEventId: string
  ): Promise<void> {
    await this.webhookEventRepository.upsert(
      this.buildWebhookEventRecord(event, providerEventId, 'processed')
    )
  }

  private async markFailed(
    event: MercadoPagoWebhookEvent,
    providerEventId: string,
    error: unknown
  ): Promise<void> {
    await this.webhookEventRepository.upsert(
      this.buildWebhookEventRecord(
        event,
        providerEventId,
        'failed',
        error instanceof Error ? error.message : 'Erro desconhecido'
      )
    )
  }

  private buildWebhookEventRecord(
    event: MercadoPagoWebhookEvent,
    providerEventId: string,
    status: 'ignored' | 'processing' | 'processed' | 'failed',
    lastError?: string
  ) {
    const shouldSetProcessedAt = status === 'ignored' || status === 'processed'

    return {
      action: event.action ?? null,
      eventType: event.type,
      lastError: lastError ?? null,
      payload: event.payload,
      processedAt: shouldSetProcessedAt ? new Date().toISOString() : null,
      provider: MP_PROVIDER,
      providerEventId,
      requestId: event.requestId,
      resourceId: event.resourceId,
      status,
    }
  }

  private async resolvePlanId(): Promise<string> {
    const plans = await this.preApprovalPlan.search({ options: {} })
    const existing = plans.results?.find(plan => plan.reason === MP_PLAN_REASON)

    if (existing?.id) return existing.id

    const plan = await this.preApprovalPlan.create({
      body: {
        reason: MP_PLAN_REASON,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: MP_PLAN_AMOUNT,
          currency_id: MP_PLAN_CURRENCY,
        },
        back_url: MP_BACK_URL,
      },
    })

    return plan.id!
  }
}
