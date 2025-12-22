'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTextToSign } from './useTextToSignWtihWebSocket'
import { useTextToSignWebSocket } from './useTextToSign'

export function useTextToSignWithWebSocket() {
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const textToSign = useTextToSign()

  const { isConnected, lastMessage, error: wsError } = useTextToSignWebSocket(websocketUrl, {
    onMessage: (message: any) => {
      // 1. Update the React Query Cache so the ConversationPage UI updates immediately
      console.log('📨 [WebSocket] Message received:', message);
      if (activeMessageId) {
        queryClient.setQueryData(['conversations', message.conversation_id], (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            messages: oldData.messages.map((msg: any) => 
              // Match the specific message being translated
              msg.id === activeMessageId 
                ? { ...msg, status: message.status, output_preview: message.message || msg.output_preview }
                : msg
            )
          };
        });
      }

      // 2. If finished, clear the URL to close the socket
      if (message.status === 'completed' || message.status === 'error') {
        setWebsocketUrl(null);
        setActiveMessageId(null);
        // Refresh the whole conversation to ensure all data is synced with DB
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });


  // Track connection status changes
  useEffect(() => {
    if (websocketUrl) {
      console.log(`🔌 [WebSocket] Attempting to connect to: ${websocketUrl}`);
    }
  }, [websocketUrl]);

  useEffect(() => {
    if (isConnected) {
      console.log("🟢 [WebSocket] Connected Successfully");
    } else if (websocketUrl && !isConnected) {
      console.log("🟡 [WebSocket] Connection pending or lost...");
    }
  }, [isConnected, websocketUrl]);

  if (wsError) {
    console.error("🔴 [WebSocket] Critical Error:", wsError);
  }


  const translate = useCallback(async (data: { text: string; conversation_id?: string }) => {
    try {
      const response = await textToSign.mutateAsync(data);
      
      // Store which message we are currently tracking
      setActiveMessageId(response.conversation_message_id);

      if (response.websocket) {
        // Clean the URL (Better to do this in a utility file)
        const wsUrl = response.websocket.startsWith('/') 
          ? `${process.env.NEXT_PUBLIC_WS_URL}${response.websocket}`
          : response.websocket.replace('ws://localhost:8000', 'wss://signai-backend-kt7u.onrender.com');
        
        setWebsocketUrl(wsUrl);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Translation failed:', error);
      throw error;
    }
  }, [textToSign]);

  return {
    translate,
    isTranslating: textToSign.isPending || (websocketUrl !== null),
    isConnected,
    wsError,
  }
}