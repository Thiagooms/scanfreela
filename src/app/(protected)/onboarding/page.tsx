'use client'

import { useState } from 'react'

const SERVICE_OPTIONS = [
  'Fotografia',
  'Marketing Digital',
  'Design Gráfico',
  'Desenvolvimento Web',
  'Social Media',
  'Consultoria',
  'Contabilidade',
]

type Step = 'service' | 'city'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState('')
  const [customService, setCustomService] = useState('')
  const [city, setCity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const selectedService = service === 'outro' ? customService : service
  const canAdvance = selectedService.trim().length > 0
  const canSubmit = canAdvance && city.trim().length > 0

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/profile/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService.trim(), city: city.trim() }),
      })

      if (!response.ok) {
        setSubmitError('Algo deu errado. Tente novamente.')
        setIsSubmitting(false)
        return
      }

      sessionStorage.setItem('spotlead:firstSearch', 'true')
      window.location.href = '/dashboard'
    } catch {
      setSubmitError('Erro de conexão. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {step === 'service' ? (
          <>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Qual serviço você oferece?</h1>
            <p className="text-sm text-gray-400 mb-6">Vamos encontrar os melhores leads para você.</p>

            <div className="flex flex-col gap-2 mb-6">
              {SERVICE_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => setService(option)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    service === option
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
              <button
                onClick={() => setService('outro')}
                className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                  service === 'outro'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Outro
              </button>
              {service === 'outro' && (
                <input
                  type="text"
                  placeholder="Ex: Arquitetura, Coaching..."
                  value={customService}
                  onChange={e => setCustomService(e.target.value)}
                  autoFocus
                  maxLength={100}
                  className="mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              )}
            </div>

            <button
              onClick={() => setStep('city')}
              disabled={!canAdvance}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('service')}
              className="text-xs text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </button>

            <h1 className="text-xl font-semibold text-gray-900 mb-1">Em qual cidade você prospecta?</h1>
            <p className="text-sm text-gray-400 mb-6">Vamos buscar oportunidades na sua região.</p>

            <input
              type="text"
              placeholder="Ex: São Paulo, Recife, Curitiba..."
              value={city}
              onChange={e => setCity(e.target.value)}
              autoFocus
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-6"
            />

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? 'Carregando...' : 'Ver meus leads'}
            </button>
            {submitError && (
              <p className="text-xs text-red-500 text-center mt-3">{submitError}</p>
            )}
          </>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">
          Você pode alterar isso depois nas configurações.
        </p>
      </div>
    </main>
  )
}
