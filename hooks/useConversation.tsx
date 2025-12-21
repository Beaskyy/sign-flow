'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Conversation {
  id: string
  title?: string
  created_at: string
  updated_at: string
  // Add other conversation fields
}

interface ConversationsResponse {
  conversations: Conversation[]
  nextCursor?: string
  hasMore: boolean
}

export function useConversations() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam = null }) => {
      let url = '/conversations/'
      if (pageParam) {
        url += `?cursor=${pageParam}`
      }
      
      const response = await apiClient<any>(url, token)
      
      // Transform based on your API response structure
      // Assuming your API returns conversations array and pagination info
      return {
        conversations: response.data || response,
        nextCursor: response.next_cursor || response.nextCursor,
        hasMore: !!response.next_cursor || !!response.nextCursor
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!token,
    initialPageParam: null,
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