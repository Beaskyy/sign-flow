"use client";

import React, { useEffect, useRef } from "react";
import { initRenderer, destroyRenderer } from "@/lib/avatar/renderer";
import {
  loadFrames,
  play,
  pause,
  restart,
  setOnFrameChange,
  tick as animatorTick,
} from "@/lib/avatar/animator";

interface LandmarkAvatarPixiProps {
  sequence: any[];
  isPlaying: boolean;
  onFinish?: () => void;
  className?: string;
}

const LandmarkAvatarPixi = ({
  sequence,
  isPlaying,
  onFinish,
  className = "",
}: LandmarkAvatarPixiProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      initRenderer(containerRef.current);
    }

    const animLoop = () => {
      animatorTick();
      requestAnimationFrame(animLoop);
    };
    const reqId = requestAnimationFrame(animLoop);

    setOnFrameChange((idx, total) => {
      if (idx === total - 1 && total > 1 && !finishedRef.current) {
        finishedRef.current = true;
        onFinish?.();
      }
    });

    return () => {
      cancelAnimationFrame(reqId);
      destroyRenderer();
    };
  }, []);

  // Update frames when sequence changes
  useEffect(() => {
    if (sequence && sequence.length > 0) {
      loadFrames(sequence);
      finishedRef.current = false;
      if (isPlaying) {
        restart();
        play();
      }
    } else {
      pause();
    }
  }, [sequence]);

  // Handle play/pause changes
  useEffect(() => {
    if (isPlaying) {
      finishedRef.current = false;
      restart();
      play();
    } else {
      pause();
    }
  }, [isPlaying]);

  return (
    <div 
      id="pixi-container"
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden bg-white ${className}`} 
    />
  );
};

export default LandmarkAvatarPixi;
