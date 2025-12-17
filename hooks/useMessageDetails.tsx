'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface MessageDetails {
  id: string
  content: string
  sender: string
  timestamp: string
  conversation_id: string
  // Add other message detail fields
}

export function useMessageDetails(messageId: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['messages', messageId, 'details'],
    queryFn: () => apiClient<MessageDetails>(
      `/conversations/messages/${messageId}/details`,
      token
    ),
    enabled: !!token && !!messageId,
  })
}