'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Conversation {
  id: string
  title?: string
  created_at: string
  updated_at: string
  // Add other conversation fields
}

export function useConversations() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient<Conversation[]>('/conversations/', token),
    enabled: !!token,
  })
}

export function useConversation(conversationId: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => apiClient<Conversation>(`/conversations/${conversationId}/`, token),
    enabled: !!token && !!conversationId,
  })
}