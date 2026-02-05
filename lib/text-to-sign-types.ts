/**
 * Text-to-Sign API types (LandmarkFrame format - v2.0)
 * Based on MediaPipe landmark structure
 */

export interface Vec3 {
  x: number; // 0.0 to 1.0, normalized
  y: number; // 0.0 to 1.0, normalized
  z: number; // Depth, typically -1.0 to 1.0
}

export interface LandmarkFrame {
  timestamp_ms: number;
  pose: Vec3[] | null;
  left_hand: Vec3[] | null;
  right_hand: Vec3[] | null;
  face: Vec3[] | null;
}

export interface MotionSequence {
  sequence: LandmarkFrame[];
}

/** WebSocket event: text_to_sign_completed */
export interface TextToSignCompletedEvent {
  type: "text_to_sign_completed";
  translation_id: string;
  text_input: string;
  status: "completed";
  user_id: string;
  conversation_id: string;
  conversation_message_id: string;
  created_at: string;
  completed_at: string;
  message: string;
  pose_count: number;
  glosses: string[];
  gloss_description?: string; // Optional, may be included
  motion_sequence: MotionSequence;
}

/** REST API: GET message details response */
export interface TextToSignMessageDetail {
  message_id: string;
  conversation_id: string;
  message_type: "text_to_sign";
  translation_type: "text_to_sign";
  status: "completed" | "pending" | "failed";
  input_preview: string;
  output_preview: string;
  text_input: string;
  translation_id: string;
  glosses: string[];
  gloss_description: string;
  motion_sequence: MotionSequence;
  sign_descriptions: MotionSequence;
  pose_count: number;
  processing_time: number;
  created_at: string;
  completed_at: string;
}

/** Type guard: check if frame uses new LandmarkFrame format */
export function isLandmarkFrame(frame: unknown): frame is LandmarkFrame {
  if (!frame || typeof frame !== "object") return false;
  const f = frame as Record<string, unknown>;
  return "timestamp_ms" in f && ("pose" in f || "left_hand" in f || "right_hand" in f || "face" in f);
}

/** Type guard: check if frame uses old boneRotations format (legacy) */
export function isLegacyFrame(frame: unknown): frame is { boneRotations?: Record<string, unknown>; duration_ms?: number } {
  if (!frame || typeof frame !== "object") return false;
  const f = frame as Record<string, unknown>;
  return "boneRotations" in f;
}
