"use client"

import Image from "next/image";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReplyAll, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

export const Avatar = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative min-w-[343px] lg:w-full h-[456px] bg-[#E7E7E7CC] rounded-lg">
      <div className="flex justify-center items-center p-1.5 h-9 bg-[#D2D2D2BA] rounded-t-lg">
        <p className="text-sm text-[#40404099] font-medium">
          Type, speak, or upload to begin
        </p>
      </div>
      <div className="flex justify-center items-center">
        <Image src="/avatar.svg" alt="avatar" width={258} height={377} />
      </div>
      <div className="absolute right-0 -bottom-10 z-50">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger>
            <Image src="/fab.svg" alt="fab" width={100} height={33} />
          </PopoverTrigger>
          <PopoverContent className="absolute bottom-24 -left-6 flex justify-center items-center w-fit bg-transparent shadow-none border-none">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full">
                <ReplyAll />
              </div>
              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full">
                <ReplyAll />
              </div>
              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full">
                <ReplyAll />
              </div>
              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full">
                <RotateCcw />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
