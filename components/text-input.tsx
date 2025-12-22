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
import { useTextToSignWithWebSocket } from "@/hooks/useTextToSignWebSocket";
import { useTextToSign } from "@/hooks/useTextToSignWtihWebSocket";
import { useQueryClient } from "@tanstack/react-query";

interface TextInputProps {
  conversationId?: string;
  onMessageSent?: (message: string, data: any) => void;
}

export const TextInput = ({
  conversationId,
  onMessageSent,
}: TextInputProps) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("nigeria");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxHeight = 100;

  const router = useRouter();
  const createConversation = useCreateConversation();
  const textToSign = useTextToSign();

  // @ts-ignore
  const { isConnected, wsError, translationData } =
    useTextToSignWithWebSocket();

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight >= maxHeight ? "auto" : "hidden";
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      let currentId = conversationId;

      // 3. Logic for handling conversation creation or usage
      if (!currentId) {
        console.log("📝 No conversationId - Creating new conversation...");
        const newConversation = await createConversation.mutateAsync({
          title: text.trim().slice(0, 50) + (text.length > 50 ? "..." : ""),
        });
        currentId = newConversation.id;
        // Navigate to the new conversation page
        router.push(`/conversations/${currentId}`);
      }

      console.log("🚀 Triggering translation for ID:", currentId);

      // 4. Use the NEW hook to send the translation request
      const response = await textToSign.mutateAsync({
        text,
        conversation_id: currentId,
      });
      queryClient.invalidateQueries({ queryKey: ["conversations", currentId] });

      if (onMessageSent) {
        onMessageSent(text, response);
      }

      // Clear the input
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

  // 5. Update loading state to track the new mutation
  const isLoading = createConversation.isPending || textToSign.isPending;

  return (
    <div className="relative border border-[#1D1C1D21] rounded-lg min-h-[116px] h-fit">
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
            {/* ... language items ... */}
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
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          style={{
            minHeight: "50px",
            height: "auto",
            maxHeight: `${maxHeight}px`,
          }}
        />
      </div>

      {/* 6. Use the error state from the new hook */}
      {(textToSign.isError || wsError) && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-red-500">
            {(textToSign.error as any)?.message || wsError}
          </p>
        </div>
      )}

      {/* Translation status from WebSocket */}
      {translationData?.status === "processing" && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-blue-500">
            {translationData.message || "Processing translation..."}
          </p>
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
            onClick={handleSend}
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

//
//
//
// "use client";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { Mic, Plus, SendHorizonal } from "lucide-react";
// import Image from "next/image";
// import { Textarea } from "./ui/textarea";
// import { Button } from "./ui/button";
// import { useState, useRef, useEffect } from "react";
// import { useCreateConversation } from "@/hooks/useCreateConversation";
// import { useRouter } from "next/navigation";
// import { useTextToSignWithWebSocket } from "@/hooks/useTextToSignWebSocket";

// interface TextInputProps {
//   conversationId?: string;
//   onMessageSent?: (message: string, data: any) => void;
// }

// export const TextInput = ({ conversationId, onMessageSent }: TextInputProps) => {
//   console.log("🎯 TextInput rendered with conversationId:", conversationId);
//   const [text, setText] = useState("");
//   const [selectedLanguage, setSelectedLanguage] = useState("nigeria");
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const maxHeight = 100;

//   const router = useRouter();
//   const createConversation = useCreateConversation();
//   const {
//     translate,
//     isTranslating,
//     httpError,
//     isConnected,
//     wsMessage,
//     wsError,
//     translationData,
//   } = useTextToSignWithWebSocket();

//   const adjustTextareaHeight = () => {
//     const textarea = textareaRef.current;
//     if (!textarea) return;

//     textarea.style.height = "auto";
//     const newHeight = Math.min(textarea.scrollHeight, maxHeight);
//     textarea.style.height = `${newHeight}px`;

//     if (newHeight >= maxHeight) {
//       textarea.style.overflowY = "auto";
//     } else {
//       textarea.style.overflowY = "hidden";
//     }
//   };

//   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const value = e.target.value;
//     setText(value);
//   };

//   useEffect(() => {
//     adjustTextareaHeight();
//   }, [text]);

//   const handleSend = async () => {
//     if (!text.trim()) return;

//     console.log("🚀 handleSend called");
//   console.log("  - conversationId prop:", conversationId);
//   console.log("  - text:", text);

//     try {
//       // If we have a conversationId, use it directly
//       if (conversationId) {
//         console.log("🔄 Sending translation to existing conversation:", conversationId);

//         const response = await translate({
//           text,
//           conversation_id: conversationId,
//         });

//         console.log("✅ Translation initiated:", response);

//         // Call the callback if provided
//         if (onMessageSent) {
//           onMessageSent(text, response);
//         }
//       } else {
//         // Only create new conversation if we're NOT in a conversation page
//         console.log("📝 Creating new conversation...");
//         console.log("📝 No conversationId - Creating new conversation...");
//         const newConversation = await createConversation.mutateAsync({
//           title: text.trim().slice(0, 50) + (text.length > 50 ? "..." : ""),
//         });

//         console.log("✅ New conversation created:", newConversation.id);

//         // Send translation with the new conversation ID
//         const response = await translate({
//           text,
//           conversation_id: newConversation.id,
//         });

//         console.log("✅ Translation initiated:", response);

//         // Navigate to the new conversation
//         router.push(`/conversations/${newConversation.id}`);

//         // Call the callback if provided
//         if (onMessageSent) {
//           onMessageSent(text, response);
//         }
//       }

//       // Clear the input
//       setText("");

//       // Reset height after sending
//       if (textareaRef.current) {
//         textareaRef.current.style.height = "auto";
//         textareaRef.current.style.overflowY = "hidden";
//       }
//     } catch (error) {
//       console.error("❌ Failed to send message:", error);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const isLoading = createConversation.isPending || isTranslating;

//   // Log WebSocket updates
//   useEffect(() => {
//     if (wsMessage) {
//       console.log("📨 WebSocket update:", wsMessage);
//     }
//   }, [wsMessage]);

//   useEffect(() => {
//     if (translationData) {
//       console.log("📊 Translation data updated:", translationData);
//     }
//   }, [translationData]);

//   return (
//     <div className="relative border border-[#1D1C1D21] rounded-lg min-h-[116px] h-fit">
//       <div className="flex justify-between items-center gap-2.5 p-1.5 bg-[#F8F8F8] rounded-t-lg">
//         <small className="text-[8px] text-[#D4AF37] font-semibold uppercase">
//           Translate with Signflow AI
//           {isConnected && (
//             <span className="ml-2 text-green-600">● Connected</span>
//           )}
//         </small>

//         <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
//           <SelectTrigger className="w-fit border-none bg-transparent">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem
//               value="uk"
//               className="border-b border-[#B1B1B180] rounded-none"
//             >
//               <div className="flex items-center gap-1">
//                 <Image src="/uk.svg" alt="uk" width={15} height={15} />
//                 <small className="text-[#101928] text-[8.47px] font-medium">
//                   BSL
//                 </small>
//               </div>
//             </SelectItem>
//             <SelectItem
//               value="usa"
//               className="border-b border-[#B1B1B180] rounded-none"
//             >
//               <div className="flex items-center gap-1">
//                 <Image src="/usa.svg" alt="usa" width={15} height={15} />
//                 <small className="text-[#101928] text-[8.47px] font-medium">
//                   ASL
//                 </small>
//               </div>
//             </SelectItem>
//             <SelectItem value="nigeria">
//               <div className="flex items-center gap-1">
//                 <Image
//                   src="/nigeria.svg"
//                   alt="nigeria"
//                   width={15}
//                   height={15}
//                 />
//                 <small className="text-[#101928] text-[8.47px] font-medium">
//                   NSL
//                 </small>
//               </div>
//             </SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Textarea section */}
//       <div className="relative">
//         <Textarea
//           ref={textareaRef}
//           className="w-full py-2 px-3 rounded-none border-none resize-none outline-none placeholder:text-xs placeholder:text-[#1D1C1D80] bg-white transition-all duration-200 overflow-hidden"
//           placeholder="Type to translate..."
//           value={text}
//           onChange={handleTextChange}
//           onKeyPress={handleKeyPress}
//           disabled={isLoading}
//           style={{
//             minHeight: "50px",
//             height: "auto",
//             maxHeight: `${maxHeight}px`,
//           }}
//         />
//       </div>

//       {/* Error message */}
//       {(httpError || wsError) && (
//         <div className="px-3 pb-2">
//           <p className="text-[10px] text-red-500">
//             {httpError?.message || wsError}
//           </p>
//         </div>
//       )}

//       {/* Translation status */}
//       {translationData?.status === 'processing' && (
//         <div className="px-3 pb-2">
//           <p className="text-[10px] text-blue-500">
//             {translationData.message || 'Processing translation...'}
//           </p>
//         </div>
//       )}

//       {/* Plus and Mic icons positioned absolutely at the bottom left */}
//       <div className="flex justify-between items-center gap-4 p-1.5">
//         <div className="flex items-center gap-1">
//           <div className="flex justify-center items-center bg-[#1D1C1D0D] size-6 rounded-full p-1 cursor-pointer hover:bg-[#1D1C1D1A] transition-colors">
//             <Plus className="size-4 text-[#1D1C1D99]" />
//           </div>
//           <Mic className="size-4 text-[#1D1C1DB2] cursor-pointer hover:text-[#1D1C1D] transition-colors" />
//         </div>
//         {text.trim() === "" ? (
//           <Button className="h-6 w-[57.84px] rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90">
//             <div className="flex items-center justify-center gap-1">
//               <Image src="/audio.svg" alt="audio" width={8.84} height={8.84} />
//               <p className="text-[10px] font-medium">Voice</p>
//             </div>
//           </Button>
//         ) : (
//           <button
//             onClick={handleSend}
//             disabled={isLoading}
//             className="flex justify-center items-center rounded-full size-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 p-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? (
//               <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
//             ) : (
//               <SendHorizonal className="text-white size-4" />
//             )}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };
