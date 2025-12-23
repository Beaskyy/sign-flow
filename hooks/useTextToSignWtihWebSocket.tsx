'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTextToSign } from './useTextToSign'
import { useTextToSignWebSocket } from './useTextToSignWebSocket'

export function useTextToSignWithWebSocket() {
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const textToSign = useTextToSign()

  const { isConnected, lastMessage, error: wsError } = useTextToSignWebSocket(websocketUrl, {
    onMessage: (message: any) => {
      console.log('📨 [WebSocket] Message received:', message);
      
      if (activeMessageId && activeConversationId) {
        // Update the specific message in the cache
        queryClient.setQueryData(['conversations', activeConversationId], (oldData: any) => {
          if (!oldData) {
            console.warn('⚠️ No cached data found for conversation:', activeConversationId);
            return oldData;
          }
          
          console.log('🔄 Updating message in cache:', activeMessageId);
          
          return {
            ...oldData,
            messages: oldData.messages.map((msg: any) => 
              msg.id === activeMessageId 
                ? { 
                    ...msg, 
                    status: message.status, 
                    output_preview: message.message || message.translation || msg.output_preview 
                  }
                : msg
            )
          };
        });
      }

      // If finished, clean up and refresh
      if (message.status === 'completed' || message.status === 'error') {
        console.log('✅ Translation finished with status:', message.status);
        
        // Close WebSocket
        setWebsocketUrl(null);
        setActiveMessageId(null);
        
        // Refresh conversation data from server
        if (activeConversationId) {
          console.log('🔄 Invalidating conversation cache:', activeConversationId);
          queryClient.invalidateQueries({ queryKey: ['conversations', activeConversationId] });
        }
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        // Reset after a brief delay to ensure state is clean
        setTimeout(() => {
          setActiveConversationId(null);
        }, 100);
      }
    },
  });

  // Track connection status changes
  useEffect(() => {
    if (websocketUrl) {
      console.log(`🔌 [WebSocket] URL set, will attempt to connect: ${websocketUrl}`);
    } else {
      console.log('🔌 [WebSocket] URL cleared, connection will close');
    }
  }, [websocketUrl]);

  useEffect(() => {
    if (isConnected) {
      console.log("🟢 [WebSocket] Connected Successfully");
    } else if (websocketUrl && !isConnected) {
      console.log("🟡 [WebSocket] Connection pending or lost...");
    }
  }, [isConnected, websocketUrl]);

  useEffect(() => {
    if (wsError) {
      console.error("🔴 [WebSocket] Error:", wsError);
    }
  }, [wsError]);

  const translate = useCallback(async (data: { text: string; conversation_id?: string }) => {
    try {
      console.log('🚀 [API] Sending translation request:', data);
      const response = await textToSign.mutateAsync(data);
      
      console.log('📊 [API] Translation response received:', response);
      
      // Store which message and conversation we are tracking
      setActiveMessageId(response.conversation_message_id);
      setActiveConversationId(response.conversation_id);
      
      console.log('📌 Tracking:', {
        messageId: response.conversation_message_id,
        conversationId: response.conversation_id
      });

      if (response.websocket) {
        // Build the WebSocket URL
        let wsUrl = response.websocket;
        
        console.log('🔗 Original WebSocket URL:', wsUrl);
        
        // Replace localhost with production URL if needed
        if (wsUrl.includes('localhost')) {
          wsUrl = wsUrl.replace('ws://localhost:8000', 'wss://signai-backend-kt7u.onrender.com');
          console.log('🔄 Replaced localhost with production URL');
        }
        
        // Ensure it has the correct protocol
        if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
          wsUrl = `wss://signai-backend-kt7u.onrender.com${wsUrl}`;
          console.log('🔄 Added wss:// protocol');
        }
        
        // Ensure it's using secure WebSocket in production
        if (wsUrl.startsWith('ws://') && !wsUrl.includes('localhost')) {
          wsUrl = wsUrl.replace('ws://', 'wss://');
          console.log('🔄 Changed to secure WebSocket (wss://)');
        }
        
        console.log('✅ Final WebSocket URL:', wsUrl);
        setWebsocketUrl(wsUrl);
      } else {
        console.warn('⚠️ No websocket URL in API response');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [API] Translation request failed:', error);
      throw error;
    }
  }, [textToSign]);

  return {
    translate,
    isTranslating: textToSign.isPending,
    isConnected,
    wsError,
    lastMessage,
  }
}
