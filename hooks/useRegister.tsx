'use client'

import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface RegisterPayload {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
}

interface RegisterResponse {
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
  is_new_user: boolean
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      return apiClient<RegisterResponse>(
        '/auth/register/',
        null, // No token needed for registration
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data)
    },
    onError: (error: Error) => {
      console.error('Registration failed:', error.message)
    }
  })
}
