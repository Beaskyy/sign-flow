'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

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
  const optionsRef = useRef(options)

  // Keep options ref up to date without causing re-renders
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...')
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }
    reconnectAttemptsRef.current = maxReconnectAttempts // Prevent auto-reconnect
    
    if (wsRef.current) {
      // Remove event handlers to prevent reconnection attempts
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onopen = null
      wsRef.current.onmessage = null
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Client disconnect') // 1000 = normal closure
      }
      wsRef.current = null
    }
    setIsConnected(false)
    setLastMessage(null)
  }, [])

  const connect = useCallback(() => {
    if (!websocketUrl) {
      console.warn('⚠️ Cannot connect: missing WebSocket URL')
      return
    }

    // Clean up any existing connection first
    if (wsRef.current) {
      const currentState = wsRef.current.readyState
      if (currentState === WebSocket.OPEN) {
        console.log('✅ WebSocket already connected, closing old connection first')
        disconnect()
      } else if (currentState === WebSocket.CONNECTING) {
        console.log('⏳ WebSocket is connecting, closing first')
        disconnect()
      }
    }

    // Reset reconnection attempts for new URL
    reconnectAttemptsRef.current = 0
    setError(null)

    try {
      console.log('🔌 Connecting to WebSocket:', websocketUrl)
      const ws = new WebSocket(websocketUrl)

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        optionsRef.current.onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', message)
          setLastMessage(message)
          optionsRef.current.onMessage?.(message)
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err)
          console.error('Raw message:', event.data)
        }
      }

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event)
        setError('WebSocket connection error')
        optionsRef.current.onError?.(event)
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        setIsConnected(false)
        optionsRef.current.onClose?.()

        // Only attempt to reconnect if:
        // 1. It wasn't a clean close (code 1000)
        // 2. We haven't exceeded max attempts
        // 3. The URL hasn't changed (still matches current websocketUrl)
        if (
          !event.wasClean && 
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          wsRef.current === ws // Make sure this is still the current connection
        ) {
          reconnectAttemptsRef.current += 1
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            // Double-check URL hasn't changed before reconnecting
            if (wsRef.current === ws && websocketUrl) {
              connect()
            }
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
  }, [websocketUrl, disconnect])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending WebSocket message:', message)
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ WebSocket is not connected, cannot send message')
      setError('WebSocket is not connected')
    }
  }, [])

  // Main effect: connect when URL changes, cleanup on unmount or URL change
  useEffect(() => {
    if (websocketUrl) {
      console.log('🎯 WebSocket URL changed, connecting...')
      connect()
    } else {
      // If URL is cleared, disconnect
      disconnect()
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      disconnect()
    }
  }, [websocketUrl]) // Only depend on websocketUrl, not connect/disconnect

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
  }
}