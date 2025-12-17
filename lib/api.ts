const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiClient<T>(
  endpoint: string,
  token?: string | null,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers)

  // Add authorization token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Only add Content-Type if not FormData
  if (!(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/login'
    }
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}