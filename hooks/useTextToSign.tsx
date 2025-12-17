'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'
import { useTextToSignWebSocket } from './useTextToSignWebSocket'

interface TextToSignRequest {
  text: string
}

interface TextToSignResponse {
  translation?: string
  video_url?: string
  signs?: Array<{
    word: string
    sign_url: string
  }>
  status?: 'processing' | 'completed' | 'error'
  progress?: number
}

export function useTextToSignWithWebSocket(userId: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const [wsResponse, setWsResponse] = useState<TextToSignResponse | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // WebSocket connection for receiving real-time updates
  const {
    isConnected,
    lastMessage,
    error: wsError,
    sendMessage,
  } = useTextToSignWebSocket(userId, {
    onMessage: (message) => {
      setWsResponse(message)
      if (message.status === 'completed' || message.status === 'error') {
        setIsProcessing(false)
      }
    },
    autoConnect: true,
  })

  // HTTP mutation for initiating translation
  const mutation = useMutation({
    mutationFn: async (data: TextToSignRequest) => {
      setIsProcessing(true)
      setWsResponse(null)
      
      return apiClient<TextToSignResponse>(
        '/api/translations/text-to-sign/',
        token,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },
    onError: () => {
      setIsProcessing(false)
    },
  })

  return {
    // HTTP mutation
    translate: mutation.mutateAsync,
    isTranslating: mutation.isPending,
    httpError: mutation.error,
    httpData: mutation.data,
    
    // WebSocket state
    isConnected,
    wsResponse: lastMessage || wsResponse,
    wsError,
    isProcessing,
    
    // WebSocket methods
    sendMessage,
  }
}