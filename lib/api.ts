'use client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

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
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      // Ignore if parsing fails
    }
    
    // Extract error message from 'error' or 'message' fields, otherwise fallback to default
    const errorMessage = errorData?.error || errorData?.message || `API Error: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return res.json()
}