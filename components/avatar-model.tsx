"use client";

import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, Play, Sparkles } from "lucide-react";
import { ConversationHistory } from "./conversation-history";
import Image from "next/image";
import { LandmarkSkeleton } from "./landmark-skeleton";
import { BoneRotationAvatar } from "./bone-rotation-avatar";
import { isLandmarkFrame, isLegacyFrame } from "@/lib/text-to-sign-types";
import type { LandmarkFrame } from "@/lib/text-to-sign-types";
import { landmarkSequenceToBoneSequenceKalidokit } from "@/lib/landmark-to-bones-kalidokit";

interface AvatarProps {
  text: string;
  responseText?: string;
  currentSequence: any[];
  isPlaying: boolean;
  onPlayStatusChange: (status: boolean) => void;
  onReplay: () => void;
  messages: any[];
  onPlayHistoryItem: (item: any) => void;
  isProcessing?: boolean; // NEW PROP
}

export const AvatarModels = ({
  text,
  responseText,
  currentSequence,
  isPlaying,
  onPlayStatusChange,
  onReplay,
  messages,
  onPlayHistoryItem,
  isProcessing = false, // Default to false
}: AvatarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const hasData = currentSequence && currentSequence.length > 0;
  const isLandmark = hasData && currentSequence.some((f) => isLandmarkFrame(f));
  const landmarkSequence = useMemo(() => {
    if (!isLandmark || !currentSequence?.length) return [];
    return currentSequence.filter((f): f is LandmarkFrame => isLandmarkFrame(f));
  }, [isLandmark, currentSequence]);

  return (
    <div className="relative min-w-[343px] lg:w-full h-[456px] bg-[#E7E7E7CC] rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col justify-center items-center py-1 px-2 min-h-9 bg-[#D2D2D2BA] rounded-t-lg z-10 transition-colors duration-300">
        <p
          className={`text-sm font-medium truncate max-w-[90%] ${
            isProcessing ? "text-[#D4AF37] animate-pulse" : "text-[#333333]"
          }`}
        >
          {isProcessing ? "Translating text to sign..." : text}
        </p>
        {!isProcessing && responseText?.trim() ? (
          <p className="text-[11px] text-[#404040B2] truncate max-w-[90%]">
            {responseText}
          </p>
        ) : null}
      </div>

      {/* Motion display: LandmarkFrame (new, 2D landmarks) or boneRotations (legacy 3D avatar) */}
      <div className="relative flex-1 w-full bg-[#E7E7E7CC] group flex items-center justify-center">
        {hasData && currentSequence.some((f) => isLandmarkFrame(f)) ? (
          <LandmarkSkeleton
            sequence={currentSequence}
            isPlaying={isPlaying}
            onFinish={() => onPlayStatusChange(false)}
            className="w-full h-full rounded-b-lg"
          />
        ) : hasData && currentSequence.some((f) => isLegacyFrame(f)) ? (
          <BoneRotationAvatar
            sequence={currentSequence}
            isPlaying={isPlaying}
            onFinish={() => onPlayStatusChange(false)}
            className="w-full h-full rounded-b-lg"
          />
        ) : hasData ? (
          <p className="text-sm text-gray-500">Unsupported motion format</p>
        ) : isProcessing ? null : (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 animate-in fade-in zoom-in duration-500">
            <div className="relative w-full max-w-[280px] aspect-[258/377]">
               <Image 
                src="/avatar.png" 
                alt="Avatar placeholder" 
                fill 
                className="object-contain drop-shadow-sm" 
                priority
              />
            </div>
          </div>
        )}

        {/* --- STATE 1: PROCESSING OVERLAY (WebSocket) --- */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-30">
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-[#D4AF37]/20">
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full animate-ping" />
                <Sparkles className="text-[#D4AF37] size-8 animate-pulse relative z-10" />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-800">
                  Generating Poses
                </p>
                <p className="text-[10px] text-gray-500">
                  AI is processing motion...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- STATE 2: PLAY BUTTON (Paused & Has Data & Not Processing) --- */}
        {!isPlaying && !isProcessing && hasData && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/5 cursor-pointer z-20 hover:bg-black/10 transition-colors"
            onClick={onReplay}
          >
            <div className="bg-white/90 p-3 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center justify-center">
              <Play className="fill-current text-[#D4AF37] size-8" />
            </div>
          </div>
        )}
      </div>

      {/* FAB Controls */}
      <div className="absolute right-0 bottom-6 z-50">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger>
            <Image
              src="/fab.svg"
              alt="fab"
              width={100}
              height={33}
              className="cursor-pointer"
            />
          </PopoverTrigger>
          <PopoverContent className="absolute bottom-24 -left-6 flex justify-center items-center w-fit bg-transparent shadow-none border-none">
            <div className="flex flex-col gap-1.5 mb-[18.29px]">
              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full cursor-pointer shadow-md">
                <ConversationHistory
                  openHistory={openHistory}
                  setOpenHistory={setOpenHistory}
                  messages={messages}
                  onPlayMessage={onPlayHistoryItem}
                />
              </div>

              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full cursor-pointer shadow-md">
                <Image src="/subs.svg" alt="subs" width={18} height={17.58} />
              </div>
              <div className="flex justify-center items-center size-[36.57px] bg-white rounded-full cursor-pointer shadow-md">
                <p className="text-[#404040] font-semibold">1x</p>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onReplay();
                }}
                className="flex justify-center items-center size-[36.57px] bg-white rounded-full cursor-pointer shadow-md active:scale-95 transition-transform hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 text-[#404040]" />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
