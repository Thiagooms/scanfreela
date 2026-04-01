'use client'

import { Elements } from '@stripe/react-stripe-js'
import { StripeElementsOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentForm } from './PaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaywallPaymentViewProps {
  clientSecret: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaywallPaymentView({ clientSecret, onSuccess, onCancel }: PaywallPaymentViewProps) {
  const options: StripeElementsOptions = { clientSecret }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dados do pagamento</h2>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </>
  )
}
