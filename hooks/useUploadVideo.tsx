'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface UploadVideoRequest {
  video: File
  gloss: string
  region: string
}

interface UploadVideoResponse {
  video_id: string
}

export function useUploadVideo() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UploadVideoRequest) => {
      const formData = new FormData()
      formData.append('video', data.video)
      formData.append('gloss', data.gloss)
      formData.append('region', data.region)

      return apiClient<UploadVideoResponse>(
        '/translation/admin/upload-sign-video/',
        token,
        {
          method: 'POST',
          body: formData,
        }
      )
    },
    onSuccess: () => {
      // Invalidate library videos list
      queryClient.invalidateQueries({ queryKey: ['library-videos'] })
    },
  })
}