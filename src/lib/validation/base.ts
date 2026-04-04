import { ValidationError } from '@/lib/http/errors'

interface StringOptions {
  field: string
  maxLength?: number
  minLength?: number
}

interface NullableStringOptions extends StringOptions {
  allowEmptyAsNull?: boolean
}

interface NumberOptions {
  field: string
  min?: number
  max?: number
  integer?: boolean
}

export function ensureObject(value: unknown, message = 'Payload invalido'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(message)
  }

  return value as Record<string, unknown>
}

export function readRequiredString(value: unknown, options: StringOptions): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${options.field} deve ser uma string`)
  }

  const normalized = value.trim()
  if (!normalized) {
    throw new ValidationError(`${options.field} e obrigatorio`)
  }

  if (options.minLength !== undefined && normalized.length < options.minLength) {
    throw new ValidationError(`${options.field} deve ter no minimo ${options.minLength} caracteres`)
  }

  if (options.maxLength !== undefined && normalized.length > options.maxLength) {
    throw new ValidationError(`${options.field} deve ter no maximo ${options.maxLength} caracteres`)
  }

  return normalized
}

export function readOptionalString(
  value: unknown,
  options: NullableStringOptions
): string | undefined {
  if (value === undefined) return undefined
  if (value === null) {
    throw new ValidationError(`${options.field} nao pode ser nulo`)
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${options.field} deve ser uma string`)
  }

  const normalized = value.trim()
  if (!normalized) {
    if (options.allowEmptyAsNull) return undefined
    throw new ValidationError(`${options.field} nao pode ser vazio`)
  }

  if (options.minLength !== undefined && normalized.length < options.minLength) {
    throw new ValidationError(`${options.field} deve ter no minimo ${options.minLength} caracteres`)
  }

  if (options.maxLength !== undefined && normalized.length > options.maxLength) {
    throw new ValidationError(`${options.field} deve ter no maximo ${options.maxLength} caracteres`)
  }

  return normalized
}

export function readOptionalNullableString(
  value: unknown,
  options: NullableStringOptions
): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new ValidationError(`${options.field} deve ser uma string`)
  }

  const normalized = value.trim()
  if (!normalized) {
    return options.allowEmptyAsNull ? null : undefined
  }

  if (options.minLength !== undefined && normalized.length < options.minLength) {
    throw new ValidationError(`${options.field} deve ter no minimo ${options.minLength} caracteres`)
  }

  if (options.maxLength !== undefined && normalized.length > options.maxLength) {
    throw new ValidationError(`${options.field} deve ter no maximo ${options.maxLength} caracteres`)
  }

  return normalized
}

export function readOptionalNumber(
  value: unknown,
  options: NumberOptions
): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new ValidationError(`${options.field} deve ser um numero valido`)
  }

  if (options.integer && !Number.isInteger(value)) {
    throw new ValidationError(`${options.field} deve ser um numero inteiro`)
  }

  if (options.min !== undefined && value < options.min) {
    throw new ValidationError(`${options.field} deve ser maior ou igual a ${options.min}`)
  }

  if (options.max !== undefined && value > options.max) {
    throw new ValidationError(`${options.field} deve ser menor ou igual a ${options.max}`)
  }

  return value
}

export function readOptionalEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  field: string
): T | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} deve ser uma string`)
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(`${field} possui um valor invalido`)
  }

  return value as T
}

export function readOptionalIsoDate(value: unknown, field: string): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} deve ser uma string`)
  }

  const normalized = value.trim()
  if (!normalized) return null

  const timestamp = Date.parse(normalized)
  if (Number.isNaN(timestamp)) {
    throw new ValidationError(`${field} deve ser uma data valida`)
  }

  return new Date(timestamp).toISOString()
}

export function readRequiredIdentifier(value: unknown, field: string, maxLength = 255): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new ValidationError(`${field} e obrigatorio`)
  }

  const normalized = String(value).trim()
  if (!normalized) {
    throw new ValidationError(`${field} e obrigatorio`)
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`${field} deve ter no maximo ${maxLength} caracteres`)
  }

  return normalized
}
