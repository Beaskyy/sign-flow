'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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

interface UseTextToSignWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
}

export function useTextToSignWebSocket(
  websocketUrl: string | null,
  options: UseTextToSignWebSocketOptions = {}
) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!websocketUrl) {
      console.warn('⚠️ Cannot connect: missing WebSocket URL')
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected')
      return
    }

    try {
      console.log('🔌 Connecting to WebSocket:', websocketUrl)
      const ws = new WebSocket(websocketUrl)

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        options.onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', message)
          setLastMessage(message)
          options.onMessage?.(message)
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err)
          console.error('Raw message:', event.data)
        }
      }

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event)
        setError('WebSocket connection error')
        options.onError?.(event)
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        setIsConnected(false)
        options.onClose?.()

        // Only attempt to reconnect if it wasn't a clean close
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached')
          setError('Max reconnection attempts reached')
        }
      }

      wsRef.current = ws
    } catch (err) {
      console.error('❌ Failed to create WebSocket:', err)
      setError('Failed to establish WebSocket connection')
    }
  }, [websocketUrl, options])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...')
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectAttemptsRef.current = maxReconnectAttempts // Prevent auto-reconnect
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect') // 1000 = normal closure
      wsRef.current = null
    }
    setIsConnected(false)
    setLastMessage(null)
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending WebSocket message:', message)
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ WebSocket is not connected, cannot send message')
      setError('WebSocket is not connected')
    }
  }, [])

  useEffect(() => {
    if (websocketUrl) {
      console.log('🎯 WebSocket URL changed, connecting...')
      connect()
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      disconnect()
    }
  }, [websocketUrl, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
  }
}