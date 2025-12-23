"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTextToSign } from "./useTextToSign";
import { useTextToSignWebSocket } from "./useTextToSignWebSocket";
import { useSession } from "next-auth/react";

export function useTextToSignWithWebSocket() {
  const { data: session } = useSession();
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();
  const textToSign = useTextToSign();

  const {
    isConnected,
    lastMessage,
    error: wsError,
  } = useTextToSignWebSocket(websocketUrl, {
    onMessage: (message: any) => {
      console.log("📨 [WebSocket] Message received:", message);

      if (activeMessageId && activeConversationId) {
        // Update the specific message in the cache
        queryClient.setQueryData(
          ["conversations", activeConversationId],
          (oldData: any) => {
            if (!oldData) {
              console.warn(
                "⚠️ No cached data found for conversation:",
                activeConversationId
              );
              return oldData;
            }

            console.log("🔄 Updating message in cache:", activeMessageId);

            return {
              ...oldData,
              messages: oldData.messages.map((msg: any) =>
                msg.id === activeMessageId
                  ? {
                      ...msg,
                      status: message.status,
                      output_preview:
                        message.message ||
                        message.translation ||
                        msg.output_preview,
                    }
                  : msg
              ),
            };
          }
        );
      }

      // If finished, clean up and refresh
      if (message.status === "completed" || message.status === "error") {
        console.log("✅ Translation finished with status:", message.status);

        // Close WebSocket
        setWebsocketUrl(null);
        setActiveMessageId(null);

        // Refresh conversation data from server
        if (activeConversationId) {
          console.log(
            "🔄 Invalidating conversation cache:",
            activeConversationId
          );
          queryClient.invalidateQueries({
            queryKey: ["conversations", activeConversationId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

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
      console.log(
        `🔌 [WebSocket] URL set, will attempt to connect: ${websocketUrl}`
      );
    } else {
      console.log("🔌 [WebSocket] URL cleared, connection will close");
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

  const translate = useCallback(
    async (data: { text: string; conversation_id?: string }) => {
      try {
        const response = await textToSign.mutateAsync(data);
        setActiveMessageId(response.conversation_message_id);
        setActiveConversationId(response.conversation_id);

        if (response.websocket) {
          let wsUrl = response.websocket;

          // 1. Handle production replacement
          if (wsUrl.includes("localhost")) {
            wsUrl = wsUrl.replace(
              "ws://localhost:8000",
              "wss://signai-backend-kt7u.onrender.com"
            );
          }

          // 2. Ensure absolute URL if it's just a path
          if (wsUrl.startsWith("/")) {
            wsUrl = `wss://signai-backend-kt7u.onrender.com${wsUrl}`;
          }

          // 3. SECURE THE TRAILING SLASH (Backend often requires this)
          // This changes ".../conversation?token" to ".../conversation/?token"
          const urlObj = new URL(wsUrl);
          if (!urlObj.pathname.endsWith("/")) {
            urlObj.pathname += "/";
          }

          // 4. Add the Token
          const token = session?.accessToken;
          if (token) {
            urlObj.searchParams.set("token", token as string);
          }

          const finalUrl = urlObj.toString();
          console.log("✅ Final WebSocket URL:", finalUrl);
          setWebsocketUrl(finalUrl);
        }

        return response;
      } catch (error) {
        console.error("❌ [API] Translation request failed:", error);
        throw error;
      }
    },
    [textToSign, session]
  );

  return {
    translate,
    // Loading is true if the API is hitting OR if we have an active WS connection
    isTranslating: textToSign.isPending || websocketUrl !== null,
    isConnected,
    wsError,
    lastMessage,
    // Add this to help the UI show status
    status: lastMessage?.status || (textToSign.isPending ? "sending" : null),
  };
}
