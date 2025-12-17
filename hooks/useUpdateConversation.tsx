'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface UpdateConversationData {
  id: string
  title?: string
}

export function useUpdateConversation() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateConversationData) => {
      return apiClient(
        `/conversations/${id}`,
        token,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}