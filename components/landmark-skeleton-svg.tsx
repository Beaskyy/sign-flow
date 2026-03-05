"use client";

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import type { LandmarkFrame, Vec3 } from "@/lib/text-to-sign-types";
import {
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
} from "@/lib/mediapipe-connections";

// Simple face connections (eyes and mouth) for the blueprint look
const MOUTH_CONNECTIONS: [number, number][] = [[13, 14]]; // Inner lips center
const LEFT_EYE_CONNECTIONS: [number, number][] = [[33, 133]]; // Outer/Inner corners
const RIGHT_EYE_CONNECTIONS: [number, number][] = [[263, 362]]; // Outer/Inner corners

interface LandmarkSkeletonSvgProps {
  sequence: LandmarkFrame[];
  isPlaying: boolean;
  onFinish?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

const PADDING_RATIO = 0.1;
const NORMALIZED_SCALE = 1.0;
const CENTER = 0.5;

function interpolateFrame(
  a: LandmarkFrame,
  b: LandmarkFrame,
  t: number,
): LandmarkFrame {
  const lerp = (p1: Vec3, p2: Vec3, s: number): Vec3 => ({
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

function SkeletonPaths({
  frame,
  width,
  height,
  bounds,
}: {
  frame: LandmarkFrame;
  width: number;
  height: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}) {
  const lines: { x1: number; y1: number; x2: number; y2: number; color: string; width: number }[] = [];

  const toSvg = (p: Vec3): { x: number; y: number } => {
    const { minX, maxX, minY, maxY } = bounds;
    const dx = maxX - minX || 1.0;
    const dy = maxY - minY || 1.0;

    const nx = (p.x - minX) / dx;
    const ny = (p.y - minY) / dy;

    const innerW = width * (1 - PADDING_RATIO * 2);
    const innerH = height * (1 - PADDING_RATIO * 2);
    const offsetX = width * PADDING_RATIO;
    const offsetY = height * PADDING_RATIO;

    const sx = CENTER + (nx - CENTER) * NORMALIZED_SCALE;
    const sy = CENTER + (ny - CENTER) * NORMALIZED_SCALE;

    return {
      x: offsetX + sx * innerW,
      y: offsetY + sy * innerH,
    };
  };

  const addConnections = (
    pts: Vec3[] | null,
    connections: [number, number][],
    color: string,
    strokeWidth: number
  ) => {
    if (!pts || pts.length === 0) return;
    connections.forEach(([i, j]) => {
      if (i < pts.length && j < pts.length) {
        const a = toSvg(pts[i]);
        const b = toSvg(pts[j]);
        lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color, width: strokeWidth });
      }
    });
  };

  // 1. Pose Skeleton (Gold)
  addConnections(frame.pose, POSE_CONNECTIONS, "#D4AF37", 3);

  // 2. Hands (Green and Purple)
  addConnections(frame.left_hand, HAND_CONNECTIONS, "#FFD700", 2.5);
  addConnections(frame.right_hand, HAND_CONNECTIONS, "#FFD700", 2.5);

  // 3. Face Details (Yellow/Orange)
  if (frame.face) {
    addConnections(frame.face, LEFT_EYE_CONNECTIONS, "#FFD700", 2);
    addConnections(frame.face, RIGHT_EYE_CONNECTIONS, "#FFD700", 2);
    addConnections(frame.face, MOUTH_CONNECTIONS, "#FFD700", 2);
  }

  // 4. Bridge: Connect Pose Wrists to Hand Wrists (Gold)
  const pose = frame.pose;
  if (pose && pose.length > 16) {
    // Left Hand Bridge (Pose 15 -> Left Hand 0)
    if (frame.left_hand && frame.left_hand.length > 0) {
      const a = toSvg(pose[15]);
      const b = toSvg(frame.left_hand[0]);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: "#D4AF37", width: 3 });
    }
    // Right Hand Bridge (Pose 16 -> Right Hand 0)
    if (frame.right_hand && frame.right_hand.length > 0) {
      const a = toSvg(pose[16]);
      const b = toSvg(frame.right_hand[0]);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: "#D4AF37", width: 3 });
    }
  }

  return (
    <g>
      {lines.map((line, i) => (
        <line
          key={`line-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeWidth={line.width}
          strokeLinecap="round"
        />
      ))}
      {/* Small dots for joints to make it feel connected */}
      {frame.pose?.map((p, i) => {
        const pt = toSvg(p);
        return <circle key={`pose-${i}`} cx={pt.x} cy={pt.y} r={2.5} fill="#D4AF37" />;
      })}
    </g>
  );
}

export function LandmarkSkeletonSvg({
  sequence,
  isPlaying,
  onFinish,
  width = 600,
  height = 600,
  className = "",
}: LandmarkSkeletonSvgProps) {
  const [currentFrame, setCurrentFrame] = useState<LandmarkFrame | null>(
    sequence[0] ?? null,
  );

  const sequenceBounds = useMemo(() => {
    if (!sequence || sequence.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    sequence.forEach(f => {
      [f.pose, f.left_hand, f.right_hand, f.face].forEach(pts => {
        pts?.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
      });
    });

    if (!Number.isFinite(minX)) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    
    const padX = (maxX - minX) * 0.1 || 0.1;
    const padY = (maxY - minY) * 0.1 || 0.1;

    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY
    };
  }, [sequence]);

  const startTimeRef = useRef<number>(0);
  const animRef = useRef<number>();
  const hasFinishedRef = useRef(false);

  const animate = useCallback(() => {
    if (!sequence || sequence.length === 0) return;

    const elapsedMs = performance.now() - startTimeRef.current;
    const lastTs = sequence[sequence.length - 1]?.timestamp_ms ?? 0;
    const totalDurationMs = Math.max(lastTs, 500);

    if (elapsedMs >= totalDurationMs) {
      setCurrentFrame(sequence[sequence.length - 1]);
      if (onFinish && !hasFinishedRef.current) {
        hasFinishedRef.current = true;
        onFinish();
      }
      return;
    }

    const timeMs = Math.min(elapsedMs, totalDurationMs - 1);
    let frame: LandmarkFrame;

    if (sequence.length === 1) {
      frame = sequence[0];
    } else {
      let idx = 0;
      while (
        idx < sequence.length - 1 &&
        sequence[idx + 1].timestamp_ms <= timeMs
      ) {
        idx++;
      }
      if (idx >= sequence.length - 1) {
        frame = sequence[sequence.length - 1];
      } else {
        const a = sequence[idx];
        const b = sequence[idx + 1];
        const span = b.timestamp_ms - a.timestamp_ms;
        const t = span > 0 ? (timeMs - a.timestamp_ms) / span : 1;
        frame = interpolateFrame(a, b, t);
      }
    }
    setCurrentFrame(frame);
    animRef.current = requestAnimationFrame(animate);
  }, [sequence, onFinish]);

  useEffect(() => {
    if (isPlaying && sequence?.length > 0) {
      hasFinishedRef.current = false;
      startTimeRef.current = performance.now();
      animate();
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (sequence?.length > 0) setCurrentFrame(sequence[0]);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, sequence, animate]);

  if (!sequence || sequence.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-[#f9f9f9] w-full h-[300px] ${className}`}
      >
        <p className="text-sm text-gray-400">Waiting for message motion...</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center relative bg-white ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block max-w-2xl"
      >
        {currentFrame ? (
          <SkeletonPaths 
            frame={currentFrame} 
            width={width} 
            height={height} 
            bounds={sequenceBounds}
          />
        ) : null}
      </svg>
    </div>
  );
}
