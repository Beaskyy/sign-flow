"use client";

import React, { useState } from "react";
import { useMessageDetails } from "@/hooks/useMessageDetails";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import { LandmarkSkeleton } from "./landmark-skeleton";
import { BoneRotationAvatar } from "./bone-rotation-avatar";
import { isLandmarkFrame, isLegacyFrame } from "@/lib/text-to-sign-types";

interface SignLanguageModalProps {
  messageId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SignLanguageModal({ messageId, isOpen, onClose }: SignLanguageModalProps) {
  const { data: details, isLoading } = useMessageDetails(messageId || "");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sign Language Translation</DialogTitle>
          <p className="text-sm text-muted-foreground italic">"{details?.input_preview}"</p>
        </DialogHeader>

        <div className="flex-1 bg-slate-50 rounded-lg relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin size-8 text-[#D4AF37]" />
            </div>
          ) : (
            <div className="w-full h-full min-h-[300px]">
              {(() => {
                const seq = details?.motion_sequence?.sequence ?? [];
                if (seq.length > 0 && seq.some((f: unknown) => isLandmarkFrame(f))) {
                  return (
                    <LandmarkSkeleton
                      sequence={seq}
                      isPlaying={isPlaying}
                      onFinish={() => setIsPlaying(false)}
                      width={600}
                      height={400}
                      className="w-full h-full"
                    />
                  );
                }
                if (seq.length > 0 && seq.some((f: unknown) => isLegacyFrame(f))) {
                  return (
                    <BoneRotationAvatar
                      sequence={seq}
                      isPlaying={isPlaying}
                      onFinish={() => setIsPlaying(false)}
                      className="w-full h-full"
                    />
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button 
              onClick={() => setIsPlaying(true)} 
              disabled={isPlaying || isLoading}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90"
            >
              {isPlaying ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" />}
              {isPlaying ? "Playing..." : "Play Sign"}
            </Button>
            <Button variant="outline" onClick={() => setIsPlaying(false)}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}