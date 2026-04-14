'use client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Standardized API error response from backend
 */
interface ApiErrorResponse {
  success: false
  message: string
  error?: string | Record<string, unknown>
  error_code?: number
}

/**
 * Standardized API success response wrapper from backend
 */
interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
}

export async function apiClient<T>(
  endpoint: string,
  token?: string | null,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let errorData: ApiErrorResponse | undefined;
    try {
      errorData = await res.json();
    } catch {
      // Ignore if parsing fails
    }
    
    // Extract error message from the new standardized error format
    const errorMessage = errorData?.message || errorData?.error || `API Error: ${res.status} ${res.statusText}`;
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }

  const json = await res.json()

  // Auto-unwrap the new { success, data } response wrapper
  // If the response has { success: true, data: ... }, return just the `data` field
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T
  }

  // Fallback: return raw response for any non-wrapped endpoints
  return json as T
}