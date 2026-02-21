/**
 * MediaPipe landmark connections for skeleton rendering
 * Pose: 33 landmarks (0=nose, 1–10=face/ears/mouth, 11–12=shoulders, 13–16=elbows/wrists, 17–22=hands, 23–28=hips/knees/ankles, 29–32=heels/feet)
 * Hands: 21 landmarks each
 */

/** MediaPipe Pose - pairs of landmark indices to connect (official order: face first, then body) */
export const POSE_CONNECTIONS: [number, number][] = [
  // Head / face (0–10): nose, eyes, ears, mouth
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 7],
  [6, 8],
  [7, 9],
  [8, 10],
  [9, 10],
  [5, 6],
  [0, 9],
  [0, 10], // nose to mouth corners
  // Shoulders and arms
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  // Torso and legs
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  // Wrists to hand landmarks
  [15, 17],
  [15, 19],
  [15, 21],
  [16, 18],
  [16, 20],
  [16, 22],
  [17, 19],
  [18, 20],
];

/** MediaPipe Hands - 21 landmarks per hand */
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // index
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // middle
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // ring
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // pinky
  [5, 9],
  [9, 13],
  [13, 17], // palm
];
