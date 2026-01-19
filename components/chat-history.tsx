"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback} from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PanelLeft, Plus } from "lucide-react";

import { useStateContext } from "@/providers/ContextProvider";
import { Button } from "./ui/button";
import { ChatSection } from "./chat-section";
import { useRouter, useParams } from "next/navigation";
import { useUpdateConversation } from "@/hooks/useUpdateConversation";
import { useDeleteConversation } from "@/hooks/useDeleteConversation";
import { useCreateConversation } from "@/hooks/useCreateConversation";
import { useConversations } from "@/hooks/useConversation";

// Skeleton loading component
const ConversationSkeleton = () => (
  <div className="space-y-3 p-2">
    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
  </div>
);

const ChatSectionSkeleton = ({ title }: { title: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-medium text-[#808080] uppercase tracking-wide">
        {title}
      </h3>
      <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-1">
      <ConversationSkeleton />
      <ConversationSkeleton />
    </div>
  </div>
);

export const ChatHistory = () => {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.id as string | undefined;

  // Using the updated hook with pagination
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useConversations();

  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();
  const createConversation = useCreateConversation();
  const { activeMenu, setActiveMenu } = useStateContext();
  
  const [activeLink, setActiveLink] = useState("");
  const [selectedAssociation, setSelectedAssociation] = useState<string | null>(
    null
  );

  // Ref for the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Handle infinite scroll with Intersection Observer
  const lastConversationRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;

      // Disconnect previous observer
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Flatten all conversations from all pages
  const allConversations = data?.pages?.flatMap(
    (page: any) => page.conversations || page.data || page
  ) || [];

  // Group conversations by time period
  const today = allConversations.filter((conv: any) => {
    if (!conv?.created_at) return false;
    const date = new Date(conv.created_at);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  });

  const yesterday = allConversations.filter((conv: any) => {
    if (!conv?.created_at) return false;
    const date = new Date(conv.created_at);
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    return date.toDateString() === yesterdayDate.toDateString();
  });

  const previous7Days = allConversations.filter((conv: any) => {
    if (!conv?.created_at) return false;
    const date = new Date(conv.created_at);
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    return (
      date > sevenDaysAgo &&
      date.toDateString() !== now.toDateString() &&
      date.toDateString() !== yesterdayDate.toDateString()
    );
  });

  const older = allConversations.filter((conv: any) => {
    if (!conv?.created_at) return false;
    const date = new Date(conv.created_at);
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Returns true if the date is older than or equal to 7 days ago
    return date <= sevenDaysAgo;
  });


  const handleCreateNew = async () => {
    try {
      const newConv = await createConversation.mutateAsync({
        title: "New Conversation",
      });
      router.push(`/conversations/${newConv.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
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
      if (id === conversationId) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSelect = (id: string) => {
    router.push(`/conversations/${id}`);
  };

  // Check if there are no conversations at all
  const hasConversations = today.length > 0 || yesterday.length > 0 || previous7Days.length > 0 || older.length > 0;;
  return (
    <div>
       <div className="flex flex-col gap-4 h-full">
          {/* Logo Section */}
          <div className="flex justify-between items-center pt-6 pb-10">
            <Link href="/" className="flex items-center gap-1">
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
            </Link>
            {activeMenu && (
              <Tooltip>
                <TooltipTrigger>
                  <PanelLeft
                    onClick={() => setActiveMenu(!activeMenu)}
                    className="text-[#ABABAB] size-6"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px] font-medium">close sidebar</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* New Chat Button */}
          <Button
            onClick={handleCreateNew}
            disabled={createConversation.isPending}
            className="flex items-center gap-1 py-3 px-1 hover:opacity-80 transition-opacity bg-transparent w-fit hover:bg-transparent disabled:opacity-50"
          >
            <div className="flex items-center justify-center size-4 rounded-full bg-[#D4AF37] text-white">
              {createConversation.isPending ? (
                <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent" />
              ) : (
                <Plus className="size-3" />
              )}
            </div>
            <p className="text-[11px] font-medium text-[#D4AF37]">
              {createConversation.isPending ? "Creating..." : "New chat"}
            </p>
          </Button>
          
          {/* Chat History Section with fixed height and scroll */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
            style={{ 
              maxHeight: 'calc(100vh - 280px)',
              minHeight: '200px'
            }}
          >
            {isLoading ? (
              // Initial loading skeletons
              <div className="space-y-6 p-2">
                <ChatSectionSkeleton title="Today" />
                <ChatSectionSkeleton title="Yesterday" />
                <ChatSectionSkeleton title="Previous 7 Days" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-xs p-2">
                Error loading conversations
              </div>
            ) : !hasConversations ? (
              <div className="text-gray-500 text-xs p-2">
                No conversations yet. Start a new chat!
              </div>
            ) : (
              <div className="space-y-4">
                {today.length > 0 && (
                  <ChatSection
                    title="Today"
                    conversations={today}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onSelect={handleSelect}
                  />
                )}
                {yesterday.length > 0 && (
                  <ChatSection
                    title="Yesterday"
                    conversations={yesterday}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onSelect={handleSelect}
                  />
                )}
                {previous7Days.length > 0 && (
                  <ChatSection
                    title="Previous 7 Days"
                    conversations={previous7Days}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onSelect={handleSelect}
                  />
                )}
                 {older.length > 0 && (
                  <ChatSection
                    title="Older"
                    conversations={older}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onSelect={handleSelect}
                  />
                )}
                
                {/* Loading indicator for infinite scroll */}
                {isFetchingNextPage && (
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
                    </div>
                    <ChatSectionSkeleton title="Loading more conversations..." />
                  </div>
                )}
                
                {/* Intersection observer target */}
                {hasNextPage && !isFetchingNextPage && (
                  <div ref={lastConversationRef} className="h-2" />
                )}
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
