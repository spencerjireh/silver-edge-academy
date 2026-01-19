import { getStoredAccessToken } from '@silveredge/shared'

export const API_BASE = '/api'

// ============================================================================
// Error Handling
// ============================================================================

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromResponse(status: number, body: unknown): ApiError {
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof (body as { error: unknown }).error === 'object'
    ) {
      const error = (body as { error: { code?: string; message?: string; details?: Record<string, unknown> } }).error
      return new ApiError(
        error.code || 'UNKNOWN_ERROR',
        error.message || 'An unknown error occurred',
        status,
        error.details
      )
    }
    return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred', status)
  }

  static network(message: string): ApiError {
    return new ApiError('NETWORK_ERROR', message, 0)
  }
}

// ============================================================================
// Auth Headers
// ============================================================================

export function getAuthHeaders(): HeadersInit {
  const token = getStoredAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ============================================================================
// API Client
// ============================================================================

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
  unwrapData?: boolean
}

async function parseResponse<T>(response: Response, unwrapData: boolean): Promise<T> {
  const contentType = response.headers.get('content-type')

  if (response.status === 204 || !contentType?.includes('application/json')) {
    return undefined as T
  }

  const json = await response.json()

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, json)
  }

  // Unwrap { data: T } wrapper if present and requested
  if (unwrapData && typeof json === 'object' && json !== null && 'data' in json) {
    return json.data as T
  }

  return json as T
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  if (!params) return url

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    params,
    skipAuth = false,
    unwrapData = true,
    headers: customHeaders,
    ...fetchOptions
  } = options

  const headers: HeadersInit = {
    ...(skipAuth ? {} : getAuthHeaders()),
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
  }

  const url = buildUrl(endpoint, params)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    return await parseResponse<T>(response, unwrapData)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw ApiError.network(error instanceof Error ? error.message : 'Network request failed')
  }
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const api = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'GET' })
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'POST', body })
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'PATCH', body })
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'PUT', body })
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'DELETE' })
  },
}
