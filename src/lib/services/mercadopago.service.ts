import { PreApproval, PreApprovalPlan } from 'mercadopago'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { CreateSubscriptionInput, SubscriptionResult } from '@/lib/types/mercadopago'

const MP_PLAN_REASON = 'SpotLead — Plano Pro'
const MP_PLAN_AMOUNT = 50
const MP_PLAN_CURRENCY = 'BRL'
const MP_BACK_URL = process.env.NEXT_PUBLIC_APP_URL!

export class MercadoPagoService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly preApproval: PreApproval,
    private readonly preApprovalPlan: PreApprovalPlan
  ) {}

  async createSubscription(
    userId: string,
    input: CreateSubscriptionInput
  ): Promise<SubscriptionResult> {
    const planId = await this.resolvePlanId()

    const subscription = await this.preApproval.create({
      body: {
        preapproval_plan_id: planId,
        reason: MP_PLAN_REASON,
        payer_email: input.payerEmail,
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

    await this.profileRepository.updateMpSubscriptionId(userId, subscription.id!)

    return {
      subscriptionId: subscription.id!,
      status: subscription.status!,
    }
  }

  async handleWebhook(type: string, dataId: string): Promise<void> {
    if (type !== 'subscription_preapproval') return

    const subscription = await this.preApproval.get({ id: dataId })
    const profile = await this.profileRepository.findByMpSubscriptionId(dataId)

    if (!profile) return

    if (subscription.status === 'authorized') {
      await this.profileRepository.updatePlan(profile.id, 'paid')
    }

    if (subscription.status === 'cancelled') {
      await this.profileRepository.updatePlan(profile.id, 'free')
    }
  }

  private async resolvePlanId(): Promise<string> {
    const plans = await this.preApprovalPlan.search({ options: {} })
    const existing = plans.results?.find(p => p.reason === MP_PLAN_REASON)

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
