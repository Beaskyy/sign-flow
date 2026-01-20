"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Navigation } from "./navigation";
import { useStateContext } from "@/providers/ContextProvider";
import {
  CircleQuestionMark,
  EllipsisVertical,
  Flag,
  PanelRight,
  Share2,
} from "lucide-react";

import { useCreateConversation } from "@/hooks/useCreateConversation";

const Header = () => {
  const { activeMenu, setActiveMenu } = useStateContext();
  
  const router = useRouter();
  const createConversation = useCreateConversation();

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

  const logout = async () => {};

  return (
    <header
      className={`fixed z-20 w-full bg-white transition-all duration-300 lg:pr-[26px] ${
        activeMenu ? "lg:left-[252px] lg:w-custom" : "lg:left-0"
      }`}
    >
      <div className="flex justify-between items-center py-3">
        <div className="lg:pl-10 pl-4">
          {activeMenu ? (
            <h5 className="hidden lg:flex text-sm font-normal leading-[20.3px] text-[#5D5D5D]"></h5>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <div>
                <Link href="/">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={20}
                    height={20}
                    className="lg:size-10 size-5"
                  />
                </Link>
              </div>
              <div>
                <Tooltip>
                  <TooltipTrigger>
                    <PanelRight
                      onClick={() => setActiveMenu(!activeMenu)}
                      className="text-[#ABABAB]"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px] font-medium">open sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
          <div className="lg:hidden">
            <Navigation />
          </div>
        </div>

        <Popover>
          <PopoverTrigger>
            <EllipsisVertical className="size-5 flex-shrink-0" />
          </PopoverTrigger>
          <PopoverContent className="absolute flex flex-col justify-center right-0 w-[134px] h-[122px] bg-white rounded-md drop-shadow-sm p-0">
            
            <div 
              onClick={handleCreateNew}
              className={`flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA] ${createConversation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {createConversation.isPending ? (
                // Optional: Show a tiny spinner or simple generic icon while loading
                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400" />
              ) : (
                <Image src="/edit.svg" alt="edit" width={15.4} height={15.4} />
              )}
              <p className="text-[9.24px] text-[#101928] font-medium">
                {createConversation.isPending ? "Creating..." : "New Chat"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]">
              <Share2 className="size-[15px] text-[#404040]" />
              <p className="text-[8.47px] text-[#101928] font-medium">Share</p>
            </div>
            <div className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]">
              <CircleQuestionMark className="size-[15px] text-[#404040]" />
              <p className="text-[8.47px] text-[#101928] font-medium">Help</p>
            </div>
            <div className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]">
              <Flag className="size-[15px] text-[#404040]" />
              <p className="text-[9.24px] text-[#101928] font-medium">
                Report Issue
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default Header;