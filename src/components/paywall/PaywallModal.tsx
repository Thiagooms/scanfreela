'use client'

import { useState } from 'react'
import { PaywallOfferView } from './PaywallOfferView'
import { PaywallPaymentView } from './PaywallPaymentView'

type ModalStep = 'offer' | 'payment'

interface PaywallModalProps {
  isOpen: boolean
  payerEmail: string
  onClose: () => void
}

export function PaywallModal({ isOpen, payerEmail, onClose }: PaywallModalProps) {
  const [step, setStep] = useState<ModalStep>('offer')

  if (!isOpen) return null

  function handleClose() {
    setStep('offer')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {step === 'offer' && (
          <PaywallOfferView
            isLoading={false}
            onUpgrade={() => setStep('payment')}
            onDismiss={handleClose}
          />
        )}
        {step === 'payment' && (
          <PaywallPaymentView
            payerEmail={payerEmail}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        )}
      </div>
    </div>
  )
}
