"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTextToSign } from "./useTextToSign";
import { useTextToSignWebSocket } from "./useTextToSignWebSocket";
import { useSession } from "next-auth/react";
import type { TextToSignCompletedEvent } from "@/lib/text-to-sign-types";

export function useTextToSignWithWebSocket() {
  const { data: session } = useSession();
  const [websocketUrl, setWebsocketUrl] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();
  const textToSign = useTextToSign();

  // Use refs to access latest values in callbacks without recreating them
  const activeMessageIdRef = useRef(activeMessageId);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeMessageIdRef.current = activeMessageId;
  }, [activeMessageId]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Stabilize the options object using useMemo
  const wsOptions = useMemo(() => ({
    onMessage: (message: any) => {
      console.log("📨 [WebSocket] Message received:", message);

      const currentMessageId =
        activeMessageIdRef.current ||
        (message as TextToSignCompletedEvent).conversation_message_id;
      const currentConversationId =
        activeConversationIdRef.current ||
        (message as TextToSignCompletedEvent).conversation_id;

      // Handle text_to_sign_completed event (new LandmarkFrame format)
      const isCompletedEvent =
        message.type === "text_to_sign_completed" || message.status === "completed";

      if (currentMessageId && currentConversationId) {
        // Update the specific message in the cache
        const outputPreview =
          (message as TextToSignCompletedEvent).pose_count != null
            ? `Generated ${(message as TextToSignCompletedEvent).pose_count} pose(s)`
            : message.message || message.translation;

        queryClient.setQueryData(
          ["conversations", currentConversationId],
          (oldData: any) => {
            if (!oldData) {
              console.warn(
                "⚠️ No cached data found for conversation:",
                currentConversationId
              );
              return oldData;
            }

            console.log("🔄 Updating message in cache:", currentMessageId);

            return {
              ...oldData,
              messages: oldData.messages.map((msg: any) =>
                msg.id === currentMessageId
                  ? {
                      ...msg,
                      status: message.status ?? "completed",
                      output_preview: outputPreview || msg.output_preview,
                    }
                  : msg
              ),
            };
          }
        );

        // When we get text_to_sign_completed with motion_sequence, update message details cache
        // so the UI can show the animation without waiting for a refetch
        const motionSeq = (message as TextToSignCompletedEvent).motion_sequence;
        if (isCompletedEvent && motionSeq?.sequence?.length) {
          queryClient.setQueryData(
            ["messages", currentMessageId, "details"],
            (old: any) => ({
              ...(old ?? {}),
              message_id: currentMessageId,
              conversation_id: currentConversationId,
              status: "completed",
              motion_sequence: motionSeq,
              glosses: (message as TextToSignCompletedEvent).glosses ?? [],
              gloss_description: (message as TextToSignCompletedEvent).gloss_description ?? "",
              pose_count: (message as TextToSignCompletedEvent).pose_count ?? motionSeq.sequence.length,
            })
          );
        }
      }

      // If finished, clean up and refresh
      if (isCompletedEvent || message.status === "error") {
        console.log("✅ Translation finished with status:", message.status ?? "completed");

        // Invalidate message details so it refetches from server (in case we didn't have full data)
        if (currentMessageId) {
          queryClient.invalidateQueries({
            queryKey: ["messages", currentMessageId, "details"],
          });
        }

        // Close WebSocket
        setWebsocketUrl(null);
        setActiveMessageId(null);

        // Refresh conversation data from server
        if (currentConversationId) {
          console.log(
            "🔄 Invalidating conversation cache:",
            currentConversationId
          );
          queryClient.invalidateQueries({
            queryKey: ["conversations", currentConversationId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        // Reset after a brief delay to ensure state is clean
        setTimeout(() => {
          setActiveConversationId(null);
        }, 100);
      }
    },
  }), [queryClient]);

  const {
    isConnected,
    lastMessage,
    error: wsError,
  } = useTextToSignWebSocket(websocketUrl, wsOptions);

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
