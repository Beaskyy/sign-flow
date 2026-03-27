/**
 * skeleton.ts — MediaPipe landmark connection definitions.
 */

export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12],  // shoulders
  [11, 23],  // left shoulder → left hip
  [12, 24],  // right shoulder → right hip
  [23, 24],  // hips

  // Right arm
  [12, 14],  // right shoulder → right elbow
  [14, 16],  // right elbow → right wrist

  // Left arm
  [11, 13],  // left shoulder → left elbow
  [13, 15],  // left elbow → left wrist

  // Right leg
  [24, 26],  // right hip → right knee
  [26, 28],  // right knee → right ankle
  [28, 32],  // right ankle → right foot index
  [28, 30],  // right ankle → right heel

  // Left leg
  [23, 25],  // left hip → left knee
  [25, 27],  // left knee → left ankle
  [27, 31],  // left ankle → left foot index
  [27, 29],  // left ankle → left heel
];

export const POSE_FACE_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
];

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
];

export const FACE_LIPS_OUTER = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  409, 270, 269, 267, 0, 37, 39, 40, 185, 61,
];

export const FACE_LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
  324, 318, 402, 317, 14, 87, 178, 88, 95, 78,
];

export const FACE_LEFT_EYE = [
  33, 7, 163, 144, 145, 153, 154, 155, 133,
  173, 157, 158, 159, 160, 161, 246, 33,
];

export const FACE_RIGHT_EYE = [
  362, 382, 381, 380, 374, 373, 390, 249, 263,
  466, 388, 387, 386, 385, 384, 398, 362,
];

export const FACE_LEFT_EYEBROW = [
  46, 53, 52, 65, 55, 107, 66, 105, 63, 70, 46,
];

export const FACE_RIGHT_EYEBROW = [
  276, 283, 282, 295, 285, 336, 296, 334, 293, 300, 276,
];

export const FACE_NOSE_BRIDGE = [168, 6, 197, 195, 5, 4, 1, 19];

export const STYLE = {
  torso:    { color: 0x6C63FF, width: 4, jointRadius: 4, jointColor: 0x9B8FFF },
  rightArm: { color: 0xFF6B6B, width: 3.5, jointRadius: 3.5, jointColor: 0xFF9E9E },
  leftArm:  { color: 0x4ECDC4, width: 3.5, jointRadius: 3.5, jointColor: 0x7EDDD7 },
  rightLeg: { color: 0xFF9F43, width: 3.5, jointRadius: 3.5, jointColor: 0xFFC078 },
  leftLeg:  { color: 0xF368E0, width: 3.5, jointRadius: 3.5, jointColor: 0xF79AEB },
  face:     { color: 0x7B73FF, width: 2, jointRadius: 2, jointColor: 0xAAAAFF },
  rightHand: { color: 0xFF8E8E, width: 2, jointRadius: 2, jointColor: 0xFFBBBB },
  leftHand:  { color: 0x6FE0D8, width: 2, jointRadius: 2, jointColor: 0xA0ECE6 },
  faceOval:    { color: 0x5A52CC, width: 1, alpha: 0.35 },
  faceLips:    { color: 0xE06080, width: 1.5, alpha: 0.6 },
  faceEyes:    { color: 0x88BBFF, width: 1.2, alpha: 0.6 },
  faceEyebrow: { color: 0x88BBFF, width: 1, alpha: 0.4 },
  faceNose:    { color: 0x7B73FF, width: 1, alpha: 0.35 },
};

export function getPoseConnectionStyle(i: number, j: number) {
  if ((i === 11 && j === 12) || (i === 23 && j === 24) ||
      (i === 11 && j === 23) || (i === 12 && j === 24)) return STYLE.torso;
  if ((i === 12 && j === 14) || (i === 14 && j === 16)) return STYLE.rightArm;
  if ((i === 11 && j === 13) || (i === 13 && j === 15)) return STYLE.leftArm;
  if (i === 24 || (i === 26) || (i === 28 && (j === 30 || j === 32))) return STYLE.rightLeg;
  if (i === 23 || (i === 25) || (i === 27 && (j === 29 || j === 31))) return STYLE.leftLeg;
  return STYLE.torso;
}
