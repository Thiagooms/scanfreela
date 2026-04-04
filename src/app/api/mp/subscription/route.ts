import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/supabase/auth'
import { makeMercadoPagoService } from '@/lib/factories/service.factory'
import { ValidationError } from '@/lib/http/errors'
import { readJsonBody } from '@/lib/http/request'
import { handleRouteError } from '@/lib/http/responses'
import { parseCreateSubscriptionInput } from '@/lib/validation/mercadopago'

const mpService = makeMercadoPagoService()

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      if (!user.email) {
        throw new ValidationError(
          'Usuario autenticado sem e-mail valido',
          'USER_EMAIL_REQUIRED'
        )
      }

      const body = parseCreateSubscriptionInput(await readJsonBody(request))
      const result = await mpService.createSubscription(user.id, user.email, body)
      return NextResponse.json(result)
    } catch (error) {
      return handleRouteError(error, 'MP subscription error:')
    }
  })
}
