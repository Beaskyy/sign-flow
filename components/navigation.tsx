"use client";

import { useMedia } from "react-use";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Button } from "./ui/button";
import { Ellipsis, Menu, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ChatSection } from "./chat-section";
import { SidebarProfile } from "./sidebar-profile";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const isMobile = useMedia("(max-width: 1024px)", false);

  const handleClick = (name: string) => {
    setActiveLink(name);
    setIsOpen(false);
  };

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
          className="flex flex-col justify-between h-screen p-3"
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
            {/* Chat History Section - Reusable component */}
            {[
              { title: "Today", items: 3 },
              { title: "Yesterday", items: 2 },
              { title: "Last 7 Days", items: 2 },
            ].map((section, idx) => (
              <ChatSection
                key={idx}
                title={section.title}
                itemCount={section.items}
              />
            ))}
            {/* <div>
              <div className="py-2 pl-1 pr-4">
                <p className="text-[11px] text-[#7C7C7C]">Today</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
              </div>
            </div>
            <div>
              <div className="py-2 pl-1 pr-4">
                <p className="text-[11px] text-[#7C7C7C]">Yesterday</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
              </div>
            </div>
            <div>
              <div className="py-2 pl-1 pr-4">
                <p className="text-[11px] text-[#7C7C7C]">Last 7 Days</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
                <div className="flex justify-between items-center py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333]">
                  <p className="text-[10px]">A statement or more info</p>
                  <Ellipsis className="size-3" />
                </div>
              </div>
            </div> */}
          </div>
          <SidebarProfile />
        </SheetContent>
      </Sheet>
    );
  }
  return null;
};
