'use client'

import { PRO_PLAN_CONFIG } from '@/lib/config/plans'

interface PaywallOfferViewProps {
  isLoading: boolean
  onUpgrade: () => void
  onDismiss: () => void
}

export function PaywallOfferView({ isLoading, onUpgrade, onDismiss }: PaywallOfferViewProps) {
  const includedFeatures = PRO_PLAN_CONFIG.features.filter(feature => feature.included)

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Limite do plano gratuito atingido
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Você salvou 10 leads. Faça upgrade e salve leads ilimitados,
        organize seu pipeline e feche mais contratos.
      </p>
      <div className="bg-indigo-50 rounded-lg p-4 mb-6">
        <p className="text-2xl font-bold text-indigo-700">
          {PRO_PLAN_CONFIG.price}
          <span className="text-base font-normal">{PRO_PLAN_CONFIG.period}</span>
        </p>
        <ul className="mt-2 text-sm text-indigo-800 space-y-1">
          {includedFeatures.map(feature => (
            <li key={feature.label} className="flex items-center gap-2">
              <span aria-hidden="true">✓</span>
              {feature.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onUpgrade}
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Carregando...' : PRO_PLAN_CONFIG.cta}
        </button>
        <button
          onClick={onDismiss}
          disabled={isLoading}
          className="py-2 px-4 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
        >
          Agora não
        </button>
      </div>
    </>
  )
}
