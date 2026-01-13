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
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTextToSignWithWebSocket } from "@/hooks/useTextToSignWtihWebSocket";

interface TextInputProps {
  conversationId?: string;
  onMessageSent?: (message: string, data: any) => void;
  initialText?: string;
  onProcessingChange?: (isProcessing: boolean) => void;
}

export const TextInput = ({
  conversationId,
  onMessageSent,
  initialText = "",
  onProcessingChange,
}: TextInputProps) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState(initialText);
  const [selectedLanguage, setSelectedLanguage] = useState("nigeria");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ref to ensure we only auto-send once per mount
  const hasAutoSent = useRef(false);

  const router = useRouter();
  const createConversation = useCreateConversation();

  // Using the hook here locally for the TextInput logic
  const { isConnected, wsError, translate, isTranslating } =
    useTextToSignWithWebSocket();

  useEffect(() => {
    // Notify parent whenever isTranslating changes
    if (onProcessingChange) {
      onProcessingChange(isTranslating);
    }
  }, [isTranslating, onProcessingChange]);

  // Auto-resize logic
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

  // --- AUTO SEND LOGIC ---
  useEffect(() => {
    // If we have initial text (from URL) AND a valid conversation ID, send immediately.
    if (initialText && conversationId && !hasAutoSent.current) {
      console.log("🚀 Auto-sending initial text...");
      hasAutoSent.current = true;
      handleSend(initialText);
    }
  }, [initialText, conversationId]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || text;
    if (!textToSend.trim()) return;

    // --- CASE 1: HOMEPAGE (Create & Redirect) ---
    if (!conversationId) {
      try {
        console.log("📝 Creating new conversation...");
        const newConversation = await createConversation.mutateAsync({
          title:
            textToSend.trim().slice(0, 50) +
            (textToSend.length > 50 ? "..." : ""),
        });

        // Redirect to new page WITH the text in URL
        const encodedText = encodeURIComponent(textToSend);
        router.push(
          `/conversations/${newConversation.id}?initText=${encodedText}`
        );

        setText(""); // Clear local state
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
      return;
    }

    // --- CASE 2: CONVERSATION PAGE (Translate) ---
    try {
      console.log("🚀 Triggering translation...");

      const response = await translate({
        text: textToSend,
        conversation_id: conversationId,
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId],
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
    <div className="relative border border-[#1D1C1D21] rounded-lg min-h-[116px] h-fit bg-white">
      <div className="flex justify-between items-center gap-2.5 p-1.5 bg-[#F8F8F8] rounded-t-lg">
        <small className="text-[8px] text-[#D4AF37] font-semibold uppercase">
          Translate with Signflow AI
          {isConnected && (
            <span className="ml-2 text-green-600">● Connected</span>
          )}
        </small>

        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-fit border-none bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usa">
              <div className="flex items-center gap-1">
                <Image src="/usa.svg" alt="usa" width={15} height={15} />
                <small className="text-[#101928] text-[8.47px] font-medium">
                  ASL
                </small>
              </div>
            </SelectItem>
            <SelectItem value="uk">
              <div className="flex items-center gap-1">
                <Image src="/uk.svg" alt="uk" width={15} height={15} />
                <small className="text-[#101928] text-[8.47px] font-medium">
                  BSL
                </small>
              </div>
            </SelectItem>
            <SelectItem value="nigeria">
              <div className="flex items-center gap-1">
                <Image
                  src="/nigeria.svg"
                  alt="nigeria"
                  width={15}
                  height={15}
                />
                <small className="text-[#101928] text-[8.47px] font-medium">
                  NSL
                </small>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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
