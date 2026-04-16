'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface Message {
  id: string;
  conversation_id: string;
  message_type: string;
  status: string;
  input_preview: string;
  output_preview: string;
  created_at: string;
  completed_at: string;
  message_type_display: string;
  status_display: string;
}

interface Conversation {
  id: string;
  title?: string;
  messages_count: number; // Updated name
  created_at: string;
  updated_at: string;
  messages: Message[];
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
      
      // Since apiClient auto-unwraps 'data', response is now either the array
      // or an object containing results if paginated.
      // Adjusting to handle both cases based on typical DJRF pagination vs flat list.
      const conversations = Array.isArray(response) ? response : (response.results || response.conversations || []);
      const nextCursor = response.next_cursor || response.nextCursor || null;

      return {
        conversations: conversations,
        nextCursor: nextCursor,
        hasMore: !!nextCursor
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