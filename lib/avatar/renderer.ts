/**
 * renderer.ts — PixiJS 2D scene for landmark-based avatar animation.
 * Human-like upper body avatar with skin-toned fills, rounded joints,
 * and clear hand rendering.
 */
import { Application, Graphics } from 'pixi.js';
import {
  POSE_CONNECTIONS, HAND_CONNECTIONS,
  FACE_LIPS_OUTER, FACE_LEFT_EYE, FACE_RIGHT_EYE,
  STYLE, getPoseConnectionStyle,
} from './skeleton';

// Global polyfill to prevent PixiJS 8 crash during destruction if ResizePlugin fails
if (typeof Application !== 'undefined' && !(Application.prototype as any)._cancelResize) {
  (Application.prototype as any)._cancelResize = () => {};
}

export let app: Application | null = null;
export let gfx: Graphics | null = null;

// ── Color palette ──
const SKIN     = 0xF5CBA7;   // warm skin
const SKIN_LT  = 0xFADDBE;   // lighter skin for fills
const OUTLINE  = 0xC49A6C;   // darker outline
const HAIR_CLR = 0x4A3728;   // dark brown hair
const LIP_CLR  = 0xD4736A;   // lips
const EYE_CLR  = 0x3D3D3D;   // eyes
const SHIRT    = 0x5B86E5;   // shirt / torso fill
const SHIRT_DK = 0x4268B8;   // shirt outline

// ── Hair physics ──
class HairStrand {
  points: { x: number; y: number }[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  velocity = { x: 0, y: 0 };
  friction = 0.85;
  gravity = 0.5;
  hairLength: number;

  constructor(hairLength = 30) {
    this.hairLength = hairLength;
  }

  update(rootX: number, rootY: number) {
    const tip = this.points[1];
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    tip.x += this.velocity.x;
    tip.y += this.velocity.y;

    const dx = tip.x - rootX;
    const dy = tip.y - rootY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.hairLength) {
      const a = Math.atan2(dy, dx);
      tip.x = rootX + Math.cos(a) * this.hairLength;
      tip.y = rootY + Math.sin(a) * this.hairLength;
    }
    this.points[0] = { x: rootX, y: rootY };
  }
}

const hairStrands: HairStrand[] = [];
const NUM_HAIRS = 10;

const handleResize = () => {
  if (app && app.renderer && containerRef) {
    app.renderer.resize(containerRef.clientWidth, containerRef.clientHeight);
  }
};

let initPromise: Promise<void> | null = null;
let containerRef: HTMLElement | null = null;

