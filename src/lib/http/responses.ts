import { NextResponse } from 'next/server'
import { AppError, isAppError } from '@/lib/http/errors'

export function errorResponse(error: AppError): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.status }
  )
}

export function handleRouteError(
  error: unknown,
  logContext: string
): NextResponse {
  if (isAppError(error)) {
    return errorResponse(error)
  }

  console.error(logContext, error)
  return errorResponse(
    new AppError(
      'Erro interno do servidor',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  )
}
