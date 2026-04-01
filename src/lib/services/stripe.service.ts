import Stripe from 'stripe'
import { ProfileRepository } from '@/lib/repositories/profile.repository'

export interface SubscriptionIntentResult {
  clientSecret: string
  subscriptionId: string
}

export class StripeService {
  constructor(
    private readonly stripe: Stripe,
    private readonly profileRepository: ProfileRepository
  ) {}

  async createSubscriptionIntent(
    userId: string,
    userEmail: string
  ): Promise<SubscriptionIntentResult> {
    const customerId = await this.resolveCustomerId(userId, userEmail)

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID! }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent
    }

    return {
      clientSecret: invoice.payment_intent.client_secret!,
      subscriptionId: subscription.id,
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'invoice.payment_succeeded') {
      await this.activatePaidPlan(event.data.object as Stripe.Invoice)
    }

    if (event.type === 'customer.subscription.deleted') {
      await this.deactivatePaidPlan(event.data.object as Stripe.Subscription)
    }
  }

  private async resolveCustomerId(userId: string, userEmail: string): Promise<string> {
    const profile = await this.profileRepository.findById(userId)

    if (profile?.stripeCustomerId) return profile.stripeCustomerId

    const customer = await this.stripe.customers.create({ email: userEmail, metadata: { userId } })
    await this.profileRepository.updateStripeCustomerId(userId, customer.id)
    return customer.id
  }

  private async activatePaidPlan(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    const profile = await this.profileRepository.findByStripeCustomerId(customerId)
    if (!profile) return
    await this.profileRepository.updatePlan(profile.id, 'paid')
  }

  private async deactivatePaidPlan(subscription: Stripe.Subscription): Promise<void> {
    const profile = await this.profileRepository.findByStripeCustomerId(
      subscription.customer as string
    )
    if (!profile) return
    await this.profileRepository.updatePlan(profile.id, 'free')
  }
}
