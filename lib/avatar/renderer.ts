/**
 * renderer.ts — PixiJS 2D scene for landmark-based avatar animation.
 * Using "p5" variant (Reactive Stick Man with hair physics).
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

let app: Application | null = null;
let gfx: Graphics | null = null;

// Physics state for hair
class HairStrand {
  points: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  velocity = { x: 0, y: 0 };
  friction = 0.85;
  gravity = 0.5;
  hairLength = 25;

  constructor(hairLength = 25) {
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
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.hairLength) {
      const angle = Math.atan2(dy, dx);
      tip.x = rootX + Math.cos(angle) * this.hairLength;
      tip.y = rootY + Math.sin(angle) * this.hairLength;
    }

    this.points[0] = { x: rootX, y: rootY };
  }
}

const hairStrands: HairStrand[] = [];
const NUM_HAIRS = 8;

const handleResize = () => {
  if (app && containerRef) {
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
    // Polyfill to prevent PixiJS 8 crash during destruction if ResizePlugin fails
    (app as any)._cancelResize = () => {}; 
    await app.init({
      background: 0x0b0d11,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    if (!initPromise) return; // If destroyed while initing

    container.appendChild(app.canvas);
    window.addEventListener('resize', handleResize);

    // Initialize hair strands
    hairStrands.length = 0;
    for (let i = 0; i < NUM_HAIRS; i++) {
      hairStrands.push(new HairStrand());
    }

    const gridGfx = new Graphics();
    drawGrid(gridGfx, container.clientWidth, container.clientHeight);
    app.stage.addChild(gridGfx);

    gfx = new Graphics();
    app.stage.addChild(gfx);
  })();

  return initPromise;
}

function drawGrid(g: Graphics, w: number, h: number) {
  const step = 40;
  for (let x = 0; x < w; x += step) {
    g.moveTo(x, 0).lineTo(x, h).stroke({ color: 0x151528, width: 1 });
  }
  for (let y = 0; y < h; y += step) {
    g.moveTo(0, y).lineTo(w, y).stroke({ color: 0x151528, width: 1 });
  }
}

export function drawFrame(data: { pose: any[], leftHand: any[], rightHand: any[], face: any[] }) {
  if (!gfx) return;
  gfx.clear();

  const { pose, leftHand, rightHand, face } = data;

  if (pose && pose.length > 0) {
    // 1. BODY
    for (const [i, j] of POSE_CONNECTIONS) {
      if (pose[i] && pose[j]) {
        const s = getPoseConnectionStyle(i, j);
        gfx.moveTo(pose[i].x, pose[i].y).lineTo(pose[j].x, pose[j].y)
           .stroke({ color: 0xFFFFFF, width: 12, cap: 'round' });
      }
    }

    // 2. HEAD & PHYSICS HAIR
    const nose = pose[0];
    if (nose) {
      gfx.circle(nose.x, nose.y, 50).stroke({ color: 0xFFFFFF, width: 6 });

      // Update and draw hair
      hairStrands.forEach((hair, i) => {
        const angle = (i / (NUM_HAIRS - 1)) * Math.PI + Math.PI;
        const rootX = nose.x + Math.cos(angle) * 50;
        const rootY = nose.y + Math.sin(angle) * 50;
        
        hair.update(rootX, rootY);
        gfx!.moveTo(hair.points[0].x, hair.points[0].y)
           .lineTo(hair.points[1].x, hair.points[1].y)
           .stroke({ color: 0xFFFFFF, width: 4, cap: 'round' });
      });

      if (face) {
        drawClosedPath(gfx, face, FACE_LIPS_OUTER, 0xFFFFFF, 4);
        drawClosedPath(gfx, face, FACE_LEFT_EYE, 0xFFFFFF, 2);
        drawClosedPath(gfx, face, FACE_RIGHT_EYE, 0xFFFFFF, 2);
      }
    }
  }

  // 3. HANDS
  [leftHand, rightHand].forEach(hand => {
    if (hand) {
      for (const [i, j] of HAND_CONNECTIONS) {
        if (hand[i] && hand[j]) {
          gfx!.moveTo(hand[i].x, hand[i].y).lineTo(hand[j].x, hand[j].y)
             .stroke({ color: 0xFFFFFF, width: 4, cap: 'round' });
        }
      }
    }
  });
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
      // Ensure the polyfill is on the instance as well
      if (!(currentApp as any)._cancelResize) {
        (currentApp as any)._cancelResize = () => {};
      }
      currentApp.destroy({
        removeView: true,
      });
    } catch (e) {
      console.warn('PixiJS destroy error (suppressed):', e);
    }
  }
}
