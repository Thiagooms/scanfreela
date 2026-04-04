import { randomUUID } from 'node:crypto'
import { PreApproval, PreApprovalPlan } from 'mercadopago'
import { buildAppUrl, getAppUrl } from '@/lib/config/app-url'
import { ConflictError } from '@/lib/http/errors'
import { WebhookEventRepository } from '@/lib/repositories/webhook-event.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { CreateSubscriptionInput, SubscriptionResult } from '@/lib/types/mercadopago'

const MP_PLAN_REASON = 'SpotLead - Plano Pro'
const MP_PLAN_AMOUNT = 50
const MP_PLAN_CURRENCY = 'BRL'
const MP_PROVIDER = 'mercadopago'
const SUBSCRIPTION_LOCK_TTL_SECONDS = 60
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['cancelled', 'expired', 'rejected'])

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
    const existingSubscription = await this.findReusableSubscription(userId)
    if (existingSubscription) {
      return existingSubscription
    }

    const lockId = randomUUID()
    const lockAcquired = await this.profileRepository.tryAcquireSubscriptionLock(
      userId,
      lockId,
      SUBSCRIPTION_LOCK_TTL_SECONDS
    )

    if (!lockAcquired) {
      throw new ConflictError(
        'Ja existe uma solicitacao de assinatura em andamento para este usuario',
        'SUBSCRIPTION_CREATION_IN_PROGRESS'
      )
    }

    try {
      const reusableSubscription = await this.findReusableSubscription(userId)
      if (reusableSubscription) {
        return reusableSubscription
      }

      const planId = await this.resolvePlanId()
      const backUrl = getAppUrl()

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
          back_url: backUrl,
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
    } finally {
      await this.profileRepository.releaseSubscriptionLock(userId, lockId)
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

  private async findReusableSubscription(userId: string): Promise<SubscriptionResult | null> {
    const profile = await this.profileRepository.findById(userId)
    if (!profile?.mpSubscriptionId) {
      return null
    }

    const subscription = await this.preApproval.get({ id: profile.mpSubscriptionId })

    if (!subscription.id || !subscription.status) {
      throw new Error('Resposta invalida do Mercado Pago ao consultar assinatura existente')
    }

    if (this.isTerminalSubscriptionStatus(subscription.status)) {
      return null
    }

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
    }
  }

  private isTerminalSubscriptionStatus(status: string): boolean {
    return TERMINAL_SUBSCRIPTION_STATUSES.has(status)
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
        back_url: buildAppUrl('/'),
      },
    })

    return plan.id!
  }
}
