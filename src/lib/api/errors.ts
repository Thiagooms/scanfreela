export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    const message = text ? JSON.parse(text)?.error ?? text : `HTTP ${response.status}`
    throw new ApiError(message, response.status)
  }
  return response.json()
}
