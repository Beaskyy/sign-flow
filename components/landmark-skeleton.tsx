"use client";

import React, { useRef, useEffect, useCallback } from "react";
import type { LandmarkFrame, Vec3 } from "@/lib/text-to-sign-types";
import { POSE_CONNECTIONS, HAND_CONNECTIONS } from "@/lib/mediapipe-connections";

interface LandmarkSkeletonProps {
  sequence: LandmarkFrame[];
  isPlaying: boolean;
  onFinish?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

/** Draw landmarks with connections on canvas. Coords are normalized 0-1 (x,y). */
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  pose: Vec3[] | null,
  leftHand: Vec3[] | null,
  rightHand: Vec3[] | null,
  width: number,
  height: number
) {
  const strokeColor = "#D4AF37";
  const jointColor = "#333333";
  const lineWidth = 2;
  const jointRadius = 4;

  const toCanvas = (p: Vec3) => ({
    x: p.x * width,
    y: (1 - p.y) * height, // flip Y: 0=top in canvas
  });

  const drawConnections = (points: Vec3[], connections: [number, number][]) => {
    if (!points || points.length === 0) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    connections.forEach(([i, j]) => {
      if (i < points.length && j < points.length) {
        const a = toCanvas(points[i]);
        const b = toCanvas(points[j]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
    points.forEach((p) => {
      const { x, y } = toCanvas(p);
      ctx.fillStyle = jointColor;
      ctx.beginPath();
      ctx.arc(x, y, jointRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  if (pose && pose.length >= 2) {
    drawConnections(pose, POSE_CONNECTIONS);
  }
  if (leftHand && leftHand.length >= 2) {
    drawConnections(leftHand, HAND_CONNECTIONS);
  }
  if (rightHand && rightHand.length >= 2) {
    drawConnections(rightHand, HAND_CONNECTIONS);
  }
}

/** Interpolate between two frames based on progress (0-1) */
function interpolateFrame(
  a: LandmarkFrame,
  b: LandmarkFrame,
  t: number
): LandmarkFrame {
  const lerp = (p1: Vec3, p2: Vec3, s: number) => ({
    x: p1.x + (p2.x - p1.x) * s,
    y: p1.y + (p2.y - p1.y) * s,
    z: p1.z + (p2.z - p1.z) * s,
  });

  const lerpArr = (arr1: Vec3[] | null, arr2: Vec3[] | null): Vec3[] | null => {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return arr1 || arr2;
    return arr1.map((p, i) => lerp(p, arr2[i], t));
  };

  return {
    timestamp_ms: a.timestamp_ms + (b.timestamp_ms - a.timestamp_ms) * t,
    pose: lerpArr(a.pose, b.pose),
    left_hand: lerpArr(a.left_hand, b.left_hand),
    right_hand: lerpArr(a.right_hand, b.right_hand),
    face: lerpArr(a.face, b.face),
  };
}

export function LandmarkSkeleton({
  sequence,
  isPlaying,
  onFinish,
  width = 400,
  height = 400,
  className = "",
}: LandmarkSkeletonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const hasFinishedRef = useRef(false);

  const animate = useCallback(() => {
    if (!sequence || sequence.length === 0 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    const elapsedMs = now - startTimeRef.current;
    const lastTs = sequence[sequence.length - 1]?.timestamp_ms ?? 0;
    const totalDurationMs = Math.max(lastTs, 500);

    if (elapsedMs >= totalDurationMs && onFinish && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      onFinish();
      return;
    }

    const timeMs = Math.min(elapsedMs, totalDurationMs - 1);

    let currentFrame: LandmarkFrame;
    if (sequence.length === 1) {
      currentFrame = sequence[0];
    } else {
      let idx = 0;
      while (idx < sequence.length - 1 && sequence[idx + 1].timestamp_ms <= timeMs) {
        idx++;
      }
      if (idx >= sequence.length - 1) {
        currentFrame = sequence[sequence.length - 1];
      } else {
        const a = sequence[idx];
        const b = sequence[idx + 1];
        const span = b.timestamp_ms - a.timestamp_ms;
        const t = span > 0 ? (timeMs - a.timestamp_ms) / span : 1;
        currentFrame = interpolateFrame(a, b, t);
      }
    }

    ctx.clearRect(0, 0, width, height);
    drawSkeleton(
      ctx,
      currentFrame.pose,
      currentFrame.left_hand,
      currentFrame.right_hand,
      width,
      height
    );

    animRef.current = requestAnimationFrame(animate);
  }, [sequence, width, height, onFinish]);

  useEffect(() => {
    if (isPlaying && sequence && sequence.length > 0) {
      hasFinishedRef.current = false;
      startTimeRef.current = performance.now();
      animate();
    } else {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = undefined;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx && sequence && sequence.length > 0) {
          ctx.clearRect(0, 0, width, height);
          const frame = sequence[0];
          drawSkeleton(
            ctx,
            frame.pose,
            frame.left_hand,
            frame.right_hand,
            width,
            height
          );
        }
      }
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, sequence, animate, width, height]);

  if (!sequence || sequence.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-[#E7E7E7] ${className}`}
        style={{ minHeight: 200 }}
      >
        <p className="text-sm text-gray-500">No motion data</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[200px] ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  );
}
