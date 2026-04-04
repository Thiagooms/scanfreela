export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, 400, code)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autenticacao necessaria', code = 'UNAUTHORIZED') {
    super(message, 401, code)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code = 'FORBIDDEN') {
    super(message, 403, code)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, 404, code)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(message, 409, code)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, code = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code)
    this.name = 'RateLimitError'
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, code = 'CONFIGURATION_ERROR') {
    super(message, 503, code)
    this.name = 'ConfigurationError'
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
