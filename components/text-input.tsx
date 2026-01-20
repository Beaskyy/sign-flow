"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Plus, SendHorizonal } from "lucide-react";
import Image from "next/image";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { useCreateConversation } from "@/hooks/useCreateConversation";
import { useUpdateConversation } from "@/hooks/useUpdateConversation"; // 1. Import this
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTextToSignWithWebSocket } from "@/hooks/useTextToSignWtihWebSocket";

interface TextInputProps {
  conversationId?: string;
  onMessageSent?: (message: string, data: any) => void;
  initialText?: string;
  onProcessingChange?: (isProcessing: boolean) => void;
  // 2. Add these props so we know when to rename
  messageCount?: number; 
  conversationTitle?: string;
}

export const TextInput = ({
  conversationId,
  onMessageSent,
  initialText = "",
  onProcessingChange,
  messageCount = 0, // Default to 0
  conversationTitle = ""
}: TextInputProps) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState(initialText);
  const [selectedLanguage, setSelectedLanguage] = useState("nigeria");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ref to ensure we only auto-send once per mount
  const hasAutoSent = useRef(false);

  const router = useRouter();
  const createConversation = useCreateConversation();
  const updateConversation = useUpdateConversation(); // 3. Initialize hook

  // ... (Existing WebSocket and resize logic remains the same) ...
  const { isConnected, wsError, translate, isTranslating } =
    useTextToSignWithWebSocket();

  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(isTranslating);
    }
  }, [isTranslating, onProcessingChange]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 100);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight >= 100 ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  useEffect(() => {
    if (initialText && conversationId && !hasAutoSent.current) {
      hasAutoSent.current = true;
      handleSend(initialText);
    }
  }, [initialText, conversationId]);

  // --- UPDATED SEND LOGIC ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || text;
    if (!textToSend.trim()) return;

    // --- CASE 1: HOMEPAGE (Create & Redirect) ---
    // This part works: it creates the conversation with the correct title immediately.
    if (!conversationId) {
      try {
        console.log("📝 Creating new conversation...");
        const newConversation = await createConversation.mutateAsync({
          title:
            textToSend.trim().slice(0, 50) +
            (textToSend.length > 50 ? "..." : ""),
        });

        const encodedText = encodeURIComponent(textToSend);
        router.push(
          `/conversations/${newConversation.id}?initText=${encodedText}`
        );

        setText(""); 
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
      return;
    }

    // CONVERSATION PAGE (Translate & Rename) ---
    try {
      console.log("🚀 Triggering translation...");

      // If message count is 0 OR title is explicitly "New Conversation"
      const shouldRename = messageCount === 0 || conversationTitle === "New Conversation";
      
      if (shouldRename) {
        const newTitle = textToSend.trim().slice(0, 40) + (textToSend.length > 40 ? "..." : "");
        
        // We run this without awaiting so it doesn't block the translation
        updateConversation.mutate({
          id: conversationId,
          title: newTitle
        });
      }

      const response = await translate({
        text: textToSend,
        conversation_id: conversationId,
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId],
      });
      // Also invalidate the list so the sidebar updates
      queryClient.invalidateQueries({
        queryKey: ["conversations_list"], 
      });

      if (onMessageSent) {
        onMessageSent(textToSend, response);
      }

      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLoading = createConversation.isPending || isTranslating;

  return (
     // ... (Your existing JSX Return) ...
     <div className="relative border border-[#1D1C1D21] rounded-lg min-h-[116px] h-fit bg-white">
        {/* ... Rest of your UI ... */}
        {/* (I am omitting the UI JSX here to save space, but keep it exactly as you have it) */}
        
        {/* Just ensure the <Textarea /> and button call handleSend() */}
         <div className="relative">
        <Textarea
          ref={textareaRef}
          className="w-full py-2 px-3 rounded-none border-none resize-none outline-none placeholder:text-xs placeholder:text-[#1D1C1D80] bg-white transition-all duration-200 overflow-hidden"
          placeholder="Type to translate..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          style={{ minHeight: "50px" }}
        />
      </div>

      {wsError && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-red-500">{wsError}</p>
        </div>
      )}

      <div className="flex justify-between items-center gap-4 p-1.5">
        <div className="flex items-center gap-1">
          <div className="flex justify-center items-center bg-[#1D1C1D0D] size-6 rounded-full p-1 cursor-pointer hover:bg-[#1D1C1D1A]">
            <Plus className="size-4 text-[#1D1C1D99]" />
          </div>
          <Mic className="size-4 text-[#1D1C1DB2] cursor-pointer hover:text-[#1D1C1D]" />
        </div>

        {text.trim() === "" ? (
          <Button className="h-6 w-[57.84px] rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90">
            <div className="flex items-center justify-center gap-1">
              <Image src="/audio.svg" alt="audio" width={8.84} height={8.84} />
              <p className="text-[10px] font-medium">Voice</p>
            </div>
          </Button>
        ) : (
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="flex justify-center items-center rounded-full size-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 p-1 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
            ) : (
              <SendHorizonal className="text-white size-4" />
            )}
          </button>
        )}
      </div>
     </div>
  );
};