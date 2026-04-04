import {
  LEAD_STATUSES,
  LeadCreateInput,
  LeadUpdateInput,
} from '@/lib/types/lead'
import { ValidationError } from '@/lib/http/errors'
import {
  ensureObject,
  readOptionalEnum,
  readOptionalIsoDate,
  readOptionalNullableString,
  readRequiredString,
} from '@/lib/validation/base'

const MAX_NOTES_LENGTH = 2000

export function parseLeadCreateInput(input: unknown): LeadCreateInput {
  const body = ensureObject(input)

  return {
    placeId: readRequiredString(body.placeId, {
      field: 'placeId',
      minLength: 1,
      maxLength: 255,
    }),
  }
}

export function parseLeadUpdateInput(input: unknown): LeadUpdateInput {
  const body = ensureObject(input)

  const status = readOptionalEnum(body.status, LEAD_STATUSES, 'status')
  const notes = readOptionalNullableString(body.notes, {
    field: 'notes',
    maxLength: MAX_NOTES_LENGTH,
    allowEmptyAsNull: true,
  })
  const lastContact = readOptionalIsoDate(body.lastContact, 'lastContact')

  if (status === undefined && notes === undefined && lastContact === undefined) {
    throw new ValidationError('Nenhum campo valido foi enviado para atualizacao')
  }

  return {
    ...(status !== undefined && { status }),
    ...(notes !== undefined && { notes }),
    ...(lastContact !== undefined && { lastContact }),
  }
}
