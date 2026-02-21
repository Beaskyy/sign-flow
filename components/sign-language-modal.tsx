"use client";

import React, { useState, useMemo } from "react";
import { useMessageDetails } from "@/hooks/useMessageDetails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import { BoneRotationAvatar } from "./bone-rotation-avatar";
import { isLandmarkFrame, isLegacyFrame } from "@/lib/text-to-sign-types";
import type { LandmarkFrame } from "@/lib/text-to-sign-types";
import { landmarkSequenceToBoneSequenceKalidokit } from "@/lib/landmark-to-bones-kalidokit";
import type { BoneRotationFrame } from "./bone-rotation-avatar";

function ModalMotion({
  sequence,
  isPlaying,
  onFinish,
}: {
  sequence: unknown[];
  isPlaying: boolean;
  onFinish: () => void;
}) {
  const isLandmark = sequence.length > 0 && sequence.some((f: unknown) => isLandmarkFrame(f));
  const isLegacy = sequence.length > 0 && sequence.some((f: unknown) => isLegacyFrame(f));
  const boneSeqFromLandmarks = useMemo(() => {
    if (!isLandmark || !sequence.length) return [];
    const landmarkSeq = sequence.filter((f): f is LandmarkFrame => isLandmarkFrame(f));
    return landmarkSequenceToBoneSequenceKalidokit(landmarkSeq);
  }, [isLandmark, sequence]);

  if (sequence.length === 0) return null;
  if (isLandmark && boneSeqFromLandmarks.length > 0) {
    return (
      <BoneRotationAvatar
        sequence={boneSeqFromLandmarks}
        isPlaying={isPlaying}
        onFinish={onFinish}
        className="w-full h-full"
      />
    );
  }
  if (isLegacy) {
    return (
      <BoneRotationAvatar
        sequence={sequence as BoneRotationFrame[]}
        isPlaying={isPlaying}
        onFinish={onFinish}
        className="w-full h-full"
      />
    );
  }
  return null;
}

interface SignLanguageModalProps {
  messageId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SignLanguageModal({
  messageId,
  isOpen,
  onClose,
}: SignLanguageModalProps) {
  const { data: details, isLoading } = useMessageDetails(messageId || "");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sign Language Translation</DialogTitle>
          <p className="text-sm text-muted-foreground italic">
            "{details?.input_preview}"
          </p>
        </DialogHeader>

        <div className="flex-1 bg-slate-50 rounded-lg relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin size-8 text-[#D4AF37]" />
            </div>
          ) : (
            <div className="w-full h-full min-h-[300px]">
              <ModalMotion
                sequence={details?.motion_sequence?.sequence ?? []}
                isPlaying={isPlaying}
                onFinish={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button
              onClick={() => setIsPlaying(true)}
              disabled={isPlaying || isLoading}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90"
            >
              {isPlaying ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Play className="mr-2" />
              )}
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
