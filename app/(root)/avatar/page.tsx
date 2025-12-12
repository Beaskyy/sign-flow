"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// Create a custom hook to handle model and animations
function useAvatarAnimations() {
  const avatarRef = useRef<THREE.Group>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationQueue = useRef<any[]>([]);
  const isAnimating = useRef(false);

  // Play animation sequence
  const playSequence = async (sequence: any[]) => {
    if (!avatarRef.current || sequence.length === 0) {
      console.warn("Avatar not loaded or empty sequence");
      return;
    }

    // Add sequence to queue
    animationQueue.current.push(...sequence);
    
    // If already animating, just queue it
    if (isAnimating.current) {
      console.log("Animation queued");
      return;
    }

    // Start playing from queue
    playFromQueue();
  };

  const playFromQueue = () => {
    if (animationQueue.current.length === 0 || !avatarRef.current) {
      isAnimating.current = false;
      return;
    }

    isAnimating.current = true;
    const step = animationQueue.current.shift();
    
    console.log("Playing animation step:", step);

    // Animate all bones in this step
    const promises = Object.entries(step.boneRotations).map(([boneName, rot]: any) => {
      return new Promise<void>((resolve) => {
        const bone = avatarRef.current?.getObjectByName(boneName);
        if (bone) {
          console.log(`Animating bone: ${boneName} to`, rot);
          gsap.to(bone.rotation, {
            x: rot.x,
            y: rot.y,
            z: rot.z,
            duration: step.duration_ms / 1000,
            ease: "power2.out",
            onComplete: () => resolve()
          });
        } else {
          console.warn(`Bone ${boneName} not found`);
          resolve();
        }
      });
    });

    // Wait for all animations in this step to complete
    Promise.all(promises).then(() => {
      setTimeout(() => {
        playFromQueue();
      }, 100); // Small delay between steps
    });
  };

  return { avatarRef, isLoaded, setIsLoaded, playSequence };
}

function AvatarModel({ onLoad }: { onLoad: () => void }) {
  const gltf = useGLTF("https://models.readyplayer.me/69360640347390125d578f7f.glb");
  const { avatarRef, setIsLoaded } = useAvatarAnimations();

  // Expose ref globally for TranslateButton
  useEffect(() => {
    (window as any).avatarRef = avatarRef;
    setIsLoaded(true);
    onLoad();
    
    // Log bone names for debugging
    if (avatarRef.current) {
      console.log("Avatar loaded, scanning for bones...");
      avatarRef.current.traverse((obj) => {
        if (obj.type === "Bone" || obj.name.includes("Arm") || obj.name.includes("Hand")) {
          console.log("Found bone:", obj.name);
        }
      });
    }
  }, [avatarRef, onLoad]);

  useFrame(() => {
    // Animation frame updates if needed
  });

  return <primitive ref={avatarRef} object={gltf.scene} scale={1} position={[0, -1.2, 0]} />;
}

// Move TranslateButton component outside of AvatarPage
const TranslateButton = ({ 
  inputText, 
  isModelLoaded,
  onTranslate 
}: { 
  inputText: string;
  isModelLoaded: boolean;
  onTranslate: () => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onTranslate();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !isModelLoaded}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? "Translating..." : "Translate"}
    </button>
  );
};

export default function AvatarPage() {
  const [inputText, setInputText] = useState("");
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Function to play animation sequence
  const playAnimationSequence = useCallback(async (avatar: THREE.Group, sequence: any[]) => {
    return new Promise<void>((resolve) => {
      sequence.forEach((step, index) => {
        setTimeout(() => {
          console.log(`Playing step ${index}:`, step);
          
          Object.entries(step.boneRotations).forEach(([boneName, rot]: any) => {
            const bone = avatar.getObjectByName(boneName);
            if (bone) {
              console.log(`Animating ${boneName}:`, rot);
              
              gsap.to(bone.rotation, {
                x: rot.x,
                y: rot.y,
                z: rot.z,
                duration: step.duration_ms / 1000,
                ease: "power2.out"
              });
            } else {
              console.warn(`Bone "${boneName}" not found in the model. Available bones:`);
              // Log available bones for debugging
              avatar.traverse((obj) => {
                if (obj.type === "Bone") {
                  console.log("- " + obj.name);
                }
              });
            }
          });

          // Resolve promise after last step
          if (index === sequence.length - 1) {
            setTimeout(() => resolve(), step.duration_ms);
          }
        }, index === 0 ? 0 : sequence.slice(0, index).reduce((sum, s) => sum + s.duration_ms, 0));
      });
    });
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!isModelLoaded) {
      alert("Please wait for the avatar to load");
      return;
    }

    if (!inputText.trim()) {
      alert("Please enter some text to translate");
      return;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received animation data:", data);

      if (!data.sequence || data.sequence.length === 0) {
        alert("No animation sequence found for the given text");
        return;
      }

      // Get the global avatar reference
      const avatarRef = (window as any).avatarRef;
      
      if (!avatarRef || !avatarRef.current) {
        alert("Avatar reference not found");
        return;
      }

      // Play the animation sequence
      await playAnimationSequence(avatarRef.current, data.sequence);

    } catch (error) {
      console.error("Error playing sign:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to play animation'}`);
    }
  }, [inputText, isModelLoaded, playAnimationSequence]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTranslate();
    }
  }, [handleTranslate]);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Type text to translate (e.g., 'hello how are you')"
          className="p-2 border rounded w-64"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <TranslateButton 
          inputText={inputText}
          isModelLoaded={isModelLoaded}
          onTranslate={handleTranslate}
        />
      </div>

      {!isModelLoaded && (
        <div className="mb-4 text-blue-600">Loading avatar...</div>
      )}

      <div className="w-full max-w-4xl h-[600px] bg-white rounded shadow">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.6, 3] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={1.3} />
          <OrbitControls enableDamping dampingFactor={0.1} rotateSpeed={0.4} />
          <AvatarModel onLoad={() => setIsModelLoaded(true)} />
        </Canvas>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Try typing: "hello how are you"</p>
        <p>Make sure your API is running at <code>/api/translate</code></p>
      </div>
    </div>
  );
}