'use client'

import { useEffect, useRef } from 'react'
import { initMercadoPago } from '@mercadopago/sdk-react'
import { mpApiClient } from '@/lib/api/mp.client'

interface MercadoPagoBrick {
  unmount: () => void
}

interface MercadoPagoInstance {
  bricks: () => {
    create: (
      type: string,
      containerId: string,
      config: object
    ) => Promise<MercadoPagoBrick>
  }
}

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options: object) => MercadoPagoInstance
  }
}

interface PaywallPaymentViewProps {
  payerEmail: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaywallPaymentView({ payerEmail, onSuccess, onCancel }: PaywallPaymentViewProps) {
  const brickRef = useRef<MercadoPagoBrick | null>(null)

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' })

    const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
      locale: 'pt-BR',
    })

    mp.bricks().create('cardPayment', 'mp-card-brick', {
      initialization: {
        amount: 50,
        payer: { email: payerEmail },
      },
      customization: {
        visual: { style: { theme: 'default' } },
        paymentMethods: { maxInstallments: 1 },
      },
      callbacks: {
        onReady: () => {},
        onError: (error: unknown) => console.error('MP Brick error:', error),
        onSubmit: async ({ formData }: { formData: { token: string } }) => {
          try {
            await mpApiClient.createSubscription({
              cardToken: formData.token,
              payerEmail,
            })
            onSuccess()
          } catch {
            console.error('Erro ao criar assinatura')
          }
        },
      },
    }).then((brick) => {
      brickRef.current = brick
    })

    return () => {
      brickRef.current?.unmount()
    }
  }, [payerEmail, onSuccess])

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dados do pagamento</h2>
      <div id="mp-card-brick" />
      <button
        onClick={onCancel}
        className="mt-4 w-full py-2 px-4 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
      >
        Cancelar
      </button>
    </>
  )
}
