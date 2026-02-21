/**
 * Convert LandmarkFrame[] to BoneRotationFrame[] using Kalidokit
 * (Pose.solve, Hand.solve, Face.solve) for Ready Player Me–compatible output.
 */

import { Pose, Hand, Face } from "kalidokit";
import type { LandmarkFrame, Vec3 } from "@/lib/text-to-sign-types";
import type { BoneRotationFrame } from "@/components/bone-rotation-avatar";

/** RPM GLB bone names used by BoneRotationAvatar */
const BONE_MAP = {
  RightUpperArm: "RightArm",
  LeftUpperArm: "LeftArm",
  RightLowerArm: "RightForeArm",
  LeftLowerArm: "LeftForeArm",
  RightHand: "RightHand",
  LeftHand: "LeftHand",
} as const;

function toXYZ(o: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  return { x: o.x, y: o.y, z: o.z };
}

/** MediaPipe pose needs at least 25 points (indices 0–24); pose has 33. */
function ensurePoseFormat(pose: Vec3[] | null): Vec3[] | null {
  if (!pose || pose.length < 25) return null;
  return pose;
}

/**
 * Convert a single LandmarkFrame to one BoneRotationFrame using Kalidokit.
 * Uses pose for Pose.solve; left_hand -> Hand.solve(..., "Left"), right_hand -> "Right"; face for Face.solve (optional).
 */
export function landmarkFrameToBoneRotationsKalidokit(frame: LandmarkFrame): BoneRotationFrame {
  const boneRotations: Record<string, { x: number; y: number; z: number }> = {};
  const pose = ensurePoseFormat(frame.pose);

  if (pose) {
    // Pose.solve(lm3d, lm2d, options). Use same array for both; Kalidokit uses lm3d for calcs, lm2d for visibility.
    const lm2d = pose.map((p) => ({ x: p.x, y: p.y, z: 0 }));
    try {
      const poseRig = Pose.solve(
        pose as unknown as Array<{ x: number; y: number; z: number; visibility?: number }>,
        lm2d as unknown as Array<{ x: number; y: number; z: number }>,
        {
        runtime: "mediapipe",
        video: null,
        imageSize: null,
        enableLegs: false,
      });
      if (poseRig) {
        boneRotations[BONE_MAP.RightUpperArm] = toXYZ(poseRig.RightUpperArm);
        boneRotations[BONE_MAP.LeftUpperArm] = toXYZ(poseRig.LeftUpperArm);
        boneRotations[BONE_MAP.RightLowerArm] = toXYZ(poseRig.RightLowerArm);
        boneRotations[BONE_MAP.LeftLowerArm] = toXYZ(poseRig.LeftLowerArm);
        boneRotations[BONE_MAP.RightHand] = toXYZ(poseRig.RightHand);
        boneRotations[BONE_MAP.LeftHand] = toXYZ(poseRig.LeftHand);
      }
    } catch (_) {
      // ignore single-frame solve errors
    }
  }

  // Optional: override hand from Hand.solve for finer finger motion (RPM may use same bone names)
  const leftHand = frame.left_hand && frame.left_hand.length >= 21 ? frame.left_hand : null;
  const rightHand = frame.right_hand && frame.right_hand.length >= 21 ? frame.right_hand : null;
  try {
    if (rightHand) {
      const handRig = Hand.solve(rightHand as unknown as Array<{ x: number; y: number; z: number }>, "Right");
      if (handRig && handRig.RightWrist) boneRotations[BONE_MAP.RightHand] = toXYZ(handRig.RightWrist);
    }
    if (leftHand) {
      const handRig = Hand.solve(leftHand as unknown as Array<{ x: number; y: number; z: number }>, "Left");
      if (handRig && handRig.LeftWrist) boneRotations[BONE_MAP.LeftHand] = toXYZ(handRig.LeftWrist);
    }
  } catch (_) {
    // keep pose-derived hands if Hand.solve fails
  }

  return {
    type: "pose",
    boneRotations,
    duration_ms: 0,
  };
}

/**
 * Convert LandmarkFrame[] to BoneRotationFrame[] with duration_ms from timestamp deltas.
 */
export function landmarkSequenceToBoneSequenceKalidokit(sequence: LandmarkFrame[]): BoneRotationFrame[] {
  if (!sequence || sequence.length === 0) return [];
  if (sequence.length === 1) {
    const single = landmarkFrameToBoneRotationsKalidokit(sequence[0]);
    return [{ ...single, duration_ms: 500 }];
  }

  const steps: BoneRotationFrame[] = [];
  for (let i = 0; i < sequence.length; i++) {
    const frame = sequence[i];
    const next = sequence[i + 1];
    const base = landmarkFrameToBoneRotationsKalidokit(frame);
    const duration =
      next && typeof next.timestamp_ms === "number"
        ? Math.max(next.timestamp_ms - frame.timestamp_ms, 30)
        : 300;
    steps.push({ ...base, duration_ms: duration });
  }
  return steps;
}
