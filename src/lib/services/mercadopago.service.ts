import { randomUUID } from 'node:crypto'
import { PreApproval, PreApprovalPlan } from 'mercadopago'
import { buildAppUrl, getAppUrl } from '@/lib/config/app-url'
import { ConflictError } from '@/lib/http/errors'
import { WebhookEventRepository } from '@/lib/repositories/webhook-event.repository'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { UserPlan } from '@/lib/types/lead'
import { CreateSubscriptionInput, SubscriptionResult } from '@/lib/types/mercadopago'
import {
  SUBSCRIPTION_RULES,
  PAID_SUBSCRIPTION_STATUSES,
  NON_REUSABLE_SUBSCRIPTION_STATUSES,
} from '@/lib/config/business-rules'

interface MercadoPagoWebhookEvent {
  action?: string
  eventId?: string
  payload: unknown
  requestId: string | null
  resourceId: string
  type: string
}

type WebhookEventStatus = 'ignored' | 'processing' | 'processed' | 'failed'

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
    const reusableSubscription = await this.findReusableSubscription(userId)
    if (reusableSubscription) {
      return reusableSubscription
    }

    const lockId = randomUUID()
    const lockAcquired = await this.profileRepository.tryAcquireSubscriptionLock(
      userId,
      lockId,
      SUBSCRIPTION_RULES.LOCK_TTL_SECONDS
    )

    if (!lockAcquired) {
      throw new ConflictError(
        'Já existe uma solicitação de assinatura em andamento para este usuário',
        'SUBSCRIPTION_CREATION_IN_PROGRESS'
      )
    }

    try {
      const subscriptionAfterLock = await this.findReusableSubscription(userId)
      if (subscriptionAfterLock) {
        return subscriptionAfterLock
      }

      const planId = await this.resolvePlanId()
      const appUrl = getAppUrl()

      const subscription = await this.preApproval.create({
        body: {
          preapproval_plan_id: planId,
          reason: SUBSCRIPTION_RULES.PLAN_REASON,
          payer_email: payerEmail,
          card_token_id: input.cardToken,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: SUBSCRIPTION_RULES.PLAN_AMOUNT,
            currency_id: SUBSCRIPTION_RULES.PLAN_CURRENCY,
          },
          back_url: appUrl,
          status: 'authorized',
        },
      })

      if (!subscription.id || !subscription.status) {
        throw new Error('Resposta inválida do Mercado Pago ao criar assinatura')
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

    const alreadyProcessed = await this.webhookEventRepository.isProcessed(
      SUBSCRIPTION_RULES.PROVIDER,
      providerEventId
    )
    if (alreadyProcessed) return

    await this.persistWebhookEvent(event, providerEventId, 'processing')

    try {
      if (event.type !== 'subscription_preapproval') {
        await this.persistWebhookEvent(event, providerEventId, 'ignored')
        return
      }

      const subscription = await this.preApproval.get({ id: event.resourceId })
      const profile = await this.profileRepository.findByMpSubscriptionId(event.resourceId)

      if (!profile) {
        await this.persistWebhookEvent(event, providerEventId, 'ignored')
        return
      }

      if (!subscription.status) {
        throw new Error('Resposta inválida do Mercado Pago ao consultar assinatura do webhook')
      }

      const resolvedPlan = this.resolvePlanFromSubscriptionStatus(subscription.status)
      if (resolvedPlan) {
        await this.profileRepository.updatePlan(profile.id, resolvedPlan)
      }

      await this.persistWebhookEvent(event, providerEventId, 'processed')
    } catch (processingError) {
      await this.persistWebhookEvent(event, providerEventId, 'failed', processingError)
      throw processingError
    }
  }

  private async findReusableSubscription(userId: string): Promise<SubscriptionResult | null> {
    const profile = await this.profileRepository.findById(userId)
    if (!profile?.mpSubscriptionId) return null

    const subscription = await this.preApproval.get({ id: profile.mpSubscriptionId })

    if (!subscription.id || !subscription.status) {
      throw new Error('Resposta inválida do Mercado Pago ao consultar assinatura existente')
    }

    if (NON_REUSABLE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
      return null
    }

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
    }
  }

  private resolvePlanFromSubscriptionStatus(subscriptionStatus: string): UserPlan | null {
    if (PAID_SUBSCRIPTION_STATUSES.has(subscriptionStatus)) return 'paid'
    if (NON_REUSABLE_SUBSCRIPTION_STATUSES.has(subscriptionStatus)) return 'free'
    return null
  }

  private async persistWebhookEvent(
    event: MercadoPagoWebhookEvent,
    providerEventId: string,
    status: WebhookEventStatus,
    error?: unknown
  ): Promise<void> {
    const isTerminalStatus = status === 'ignored' || status === 'processed'

    await this.webhookEventRepository.upsert({
      action: event.action ?? null,
      eventType: event.type,
      lastError: error instanceof Error ? error.message : error ? 'Erro desconhecido' : null,
      payload: event.payload,
      processedAt: isTerminalStatus ? new Date().toISOString() : null,
      provider: SUBSCRIPTION_RULES.PROVIDER,
      providerEventId,
      requestId: event.requestId,
      resourceId: event.resourceId,
      status,
    })
  }

  private async resolvePlanId(): Promise<string> {
    const availablePlans = await this.preApprovalPlan.search({ options: {} })
    const existingPlan = availablePlans.results?.find(
      plan => plan.reason === SUBSCRIPTION_RULES.PLAN_REASON
    )

    if (existingPlan?.id) return existingPlan.id

    const createdPlan = await this.preApprovalPlan.create({
      body: {
        reason: SUBSCRIPTION_RULES.PLAN_REASON,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: SUBSCRIPTION_RULES.PLAN_AMOUNT,
          currency_id: SUBSCRIPTION_RULES.PLAN_CURRENCY,
        },
        back_url: buildAppUrl('/'),
      },
    })

    return createdPlan.id!
  }
}
