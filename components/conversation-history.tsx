"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import Image from "next/image";
import { X } from "lucide-react";
import { format } from "date-fns";

interface ConversationHistoryProps {
  openHistory: boolean;
  setOpenHistory: (open: boolean) => void;
  messages: any[];
  onPlayMessage: (item: any) => void;
}

const ChatHistory = ({ 
  messages, 
  onPlayMessage, 
  closeDrawer 
}: { 
  messages: any[], 
  onPlayMessage: (item: any) => void, 
  closeDrawer: () => void 
}) => {
  
  // Show newest first
  const displayMessages = messages ? [...messages].reverse() : [];

  return (
    <div
      className={`flex justify-center items-start pt-4 w-full ${
        displayMessages.length > 0 ? "max-h-[380px]" : "min-h-[380px]"
      } ${displayMessages.length > 0 ? "overflow-y-auto" : ""}`}
    >
      {displayMessages.length > 0 ? (
        <div className="w-full">
          {displayMessages.map((item) => {
            // Logic: If status is completed, we assume we can fetch details for it.
            // We do NOT check for motion_sequence here, because the list API doesn't return it.
            const isClickable = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="flex justify-center items-center border-b-[0.5px] border-[#DADCE0] h-[60px] px-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-[15px] overflow-hidden">
                    <p className="text-[10px] text-[#DDBF5F] min-w-[50px]">
                      {item.created_at ? format(new Date(item.created_at), "HH:mm") : "--:--"}
                    </p>
                    <div className="flex flex-col max-w-[180px]">
                      <p className="text-xs text-[#333333] truncate font-medium">
                        {item.input_preview || "Untitled"}
                      </p>
                      {item.status !== 'completed' && (
                         <p className="text-[9px] text-blue-500">Processing...</p>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    disabled={!isClickable}
                    className={`ml-4 p-2 rounded-full transition-colors ${isClickable ? 'hover:bg-gray-200 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                    onClick={() => {
                      if(isClickable) {
                        onPlayMessage(item); // Sends the whole item (with ID) to parent
                        closeDrawer();
                      }
                    }}
                  >
                    <Image src="/play.svg" alt="play" width={17} height={19} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] w-full">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/info.svg" alt="info" width={28} height={28} />
            <p className="text-sm text-[#222222]">No translations yet</p>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Your conversation history will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export const ConversationHistory = ({
  openHistory,
  setOpenHistory,
  messages,
  onPlayMessage
}: ConversationHistoryProps) => {

  return (
    <Drawer open={openHistory} onOpenChange={setOpenHistory}>
      <DrawerTrigger asChild>
        <button className="flex items-center justify-center w-full h-full hover:bg-gray-100 rounded-full">
          <Image
            onClick={() => setOpenHistory(true)}
            src="/chat-history.svg"
            alt="chat-history"
            width={20}
            height={20}
          />
        </button>
      </DrawerTrigger>
      <DrawerContent className="flex justify-center items-center">
        <div className="w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-semibold">Conversation History</p>
            <X
              className="size-[18px] text-[#404040] cursor-pointer hover:text-black"
              onClick={() => setOpenHistory(false)}
            />
          </div>
          <ChatHistory 
            messages={messages} 
            onPlayMessage={onPlayMessage} 
            closeDrawer={() => setOpenHistory(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};