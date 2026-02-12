"use client";

import { AvatarModels } from "@/components/avatar-model";
import { TextInput } from "@/components/text-input";
import { ConversationSkeleton } from "@/components/conversation-skeleton"; // Import Skeleton
import { useConversation } from "@/hooks/useConversation";
import { useMessageDetails } from "@/hooks/useMessageDetails";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ConversationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = params?.id as string;
  const initText = searchParams?.get("initText");

  // State
  const [currentSequence, setCurrentSequence] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedText, setDisplayedText] = useState("Type, speak, or upload to begin");
  
  const [targetMessageId, setTargetMessageId] = useState<string>("");
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  // NEW: Track if we are processing a translation (controls the UI overlay)
  const [isProcessing, setIsProcessing] = useState(false);

  // API Hooks
  const { data: conversation, isLoading: isConversationLoading } = useConversation(conversationId || "");
  const { data: messageDetails, isLoading: isDetailsLoading } = useMessageDetails(targetMessageId);

  // ... [Existing URL cleanup effect] ...
  useEffect(() => {
    if (initText) router.replace(`/conversations/${conversationId}`);
  }, [initText, conversationId, router]);


  // ... [Existing Initial Load Effect] ...
  useEffect(() => {
    if (!targetMessageId && !initText && conversation?.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage) {
        if (lastMessage.input_preview) setDisplayedText(lastMessage.input_preview);
        setShouldAutoPlay(false);
        setTargetMessageId(lastMessage.id);
      }
    }
  }, [conversation, initText, targetMessageId]);

  // ... [Existing Message Details Effect] ...
  useEffect(() => {
    if (messageDetails && messageDetails.motion_sequence?.sequence) {
      setCurrentSequence(messageDetails.motion_sequence.sequence);
      // Data arrived, stop processing overlay
      setIsProcessing(false); 
      
      if (shouldAutoPlay) {
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 100);
      }
    }
  }, [messageDetails, shouldAutoPlay]);

  // Handler: Message Sent (WebSocket or Fallback)
  const handleMessageSent = (text: string, responseData: any) => {
    setDisplayedText(text);

    const sequence = responseData?.motion_sequence?.sequence || responseData?.data?.motion_sequence?.sequence;

    if (sequence && Array.isArray(sequence) && sequence.length > 0) {
      // Immediate success
      setTargetMessageId(""); 
      setCurrentSequence(sequence);
      setIsProcessing(false); // Stop loading
      setIsPlaying(true);
    } 
    else if (responseData?.conversation_message_id) {
       // Pending (WebSocket working in background)
       // setIsProcessing(true) is handled by TextInput prop, but we can double ensure here
       setTargetMessageId(responseData.conversation_message_id);
       setShouldAutoPlay(true);
    }
  };

  // Handler: Replay
  const handleReplay = () => {
    if (currentSequence.length > 0) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  // --- RENDER ---
  
  // 1. Show Skeleton if initial page load
  if (isConversationLoading) {
    return (
      <main className="flex justify-center items-center lg:ml-10 lg:mr-9 mx-4 h-[calc(100vh-80px)]">
         <ConversationSkeleton />
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center lg:ml-10 lg:mr-9 mx-4 h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-4 w-full">
        
        {/* Avatar with Processing State */}
        <AvatarModels 
          text={displayedText}
          currentSequence={currentSequence}
          isPlaying={isPlaying}
          onPlayStatusChange={setIsPlaying}
          onReplay={handleReplay}
          messages={conversation?.messages || []}
          onPlayHistoryItem={(item) => {
             // Handle history click
             setDisplayedText(item.input_preview);
             setShouldAutoPlay(true);
             setTargetMessageId(item.id);
             setIsProcessing(true); // Show loader while fetching details
          }}
          // Combined loading state: Either WebSocket is working OR we are fetching details
          isProcessing={isProcessing || isDetailsLoading}
        />

        {/* Input updates 'isProcessing' when WebSocket is busy */}
        <TextInput 
        // conversationId={id} 
  messageCount={conversation?.message_count} 
  conversationTitle={conversation?.title}
          conversationId={conversationId}
          onMessageSent={handleMessageSent}
          initialText={initText || ""}
          onProcessingChange={setIsProcessing}
        />

      </div>
    </main>
  );
}