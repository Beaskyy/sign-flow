'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Frame {
  id: string
  frame_number: number
  timestamp: number
  image_url: string
  // Add other frame fields
}

export function useVideoFrames(videoId: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['videos', videoId, 'frames'],
    queryFn: () => apiClient<Frame[]>(`/videos/${videoId}/frames/`, token),
    enabled: !!token && !!videoId,
  })
}