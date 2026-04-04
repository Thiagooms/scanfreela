'use client'

import { useEffect, useRef, useState } from 'react'
import { PaywallOfferView } from './PaywallOfferView'
import { PaywallPaymentView } from './PaywallPaymentView'

type ModalStep = 'offer' | 'payment'

interface PaywallModalProps {
  isOpen: boolean
  payerEmail: string
  onClose: () => void
}

export function PaywallModal({ isOpen, payerEmail, onClose }: PaywallModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('offer')
  const modalContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      modalContainerRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleClose() {
    setCurrentStep('offer')
    onClose()
  }

  function handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) handleClose()
  }

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade para o plano Pro"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 focus:outline-none"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {currentStep === 'offer' && (
          <PaywallOfferView
            isLoading={false}
            onUpgrade={() => setCurrentStep('payment')}
            onDismiss={handleClose}
          />
        )}
        {currentStep === 'payment' && (
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
