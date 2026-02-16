import type { LandmarkFrame, Vec3 } from "@/lib/text-to-sign-types";
import type { BoneRotationFrame } from "@/components/bone-rotation-avatar";

const MP_POSE = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
} as const;

function vecSub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vecNormalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// Convert a direction vector into simple Euler angles (approximate but visually reasonable)
function dirToEuler(v: Vec3): { x: number; y: number; z: number } {
  // Assume avatar forward is -Z, up is +Y
  const yaw = Math.atan2(v.x, -v.z);     // rotate around Y to turn left/right
  const pitch = Math.asin(v.y);          // rotate around X to raise/lower
  const roll = 0;                        // keep roll zero for now
  return { x: pitch, y: yaw, z: roll };
}

export function landmarkFrameToBoneRotations(frame: LandmarkFrame): BoneRotationFrame {
  const pose = frame.pose;
  const boneRotations: Record<string, { x: number; y: number; z: number }> = {};

  if (pose && pose.length > Math.max(MP_POSE.RIGHT_WRIST, MP_POSE.LEFT_WRIST)) {
    const lShoulder = pose[MP_POSE.LEFT_SHOULDER];
    const lElbow = pose[MP_POSE.LEFT_ELBOW];
    const lWrist = pose[MP_POSE.LEFT_WRIST];
    const rShoulder = pose[MP_POSE.RIGHT_SHOULDER];
    const rElbow = pose[MP_POSE.RIGHT_ELBOW];
    const rWrist = pose[MP_POSE.RIGHT_WRIST];

    // Upper arms: shoulder → elbow
    const leftUpperDir = vecNormalize(vecSub(lElbow, lShoulder));
    const rightUpperDir = vecNormalize(vecSub(rElbow, rShoulder));

    // Forearms: elbow → wrist
    const leftForeDir = vecNormalize(vecSub(lWrist, lElbow));
    const rightForeDir = vecNormalize(vecSub(rWrist, rElbow));

    boneRotations.LeftArm = dirToEuler(leftUpperDir);
    boneRotations.RightArm = dirToEuler(rightUpperDir);
    boneRotations.LeftForeArm = dirToEuler(leftForeDir);
    boneRotations.RightForeArm = dirToEuler(rightForeDir);

    // Hands: follow forearm for now
    boneRotations.LeftHand = dirToEuler(leftForeDir);
    boneRotations.RightHand = dirToEuler(rightForeDir);
  }

  // Derive duration from timestamps; actual value will be set by the sequence converter
  return {
    type: "pose",
    boneRotations,
    duration_ms: 0,
  };
}

export function landmarkSequenceToBoneSequence(sequence: LandmarkFrame[]): BoneRotationFrame[] {
  if (!sequence || sequence.length === 0) return [];
  if (sequence.length === 1) {
    const single = landmarkFrameToBoneRotations(sequence[0]);
    return [{ ...single, duration_ms: 500 }];
  }

  const steps: BoneRotationFrame[] = [];

  for (let i = 0; i < sequence.length; i++) {
    const frame = sequence[i];
    const next = sequence[i + 1];
    const base = landmarkFrameToBoneRotations(frame);
    // Use timestamp difference as duration; fall back to 300ms
    const duration =
      next && typeof next.timestamp_ms === "number"
        ? Math.max(next.timestamp_ms - frame.timestamp_ms, 30)
        : 300;

    steps.push({
      ...base,
      duration_ms: duration,
    });
  }

  return steps;
}

