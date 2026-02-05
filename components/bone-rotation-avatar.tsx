"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

interface BoneRotationFrame {
  type?: string;
  boneRotations?: Record<string, { x: number; y: number; z: number }>;
  duration_ms: number;
}

interface BoneRotationAvatarProps {
  sequence: BoneRotationFrame[];
  isPlaying: boolean;
  onFinish?: () => void;
  className?: string;
}

function AvatarModel({ sequence, isPlaying, onFinish }: BoneRotationAvatarProps) {
  const { scene } = useGLTF("https://models.readyplayer.me/69360640347390125d578f7f.glb");
  const avatarRef = useRef<THREE.Group>(null);

  const playSequence = useCallback(() => {
    if (!avatarRef.current || !sequence || sequence.length === 0) return;

    const avatar = avatarRef.current;
    let cumulativeTime = 0;

    sequence.forEach((step, index) => {
      setTimeout(() => {
        if (step.boneRotations) {
          Object.entries(step.boneRotations).forEach(([boneName, rot]) => {
            const bone = avatar.getObjectByName(boneName);
            if (bone) {
              gsap.to(bone.rotation, {
                x: rot.x,
                y: rot.y,
                z: rot.z,
                duration: step.duration_ms / 1000,
                ease: "power2.out",
              });
            }
          });
        }

        if (index === sequence.length - 1 && onFinish) {
          setTimeout(onFinish, step.duration_ms);
        }
      }, cumulativeTime);

      cumulativeTime += step.duration_ms;
    });
  }, [sequence, onFinish]);

  useEffect(() => {
    if (isPlaying) {
      playSequence();
    }
  }, [isPlaying, playSequence]);

  return (
    <primitive ref={avatarRef} object={scene} scale={1.8} position={[0, -1.8, 0]} />
  );
}

export function BoneRotationAvatar({
  sequence,
  isPlaying,
  onFinish,
  className = "",
}: BoneRotationAvatarProps) {
  if (!sequence || sequence.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-[#E7E7E7] ${className}`}>
        <p className="text-sm text-gray-500">No motion data</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[200px] ${className}`}>
      <Canvas camera={{ position: [0, 0.5, 3] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 2]} />
        <AvatarModel
          sequence={sequence}
          isPlaying={isPlaying}
          onFinish={onFinish}
        />
        <OrbitControls enablePan={false} minDistance={1} maxDistance={5} enableZoom={false} />
      </Canvas>
    </div>
  );
}
