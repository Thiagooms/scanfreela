import { ConfigurationError } from '@/lib/http/errors'

function normalizeAppUrl(rawUrl: string): string {
  return rawUrl.replace(/\/+$/, '')
}

function sanitizeRawUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  const withoutQuotes = trimmed.replace(/^["']|["']$/g, '')

  if (/^https?:\/\//i.test(withoutQuotes)) {
    return withoutQuotes
  }

  if (/^localhost(?::\d+)?(\/.*)?$/i.test(withoutQuotes)) {
    return `http://${withoutQuotes}`
  }

  return `https://${withoutQuotes}`
}

export function getAppUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!rawUrl) {
    throw new ConfigurationError(
      'NEXT_PUBLIC_APP_URL nao esta configurado',
      'APP_URL_MISSING'
    )
  }

  try {
    const url = new URL(sanitizeRawUrl(rawUrl))
    return normalizeAppUrl(url.toString())
  } catch {
    throw new ConfigurationError(
      'NEXT_PUBLIC_APP_URL possui um formato invalido',
      'APP_URL_INVALID'
    )
  }
}

export function buildAppUrl(pathname: string): string {
  return new URL(pathname, `${getAppUrl()}/`).toString()
}

export function buildAppUrlSafe(pathname: string, fallbackOrigin: string): string {
  try {
    return buildAppUrl(pathname)
  } catch {
    return new URL(pathname, `${fallbackOrigin}/`).toString()
  }
}
