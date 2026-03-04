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
    // Do NOT auto sign the user out here; just surface the error.
    // NextAuth's JWT callback + refresh logic will handle expired tokens.
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}