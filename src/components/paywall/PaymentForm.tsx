'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface PaymentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard?upgraded=true` },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? 'Erro ao processar pagamento.')
      setIsProcessing(false)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />

      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processando...' : 'Assinar por R$50/mês'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="py-2 px-4 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
