'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LoginMode = 'password' | 'magic-link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<LoginMode>('password')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }
      router.push('/dashboard')
      return
    }

    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setMagicLinkSent(true)
    setIsLoading(false)
  }

  if (magicLinkSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
          <p className="text-sm text-gray-700">
            Link enviado para <strong>{email}</strong>.<br />
            Verifique sua caixa de entrada.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="mt-4 text-xs text-indigo-600 hover:underline"
          >
            Voltar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ScanFreela</h1>
        <p className="text-sm text-gray-500 mb-6">Encontre leads. Feche contratos.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {mode === 'password' && (
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Entrando...' : mode === 'password' ? 'Entrar' : 'Enviar magic link'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'password' ? 'magic-link' : 'password'); setError(null) }}
          className="mt-4 w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {mode === 'password' ? 'Entrar com magic link' : 'Entrar com senha'}
        </button>
      </div>
    </main>
  )
}
