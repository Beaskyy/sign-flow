/**
 * animator.ts — Controls landmark playback and scaling.
 */
import { drawFrame, getCanvasSize } from './renderer';

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface Frame {
  timestamp_ms?: number;
  pose: Landmark[];
  left_hand?: Landmark[];
  right_hand?: Landmark[];
  face?: Landmark[];
}

let frames: Frame[] = [];
let currentFrameIdx = 0;
let isPlaying = false;
let speed = 1;
let lastUpdateTime = 0;
let onFrameChange: ((idx: number, total: number) => void) | null = null;

export function loadFrames(data: Frame[]) {
  frames = data;
  currentFrameIdx = 0;
  if (frames.length > 0) applyFrame(frames[0]);
}

export function play() {
  isPlaying = true;
  lastUpdateTime = performance.now();
}

export function pause() {
  isPlaying = false;
}

export function togglePlay(): boolean {
  isPlaying = !isPlaying;
  if (isPlaying) lastUpdateTime = performance.now();
  return isPlaying;
}

export function restart() {
  currentFrameIdx = 0;
  lastUpdateTime = performance.now();
  if (frames.length > 0) applyFrame(frames[0]);
}

export function seekTo(idx: number) {
  currentFrameIdx = Math.max(0, Math.min(idx, frames.length - 1));
  if (frames.length > 0) applyFrame(frames[currentFrameIdx]);
}

export function setSpeed(val: number) { speed = val; }
export function setOnFrameChange(cb: (idx: number, total: number) => void) { onFrameChange = cb; }
export function getFrameCount(): number { return frames.length; }
export function getCurrentFrame(): number { return currentFrameIdx; }

function applyFrame(frame: Frame) {
  if (!frame) return;

  const container = document.getElementById('pixi-container');
  if (!container) return;
  const { w, h } = getCanvasSize(container);

  const allLandmarks: Landmark[] = [];
  if (frame.pose) allLandmarks.push(...frame.pose);
  if (frame.left_hand) allLandmarks.push(...frame.left_hand);
  if (frame.right_hand) allLandmarks.push(...frame.right_hand);
  if (frame.face) allLandmarks.push(...frame.face);

  if (allLandmarks.length === 0) return;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const lm of allLandmarks) {
    if (!lm) continue;
    if (lm.x < minX) minX = lm.x;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.y > maxY) maxY = lm.y;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const padding = 60;
  const availW = w - padding * 2;
  const availH = h - padding * 2;
  const scale = Math.min(availW / rangeX, availH / rangeY);

  const cx = w / 2;
  const cy = h / 2;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  function toPixel(landmarks?: Landmark[]) {
    if (!landmarks || landmarks.length === 0) return null;
    return landmarks.map(lm => {
      if (!lm) return null;
      return {
        x: cx + (lm.x - midX) * scale,
        y: cy + (lm.y - midY) * scale,
        z: lm.z ?? 0,
      };
    });
  }

  drawFrame({
    pose: toPixel(frame.pose) || [],
    leftHand: toPixel(frame.left_hand) || [],
    rightHand: toPixel(frame.right_hand) || [],
    face: toPixel(frame.face) || [],
  });
}

export function tick() {
  if (!isPlaying || frames.length === 0) return;

  const now = performance.now();
  const deltaTime = (now - lastUpdateTime) * speed;

  let frameInterval = 33;
  if (frames.length > 1 && currentFrameIdx < frames.length - 1) {
    const t0 = frames[currentFrameIdx].timestamp_ms ?? 0;
    const t1 = frames[currentFrameIdx + 1].timestamp_ms ?? (t0 + 33);
    frameInterval = Math.max(t1 - t0, 16);
  }

  if (deltaTime >= frameInterval) {
    applyFrame(frames[currentFrameIdx]);
    if (onFrameChange) onFrameChange(currentFrameIdx, frames.length);

    currentFrameIdx++;
    if (currentFrameIdx >= frames.length) {
      currentFrameIdx = 0;
    }
    lastUpdateTime = now;
  }
}
