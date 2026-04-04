import { ValidationError } from '@/lib/http/errors'

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new ValidationError(
      'Payload JSON invalido',
      'INVALID_JSON_BODY'
    )
  }
}
