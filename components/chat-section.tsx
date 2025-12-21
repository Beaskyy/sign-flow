"use client";

import { ChatItem } from "./chat-item";

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

interface ChatSectionProps {
  title: string;
  conversations: Conversation[];
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const ChatSection = ({
  title,
  conversations,
  onRename,
  onDelete,
  onSelect,
}: ChatSectionProps) => {
  if (!conversations || conversations.length === 0) return null;

  return (
    <div>
      <div className="py-2 pl-1 pr-4">
        <p className="text-[11px] text-[#7C7C7C]">{title}</p>
      </div>
      <div className="flex flex-col gap-1">
        {conversations.map((conversation) => (
          <ChatItem
            key={conversation.id}
            id={conversation.id}
            title={conversation.title || "Untitled Chat"}
            onRename={onRename}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};