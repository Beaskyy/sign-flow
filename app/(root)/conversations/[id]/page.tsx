"use client";

import { TextInput } from "@/components/text-input";
import { useConversation } from "@/hooks/useConversation";
import { useParams } from "next/navigation";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;

  console.log("🔍 Current conversationId from params:", conversationId);

  const {
    data: conversation,
    isLoading,
    error,
  } = useConversation(conversationId || "");

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Chat messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center text-gray-500 mt-8">
              Loading conversation...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-8">
              Error loading conversation: {error.message}
            </div>
          ) : conversation ? (
            <div>
              {/* Conversation Header */}
              <div className="mb-6 pb-4 border-b">
                <h1 className="text-2xl font-semibold text-gray-800">
                  {conversation.title || "Untitled Conversation"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created {new Date(conversation.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ID: {conversationId}
                </p>
              </div>

              {/* Messages would go here */}
              <div className="space-y-4">
                {/* Placeholder for messages */}
                <div className="text-center text-gray-400 py-8">
                  No messages yet. Start the conversation below.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              Conversation not found
            </div>
          )}
        </div>
      </div>

      {/* Input at the bottom */}
      <div className="p-4 border-t bg-white">
        <div className="max-w-4xl mx-auto">
          {/* IMPORTANT: Always pass conversationId, even if conversation is loading */}
          <TextInput
            conversationId={conversationId}
            onMessageSent={(message, data) => {
              console.log("✅ Message sent:", message);
              console.log("📊 Response data:", data);
            }}
          />
        </div>
      </div>
    </div>
  );
}