export async function initRenderer(container: HTMLElement) {
  if (initPromise) return initPromise;
  containerRef = container;

  initPromise = (async () => {
    app = new Application();
    (app as any)._cancelResize = () => {};
    await app.init({
      background: 0xffffff,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    if (!initPromise) return;

    container.appendChild(app.canvas);
    window.addEventListener('resize', handleResize);

    hairStrands.length = 0;
    for (let i = 0; i < NUM_HAIRS; i++) {
      hairStrands.push(new HairStrand(28 + Math.random() * 10));
    }

    gfx = new Graphics();
    app.stage.addChild(gfx);
  })();

  return initPromise;
}

// ── Drawing helpers ──
function lerp(a: any, b: any, t: number) {
  if (!a || !b) return null;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function dist(a: any, b: any): number {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function drawFrame(data: { pose: any[]; leftHand: any[]; rightHand: any[]; face: any[] }) {
  if (!gfx || !app) return;
  gfx.clear();

  const { pose, leftHand, rightHand, face } = data;

  if (pose && pose.length > 0) {
    // ── 1. TORSO (filled shirt shape) ──
    const lShoulder = pose[11];
    const rShoulder = pose[12];
    const lHip = pose[23];
    const rHip = pose[24];

    if (lShoulder && rShoulder && lHip && rHip) {
      // Slight outward bulge for shoulder width
      const shoulderPad = dist(lShoulder, rShoulder) * 0.12;

      gfx.moveTo(lShoulder.x - shoulderPad, lShoulder.y)
        .lineTo(rShoulder.x + shoulderPad, rShoulder.y)
        .lineTo(rHip.x + shoulderPad * 0.4, rHip.y)
        .lineTo(lHip.x - shoulderPad * 0.4, lHip.y)
        .closePath()
        .fill({ color: SHIRT, alpha: 0.85 })
        .stroke({ color: SHIRT_DK, width: 3, cap: 'round', join: 'round' });
    }

    // ── 2. ARMS (rounded limbs with skin tone) ──
    // Right arm: shoulder(12) → elbow(14) → wrist(16)
    drawLimb(gfx, pose[12], pose[14], 10, SKIN, OUTLINE);
    drawLimb(gfx, pose[14], pose[16], 8, SKIN, OUTLINE);

    // Left arm
    drawLimb(gfx, pose[11], pose[13], 10, SKIN, OUTLINE);
    drawLimb(gfx, pose[13], pose[15], 8, SKIN, OUTLINE);

    // Joint circles at elbows and wrists
    [pose[13], pose[14]].forEach(p => {
      if (p) {
        gfx!.circle(p.x, p.y, 6).fill({ color: SKIN }).stroke({ color: OUTLINE, width: 1.5 });
      }
    });
    // Wrist circles (slightly larger)
    [pose[15], pose[16]].forEach(p => {
      if (p) {
        gfx!.circle(p.x, p.y, 7).fill({ color: SKIN }).stroke({ color: OUTLINE, width: 1.5 });
      }
    });

    // ── 3. HEAD ──
    const nose = pose[0];
    if (nose) {
      const headR = lShoulder && rShoulder ? dist(lShoulder, rShoulder) * 0.42 : 40;

      // Filled head circle
      gfx.circle(nose.x, nose.y, headR)
        .fill({ color: SKIN_LT })
        .stroke({ color: OUTLINE, width: 3 });

      // Hair (physics-based strands on top half)
      hairStrands.forEach((hair, i) => {
        const angle = (i / (NUM_HAIRS - 1)) * Math.PI + Math.PI; // top semicircle
        const rootX = nose.x + Math.cos(angle) * headR;
        const rootY = nose.y + Math.sin(angle) * headR;

        hair.update(rootX, rootY);
        gfx!.moveTo(hair.points[0].x, hair.points[0].y)
          .lineTo(hair.points[1].x, hair.points[1].y)
          .stroke({ color: HAIR_CLR, width: 4, cap: 'round' });
      });

      // Neck
      if (lShoulder && rShoulder) {
        const neckBase = lerp(lShoulder, rShoulder, 0.5);
        if (neckBase) {
          drawLimb(gfx, nose, neckBase, 8, SKIN_LT, OUTLINE);
        }
      }

      // Facial features
      if (face) {
        drawClosedPath(gfx, face, FACE_LIPS_OUTER, LIP_CLR, 2.5);
        drawClosedPath(gfx, face, FACE_LEFT_EYE, EYE_CLR, 2);
        drawClosedPath(gfx, face, FACE_RIGHT_EYE, EYE_CLR, 2);
      }
    }
  }

  // ── 4. HANDS (always visible, with finger detail) ──
  drawHand(gfx!, leftHand, SKIN, OUTLINE);
  drawHand(gfx!, rightHand, SKIN, OUTLINE);
}

/** Draw a rounded limb segment between two points */
function drawLimb(g: Graphics, a: any, b: any, thickness: number, fill: number, stroke: number) {
  if (!a || !b) return;
  g.moveTo(a.x, a.y).lineTo(b.x, b.y)
    .stroke({ color: fill, width: thickness, cap: 'round' });
  // Thin outline on top
  g.moveTo(a.x, a.y).lineTo(b.x, b.y)
    .stroke({ color: stroke, width: thickness + 2, cap: 'round', alpha: 0.2 });
}

/** Draw a hand with finger bones and filled palm and fingertip dots */
function drawHand(g: Graphics, hand: any[], fill: number, outline: number) {
  if (!hand || hand.length === 0) return;

  // Palm fill (connect wrist → finger bases)
  const wrist = hand[0];
  const palmIndices = [0, 1, 5, 9, 13, 17];
  if (wrist) {
    let started = false;
    for (const idx of palmIndices) {
      const pt = hand[idx];
      if (!pt) continue;
      if (!started) { g.moveTo(pt.x, pt.y); started = true; }
      else g.lineTo(pt.x, pt.y);
    }
    if (started) {
      g.closePath().fill({ color: fill, alpha: 0.7 });
    }
  }

  // Finger bones
  for (const [i, j] of HAND_CONNECTIONS) {
    if (hand[i] && hand[j]) {
      g.moveTo(hand[i].x, hand[i].y).lineTo(hand[j].x, hand[j].y)
        .stroke({ color: outline, width: 3, cap: 'round' });
    }
  }

  // Fingertip dots (indices 4, 8, 12, 16, 20)
  const fingertips = [4, 8, 12, 16, 20];
  for (const idx of fingertips) {
    const pt = hand[idx];
    if (pt) {
      g.circle(pt.x, pt.y, 4)
        .fill({ color: fill })
        .stroke({ color: outline, width: 1.5 });
    }
  }

  // Joint dots on knuckles
  const knuckles = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19];
  for (const idx of knuckles) {
    const pt = hand[idx];
    if (pt) {
      g.circle(pt.x, pt.y, 2.5).fill({ color: fill });
    }
  }
}

function drawClosedPath(g: Graphics, points: any[], indices: number[], color: number, width: number) {
  let started = false;
  for (const idx of indices) {
    const pt = points[idx];
    if (!pt) continue;
    if (!started) { g.moveTo(pt.x, pt.y); started = true; }
    else g.lineTo(pt.x, pt.y);
  }
  g.stroke({ color, width, cap: 'round', join: 'round' });
}

export function getCanvasSize(container: HTMLElement) {
  return { w: container.clientWidth, h: container.clientHeight };
}

export function destroyRenderer() {
  window.removeEventListener('resize', handleResize);
  const currentApp = app;
  initPromise = null;
  app = null;
  gfx = null;
  containerRef = null;

  if (currentApp) {
    try {
      currentApp.ticker.stop();
      if (!(currentApp as any)._cancelResize) {
        (currentApp as any)._cancelResize = () => {};
      }
      currentApp.destroy({ removeView: true });
    } catch (e) {
      console.warn('PixiJS destroy error (suppressed):', e);
    }
  }
}
