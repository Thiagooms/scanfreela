export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string = 'HTTP_ERROR'
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    let message = `HTTP ${response.status}`
    let code = 'HTTP_ERROR'

    if (text) {
      try {
        const parsed = JSON.parse(text)
        if (parsed?.error?.message) {
          message = parsed.error.message
          code = parsed.error.code ?? code
        } else {
          message = parsed?.error ?? text
        }
      } catch {
        message = text
      }
    }

    throw new ApiError(message, response.status, code)
  }

  return response.json()
}
