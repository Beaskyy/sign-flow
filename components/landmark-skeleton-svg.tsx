"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { LandmarkFrame, Vec3 } from "@/lib/text-to-sign-types";
import {
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
} from "@/lib/mediapipe-connections";

interface LandmarkSkeletonSvgProps {
  sequence: LandmarkFrame[];
  isPlaying: boolean;
  onFinish?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

const PADDING_RATIO = 0.15;
const NORMALIZED_SCALE = 0.6;
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

/** Map normalized 0–1 (x,y) to SVG user space with padding and scale. */
function toSvg(
  p: Vec3,
  width: number,
  height: number,
): { x: number; y: number } {
  const innerW = width * (1 - PADDING_RATIO * 2);
  const innerH = height * (1 - PADDING_RATIO * 2);
  const offsetX = width * PADDING_RATIO;
  const offsetY = height * PADDING_RATIO;
  const sx = CENTER + (p.x - CENTER) * NORMALIZED_SCALE;
  const sy = CENTER + (p.y - CENTER) * NORMALIZED_SCALE;
  return {
    x: offsetX + sx * innerW,
    y: offsetY + (1 - sy) * innerH, // flip Y so figure is right-side up (head at top)
  };
}

function SkeletonPaths({
  frame,
  width,
  height,
}: {
  frame: LandmarkFrame;
  width: number;
  height: number;
}) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const points: { x: number; y: number }[] = [];

  const addConnections = (
    pts: Vec3[] | null,
    connections: [number, number][],
  ) => {
    if (!pts || pts.length === 0) return;
    connections.forEach(([i, j]) => {
      if (i < pts.length && j < pts.length) {
        const a = toSvg(pts[i], width, height);
        const b = toSvg(pts[j], width, height);
        lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    });
    pts.forEach((p) => points.push(toSvg(p, width, height)));
  };

  addConnections(frame.pose, POSE_CONNECTIONS);
  addConnections(frame.left_hand, HAND_CONNECTIONS);
  addConnections(frame.right_hand, HAND_CONNECTIONS);

  const strokeColor = "#B8860B";
  const jointColor = "#1a1a1a";
  const strokeWidth = 2;
  const r = 2;

  return (
    <g>
      {lines.map((line, i) => (
        <line
          key={`line-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
      {points.map((pt, i) => (
        <circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r={r} fill={jointColor} />
      ))}
    </g>
  );
}

export function LandmarkSkeletonSvg({
  sequence,
  isPlaying,
  onFinish,
  width = 400,
  height = 400,
  className = "",
}: LandmarkSkeletonSvgProps) {
  const [currentFrame, setCurrentFrame] = useState<LandmarkFrame | null>(
    sequence[0] ?? null,
  );
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

  if (!sequence?.length) {
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
    <div
      className={`w-full h-full max-h-[400px] rotate-180 ${className}`}
      style={{ background: "#E8E8E8" }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        style={{ minHeight: 480 }}
      >
        {currentFrame && (
          <SkeletonPaths frame={currentFrame} width={width} height={height} />
        )}
      </svg>
    </div>
  );
}
