import { ValidationError } from '@/lib/http/errors'
import {
  CreateSubscriptionInput,
  ParsedMercadoPagoWebhook,
} from '@/lib/types/mercadopago'
import {
  ensureObject,
  readRequiredIdentifier,
  readRequiredString,
} from '@/lib/validation/base'

export function parseCreateSubscriptionInput(input: unknown): CreateSubscriptionInput {
  const body = ensureObject(input)

  return {
    cardToken: readRequiredString(body.cardToken, {
      field: 'cardToken',
      minLength: 8,
      maxLength: 255,
    }),
  }
}

export function parseMercadoPagoWebhookPayload(rawBody: string): ParsedMercadoPagoWebhook {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawBody)
  } catch {
    throw new ValidationError('Payload do webhook invalido', 'INVALID_WEBHOOK_PAYLOAD')
  }

  const body = ensureObject(parsed, 'Payload do webhook invalido')
  const data = ensureObject(body.data, 'Payload do webhook invalido')

  const eventId = body.id === undefined
    ? undefined
    : readRequiredIdentifier(body.id, 'id')

  const action = body.action === undefined
    ? undefined
    : readRequiredString(body.action, {
        field: 'action',
        minLength: 1,
        maxLength: 255,
      })

  return {
    payload: body,
    webhook: {
      type: readRequiredString(body.type, {
        field: 'type',
        minLength: 1,
        maxLength: 255,
      }),
      dataId: readRequiredIdentifier(data.id, 'data.id'),
      ...(eventId && { eventId }),
      ...(action && { action }),
    },
  }
}
