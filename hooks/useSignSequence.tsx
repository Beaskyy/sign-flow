'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface SignSequence {
  id: string
  start_frame: number
  end_frame: number
  predicted_sign: string
  confidence: number
  // Add other sequence fields
}

export function useSignSequences(videoId: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['videos', videoId, 'sequences'],
    queryFn: () => apiClient<SignSequence[]>(`/videos/${videoId}/sequences/`, token),
    enabled: !!token && !!videoId,
  })
}