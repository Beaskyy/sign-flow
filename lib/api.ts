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

  let responseData: any;
  try {
    responseData = await res.json();
  } catch {
    // Ignore if parsing fails
  }

  if (!res.ok) {
    // Extract error message from new global error format: { success, message, error, error_code }
    const errorMessage = responseData?.message || responseData?.error || `API Error: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  // Auto-unwrap the new global wrapper { success: true, message: "...", data: { ... } }
  if (responseData && typeof responseData === 'object' && 'success' in responseData) {
    if (responseData.success === true) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || 'API request failed');
    }
  }

  return responseData;
}