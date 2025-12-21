"use client";

import { useMedia } from "react-use";
import { useRouter } from "next/navigation";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ChatSection } from "./chat-section";
import { SidebarProfile } from "./sidebar-profile";
import { useConversations } from "@/hooks/useConversation";
import { useUpdateConversation } from "@/hooks/useUpdateConversation";
import { useDeleteConversation } from "@/hooks/useDeleteConversation";
import { ChatHistory } from "./chat-history";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const router = useRouter();

  const { data: conversations, isLoading } = useConversations();
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  const isMobile = useMedia("(max-width: 1024px)", false);

  const handleClick = (name: string) => {
    setActiveLink(name);
    setIsOpen(false);
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await updateConversation.mutateAsync({ id, title: newTitle });
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSelect = (id: string) => {
    router.push(`/conversations/${id}`);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Menu className="size-5 text-[#333333]" />
        <p className="text-[#333333] text-sm font-medium tracking-[-0.4px]">
          Signflow
        </p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="flex items-center gap-1">
          <Menu className="size-5 text-[#333333]" />
          <p className="text-[#333333] text-sm font-medium tracking-[-0.4px]">
            Signflow
          </p>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col justify-between h-screen p-3 bg-[#F5F5F5]"
        >
        <ChatHistory />
          <SidebarProfile />
        </SheetContent>
      </Sheet>
    );
  }
  return null;
};