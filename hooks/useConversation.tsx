'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Message {
  id: string;
  sender?: string;
  conversation_id?: string;
  message_type?: string;
  status?: string;
  input_preview?: string;
  output_preview?: string;
  text_content?: string;
  sign_descriptions?: string; // Now GZIP-Base64 compressed string
  created_at: string;
  completed_at?: string;
  message_type_display?: string;
  status_display?: string;
}

interface Conversation {
  id: string;
  title?: string;
  messages_count?: number;
  message_count?: number; // Keep for backward compat
  created_at: string;
  updated_at: string;
  messages?: Message[];
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
      
      // apiClient now auto-unwraps { success, data } — response is the data array directly
      const response = await apiClient<any>(url, token)
      
      // Handle both array response and paginated object response
      const conversations = Array.isArray(response) ? response : (response.results || response)
      
      return {
        conversations,
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
    refetchOnWindowFocus: true,
  })
}