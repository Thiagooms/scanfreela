'use client'

import { useState } from 'react'
import { stripeApiClient } from '@/lib/api/stripe.client'
import { PaywallOfferView } from './PaywallOfferView'
import { PaywallPaymentView } from './PaywallPaymentView'

type ModalStep = 'offer' | 'payment'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [step, setStep] = useState<ModalStep>('offer')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  async function handleUpgrade() {
    setIsLoading(true)
    const { clientSecret } = await stripeApiClient.createSubscriptionIntent()
    setClientSecret(clientSecret)
    setStep('payment')
    setIsLoading(false)
  }

  function handleClose() {
    setStep('offer')
    setClientSecret(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {step === 'offer' && (
          <PaywallOfferView
            isLoading={isLoading}
            onUpgrade={handleUpgrade}
            onDismiss={handleClose}
          />
        )}
        {step === 'payment' && clientSecret && (
          <PaywallPaymentView
            clientSecret={clientSecret}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        )}
      </div>
    </div>
  )
}
