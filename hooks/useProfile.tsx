'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Profile {
  id: string
  email: string
  name: string
  // Add other profile fields based on your API response
}

export function useProfile() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient<Profile>('/auth/profile', token),
    enabled: !!token,
  })
}