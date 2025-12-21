'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface CreateConversationData {
  title: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function useCreateConversation() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateConversationData) => {
      return apiClient<Conversation>(
        '/conversations/',
        token,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },
    onSuccess: (data) => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      
      // Optionally, add the new conversation to the cache immediately
      queryClient.setQueryData(['conversations', data.id], data)
    },
  })
}