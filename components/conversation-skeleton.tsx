"use client";

import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have shadcn skeleton or use standard div

export const ConversationSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl animate-pulse">
      
      {/* Avatar Skeleton */}
      <div className="relative min-w-[343px] lg:w-full h-[456px] bg-gray-200 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-center items-center p-1.5 h-9 bg-gray-300 rounded-t-lg z-10">
          <div className="h-3 w-40 bg-gray-400 rounded-full" />
        </div>

        {/* Body Area */}
        <div className="flex-1 w-full bg-gray-100 flex items-center justify-center">
           <div className="size-24 rounded-full bg-gray-200" />
        </div>

        {/* FAB Controls Skeleton */}
        <div className="absolute right-0 bottom-6 z-50 mr-4">
           <div className="h-[33px] w-[100px] bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Text Input Skeleton */}
      <div className="relative border border-gray-100 rounded-lg min-h-[116px] h-fit bg-white">
        {/* Input Header */}
        <div className="flex justify-between items-center gap-2.5 p-1.5 bg-gray-50 rounded-t-lg">
           <div className="h-2 w-24 bg-gray-200 rounded-full" />
           <div className="h-2 w-10 bg-gray-200 rounded-full" />
        </div>
        
        {/* Input Body */}
        <div className="p-3">
           <div className="h-4 w-full bg-gray-100 rounded mb-2" />
           <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>

        {/* Input Footer */}
        <div className="flex justify-between items-center gap-4 p-1.5 mt-2">
           <div className="flex gap-2">
             <div className="size-6 bg-gray-200 rounded-full" />
             <div className="size-6 bg-gray-200 rounded-full" />
           </div>
           <div className="size-6 bg-gray-200 rounded-full" />
        </div>
      </div>

    </div>
  );
};