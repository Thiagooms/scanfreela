import { PlacesSearchParams } from '@/lib/types/places'
import { ValidationError } from '@/lib/http/errors'
import {
  ensureObject,
  readOptionalNumber,
  readRequiredString,
} from '@/lib/validation/base'

export function parseSearchParams(input: unknown): PlacesSearchParams {
  const body = ensureObject(input)

  const query = readRequiredString(body.query, {
    field: 'query',
    minLength: 1,
    maxLength: 100,
  })

  const city = readRequiredString(body.city, {
    field: 'city',
    minLength: 1,
    maxLength: 100,
  })

  const minRating = readOptionalNumber(body.minRating, {
    field: 'minRating',
    min: 0,
    max: 5,
  })

  const maxRating = readOptionalNumber(body.maxRating, {
    field: 'maxRating',
    min: 0,
    max: 5,
  })

  if (minRating !== undefined && maxRating !== undefined && minRating > maxRating) {
    throw new ValidationError('minRating nao pode ser maior que maxRating')
  }

  return {
    query,
    city,
    ...(minRating !== undefined && { minRating }),
    ...(maxRating !== undefined && { maxRating }),
  }
}
