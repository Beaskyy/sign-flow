"use client";

import { TextInput } from "@/components/text-input";
import { useConversation } from "@/hooks/useConversation";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { SignLanguageModal } from "@/components/sign-language-modal";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const scrollRef = useRef<HTMLDivElement>(null);

    // State to handle the modal
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
  
    const handleOpenViewer = (messageId: string) => {
      setSelectedMessageId(messageId);
      setIsModalOpen(true);
    };
  

  const {
    data: conversation,
    isLoading,
    error,
  } = useConversation(conversationId || "");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white">
      {/* Header */}
      <div className="px-6 pb-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">
          {isLoading ? "Loading..." : conversation?.title || "Untitled Conversation"}
        </h1>
        {conversation && (
          <p className="text-xs text-gray-500">
            {conversation.message_count} messages • Created {new Date(conversation.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Chat messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-6 scroll-smooth"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="animate-pulse">Loading conversation...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mt-8">
            Error loading conversation: {error.message}
          </div>
        ) : conversation?.messages && conversation.messages.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {conversation.messages.map((message: any) => (
              <div key={message.id} className="flex flex-col gap-2">
                
                {/* User Message (Input) */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-[#F3F3F3] rounded-2xl px-4 py-2 text-sm text-gray-800 shadow-sm">
                    <p className="font-medium text-[10px] text-[#D4AF37] uppercase mb-1">You</p>
                    {message.input_preview}
                    <p className="text-[9px] text-gray-400 mt-1 text-right">
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>

                {/* AI Response (Output/Status) */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] border border-[#E8E8E8] rounded-2xl px-4 py-2 text-sm text-gray-800 bg-white shadow-sm">
                    <p className="font-medium text-[10px] text-[#D4AF37] uppercase mb-1">Signflow AI</p>
                    
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${message.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                      <p className="text-sm">{message.output_preview}</p>
                    </div>

                    {message.status === 'completed' && (
                      <div  onClick={() => handleOpenViewer(message.id)} className="mt-2 p-2 bg-gray-50 rounded text-[11px] text-gray-600 border-l-2 border-[#D4AF37] cursor-pointer">
                        Translation ready for viewing
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Type something below to start translating.</p>
          </div>
        )}
      </div>


      {/* Input at the bottom */}
      <div className="p-4 border-t bg-white">
        <div className="max-w-4xl mx-auto">
          <TextInput
            conversationId={conversationId}
            onMessageSent={(message, data) => {
              // The useConversation hook will automatically refetch 
              // if you invalidate the query in your TextInput's success handler
              console.log("✅ Message sent:", message);
            }}
          />
        </div>
      </div>

      {/* The 3D Modal */}
      <SignLanguageModal 
        messageId={selectedMessageId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}