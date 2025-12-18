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

  // Group conversations by time period (same logic as Sidebar)
  const today =
    conversations?.filter((conv) => {
      const date = new Date(conv.created_at);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }) || [];

  const yesterday =
    conversations?.filter((conv) => {
      const date = new Date(conv.created_at);
      const now = new Date();
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      return date.toDateString() === yesterdayDate.toDateString();
    }) || [];

  const previous7Days =
    conversations?.filter((conv) => {
      const date = new Date(conv.created_at);
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return (
        date > sevenDaysAgo &&
        date.toDateString() !== now.toDateString() &&
        date.toDateString() !==
          new Date(now.setDate(now.getDate() - 1)).toDateString()
      );
    }) || [];

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
          <div className="flex flex-col gap-4">
            {/* Logo Section */}
            <div>
              <div className="flex items-center gap-1">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
                <p className="text-[#333333] text-sm font-medium tracking-[-0.3px]">
                  Signflow
                </p>
              </div>
            </div>
            {/* New Chat Button */}
            <Button className="flex items-center gap-1 py-3 px-1 hover:opacity-80 transition-opacity bg-transparent w-fit hover:bg-transparent">
              <div className="flex items-center justify-center size-4 rounded-full bg-[#D4AF37] text-white">
                <Plus className="size-3" />
              </div>
              <p className="text-[11px] font-medium text-[#D4AF37]">New chat</p>
            </Button>
            {/* Chat History Section - Using real data */}
            <div className="space-y-4">
              <ChatSection
                title="Today"
                conversations={today}
                onRename={handleRename}
                onDelete={handleDelete}
                onSelect={handleSelect}
              />
              <ChatSection
                title="Yesterday"
                conversations={yesterday}
                onRename={handleRename}
                onDelete={handleDelete}
                onSelect={handleSelect}
              />
              <ChatSection
                title="Previous 7 Days"
                conversations={previous7Days}
                onRename={handleRename}
                onDelete={handleDelete}
                onSelect={handleSelect}
              />
            </div>
          </div>
          <SidebarProfile />
        </SheetContent>
      </Sheet>
    );
  }
  return null;
};