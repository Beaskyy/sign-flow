"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useMessageDetails } from "@/hooks/useMessageDetails";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Loader2 } from "lucide-react";

// The 3D Avatar Model Component
function AvatarModel({ sequence, isPlaying, onFinish }: { sequence: any[], isPlaying: boolean, onFinish: () => void }) {
  const { scene } = useGLTF("https://models.readyplayer.me/69360640347390125d578f7f.glb");
  const avatarRef = useRef<THREE.Group>(null);

  const playSequence = useCallback(() => {
    if (!avatarRef.current || !sequence || sequence.length === 0) return;

    const avatar = avatarRef.current;
    let cumulativeTime = 0;

    sequence.forEach((step, index) => {
      setTimeout(() => {
        Object.entries(step.boneRotations).forEach(([boneName, rot]: any) => {
          const bone = avatar.getObjectByName(boneName);
          if (bone) {
            gsap.to(bone.rotation, {
              x: rot.x,
              y: rot.y,
              z: rot.z,
              duration: step.duration_ms / 1000,
              ease: "power2.out"
            });
          }
        });

        if (index === sequence.length - 1) {
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

  return <primitive ref={avatarRef} object={scene} scale={1.5} position={[0, -1.5, 0]} />;
}

interface SignLanguageModalProps {
  messageId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SignLanguageModal({ messageId, isOpen, onClose }: SignLanguageModalProps) {
  const { data: details, isLoading } = useMessageDetails(messageId || "");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sign Language Translation</DialogTitle>
          <p className="text-sm text-muted-foreground italic">"{details?.input_preview}"</p>
        </DialogHeader>

        <div className="flex-1 bg-slate-50 rounded-lg relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin size-8 text-[#D4AF37]" />
            </div>
          ) : (
            <Canvas camera={{ position: [0, 1, 3] }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[2, 5, 2]} />
              <AvatarModel 
                sequence={details?.motion_sequence?.sequence || []} 
                isPlaying={isPlaying}
                onFinish={() => setIsPlaying(false)}
              />
              <OrbitControls enablePan={false} minDistance={1} maxDistance={5} />
            </Canvas>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button 
              onClick={() => setIsPlaying(true)} 
              disabled={isPlaying || isLoading}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90"
            >
              {isPlaying ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" />}
              {isPlaying ? "Playing..." : "Play Sign"}
            </Button>
            <Button variant="outline" onClick={() => setIsPlaying(false)}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}