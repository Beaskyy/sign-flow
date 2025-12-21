'use client'

import { useState, useCallback } from 'react'
import { useTextToSign } from './useTextToSignWtihWebSocket'
import { useTextToSignWebSocket } from './useTextToSign'

interface TextToSignRequest {
  text: string
  conversation_id?: string
}

interface WebSocketMessage {
  type?: string
  status?: 'processing' | 'completed' | 'error'
  translation?: string
  video_url?: string
  signs?: Array<{
    word: string
    sign_url: string
    video_url?: string
  }>
  progress?: number
  message?: string
  error?: string
}

export function useTextToSignWithWebSocket() {
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null)
  const [translationData, setTranslationData] = useState<any>(null)
  const textToSign = useTextToSign()

  // WebSocket connection - only connects when we have a URL
  const {
    isConnected,
    lastMessage,
    error: wsError,
  } = useTextToSignWebSocket(websocketUrl, {
    onMessage: (message) => {
      console.log('📨 Translation update:', message)
      // Update translation data with WebSocket response
      setTranslationData((prev: any) => ({
        ...prev,
        ...message,
      }))
    },
  })

  const translate = useCallback(async (data: TextToSignRequest) => {
    try {
      // Call the API
      const response = await textToSign.mutateAsync(data)
      
      console.log('✅ Translation initiated:', response)
      
      // Store the initial response
      setTranslationData(response)
      
      // Connect to WebSocket using the URL from response
      if (response.websocket) {
        // Append user ID or conversation ID to websocket URL if needed
        const wsUrl = response.websocket.replace('ws://localhost:8000', 'wss://signai-backend-kt7u.onrender.com')
        setWebsocketUrl(`${wsUrl}${response.conversation_id}`)
      }
      
      return response
    } catch (error) {
      console.error('❌ Translation failed:', error)
      throw error
    }
  }, [textToSign])

  return {
    translate,
    isTranslating: textToSign.isPending,
    httpError: textToSign.error,
    initialData: textToSign.data,
    
    // WebSocket state
    isConnected,
    wsMessage: lastMessage,
    wsError,
    
    // Combined translation data (initial + WebSocket updates)
    translationData,
  }
}