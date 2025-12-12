import { ChatItem } from "./chat-item";

interface ChatSectionProps {
  title: string;
  itemCount: number;
}

export const ChatSection = ({ title, itemCount }: ChatSectionProps) => (
  <div>
    <div className="py-2 pl-1 pr-4">
      <p className="text-[11px] text-[#7C7C7C]">{title}</p>
    </div>
    <div className="flex flex-col gap-1">
      {Array.from({ length: itemCount }).map((_, i) => (
        <ChatItem key={i} />
      ))}
    </div>
  </div>
);