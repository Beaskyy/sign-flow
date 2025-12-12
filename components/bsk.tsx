"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three-stdlib";
import gsap from "gsap";

type SequenceItem =
  | { type: "sign"; id: string; duration_ms?: number }
  | { type: "fingerspell"; text: string; duration_ms?: number };

export default function TextToSignPlayer({
  avatarUrl = "https://models.readyplayer.me/69360640347390125d578f7f.glb",
  apiEndpoint = "/api/translate",
}: {
  avatarUrl?: string;
  apiEndpoint?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const avatarRef = useRef<THREE.Object3D | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("idle");

  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);

    containerRef.current.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);

    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.4, 0);
    controls.update();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    function animate() {
      requestAnimationFrame(animate);
      const mixer = mixerRef.current;
      const delta = Math.min(
        0.05,
        (performance.now() - (animate as any).last || 16) / 1000
      );
      (animate as any).last = performance.now();
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;
      const w = containerRef.current.clientWidth;
      const h = height;
      cameraRef.current!.aspect = w / h;
      cameraRef.current!.updateProjectionMatrix();
      rendererRef.current!.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Load avatar
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setStatus("loading avatar");
    const loader = new GLTFLoader();
    loader.load(
      avatarUrl,
      (gltf) => {
        if (avatarRef.current) scene.remove(avatarRef.current);

        const avatar = gltf.scene;
        avatar.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            (c as THREE.Mesh).castShadow = true;
            (c as THREE.Mesh).receiveShadow = true;
          }
        });
        avatar.position.set(0, 0, 0);
        scene.add(avatar);
        avatarRef.current = avatar;

        mixerRef.current = new THREE.AnimationMixer(avatar);

        setIsReady(true);
        setStatus("ready");
      },
      undefined,
      (err) => {
        console.error("Avatar load error", err);
        setStatus("error loading avatar");
      }
    );
  }, [avatarUrl]);

  // --- Fingerspelling poses ---
  const letterPoses: Record<string, { rightHandZ?: number; rightArmX?: number }> =
    {
      A: { rightHandZ: 0.1, rightArmX: -0.5 },
      B: { rightHandZ: 0.5, rightArmX: -0.8 },
      C: { rightHandZ: -0.5, rightArmX: -0.6 },
      D: { rightHandZ: 0, rightArmX: -0.4 },
      E: { rightHandZ: 0.2, rightArmX: -0.5 },
      F: { rightHandZ: -0.2, rightArmX: -0.5 },
      G: { rightHandZ: -0.3, rightArmX: -0.6 },
      H: { rightHandZ: 0.4, rightArmX: -0.7 },
      I: { rightHandZ: -0.1, rightArmX: -0.6 },
      J: { rightHandZ: 0.3, rightArmX: -0.7 },
      K: { rightHandZ: 0.2, rightArmX: -0.6 },
      L: { rightHandZ: 0.1, rightArmX: -0.5 },
      M: { rightHandZ: -0.2, rightArmX: -0.5 },
      N: { rightHandZ: 0.1, rightArmX: -0.6 },
      O: { rightHandZ: 0, rightArmX: -0.6 },
      P: { rightHandZ: 0.3, rightArmX: -0.7 },
      Q: { rightHandZ: -0.3, rightArmX: -0.7 },
      R: { rightHandZ: 0.2, rightArmX: -0.6 },
      S: { rightHandZ: -0.1, rightArmX: -0.5 },
      T: { rightHandZ: 0, rightArmX: -0.5 },
      U: { rightHandZ: 0.4, rightArmX: -0.6 },
      V: { rightHandZ: 0.5, rightArmX: -0.6 },
      W: { rightHandZ: 0.6, rightArmX: -0.6 },
      X: { rightHandZ: 0.1, rightArmX: -0.4 },
      Y: { rightHandZ: 0.3, rightArmX: -0.5 },
      Z: { rightHandZ: 0.2, rightArmX: -0.5 },
    };

  function applyLetterSmooth(letter: string, duration = 0.4) {
    const avatar = avatarRef.current;
    if (!avatar) return;

    const upper = letter.toUpperCase();
    const pose = letterPoses[upper];
    if (!pose) return;

    const rightArm = avatar.getObjectByName("RightArm") as THREE.Bone;
    const rightHand = avatar.getObjectByName("RightHand") as THREE.Bone;
    if (!rightArm || !rightHand) return;

    // Smoothly animate rotation with GSAP
    gsap.to(rightArm.rotation, { x: pose.rightArmX ?? 0, duration });
    gsap.to(rightHand.rotation, { z: pose.rightHandZ ?? 0, duration });
  }

  function wait(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function playTextAsSigns(text: string) {
    if (!isReady) return setStatus("not ready");

    setStatus("fetching sequence");
    try {
      const res = await fetch(`${apiEndpoint}?text=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error("Bad response");
      const data = (await res.json()) as { sequence: SequenceItem[] };
      const seq = data.sequence || [];

      setStatus("playing");
      for (const item of seq) {
        if (item.type === "sign") {
          setStatus(`playing sign: ${item.id}`);
          await wait(item.duration_ms || 1000);
        } else if (item.type === "fingerspell") {
          for (const char of item.text) {
            setStatus(`fingerspelling: ${char}`);
            applyLetterSmooth(char);
            await wait(500);
          }
        }
      }
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <div className="flex gap-4 items-center mb-4">
        <input
          id="text-input"
          placeholder="Type text to translate to signs"
          className="flex-1 p-2 border rounded"
        />
        <button
          className="px-4 py-2 bg-sky-600 text-white rounded"
          onClick={() => {
            const input = document.getElementById(
              "text-input"
            ) as HTMLInputElement | null;
            if (!input) return;
            playTextAsSigns(input.value.trim());
          }}
        >
          Play
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full rounded bg-gray-50"
        style={{ minHeight: 480 }}
      />
      <div className="mt-3 text-sm text-gray-600">
        Status: {status} {isReady ? "(avatar loaded)" : ""}
      </div>
    </div>
  );
}
