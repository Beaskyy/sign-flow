'use client'

import { useMutation } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'

interface LoginPayload {
  email: string
  password: string
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error || 'Login failed')
      }

      return result
    },
    onSuccess: (data) => {
      console.log('Login successful:', data)
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message)
    }
  })
}
