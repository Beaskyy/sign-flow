'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface UploadVideoRequest {
  video_file: File
  title: string
}

interface UploadVideoResponse {
  id: string
  title: string
  video_url: string
  status: string
  created_at: string
  // Add other response fields
}

export function useUploadVideo() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UploadVideoRequest) => {
      const formData = new FormData()
      formData.append('video_file', data.video_file)
      formData.append('title', data.title)

      return apiClient<UploadVideoResponse>(
        '/videos/',
        token,
        {
          method: 'POST',
          body: formData,
        }
      )
    },
    onSuccess: () => {
      // Invalidate videos list if you have one
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}