'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
}

export function useProfile() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient<Profile>('/auth/profile/', token),
    enabled: !!token,
  })
}