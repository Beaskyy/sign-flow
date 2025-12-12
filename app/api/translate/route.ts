// app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // Function to create a sequence for a greeting
  const createGreetingSequence = (): any[] => {
    const sequence = [];
    
    // Animation steps - 10 steps total
    const steps = [
      // Step 1: Starting position - raise both arms slightly
      {
        boneRotations: {
          RightArm_01: { x: -0.5, y: 0, z: 0.2 },
          RightForeArm: { x: 0, y: 0, z: -0.3 },
          RightHand: { x: 0, y: 0.2, z: 0.4 },
          LeftArm_01: { x: -0.5, y: 0, z: -0.2 },
          LeftForeArm: { x: 0, y: 0, z: 0.3 },
          LeftHand: { x: 0, y: -0.2, z: -0.4 },
        },
        duration_ms: 400,
      },
      // Step 2: Move arms outward
      {
        boneRotations: {
          RightArm_01: { x: -0.7, y: 0.5, z: 0.4 },
          RightForeArm: { x: 0.2, y: 0, z: -0.5 },
          RightHand: { x: 0.3, y: 0.5, z: 0.8 },
          LeftArm_01: { x: -0.7, y: -0.5, z: -0.4 },
          LeftForeArm: { x: -0.2, y: 0, z: 0.5 },
          LeftHand: { x: -0.3, y: -0.5, z: -0.8 },
        },
        duration_ms: 400,
      },
      // Step 3: Wave right hand
      {
        boneRotations: {
          RightArm_01: { x: -0.8, y: 0.6, z: 0.3 },
          RightForeArm: { x: 0.4, y: 0, z: -0.8 },
          RightHand: { x: 0.8, y: 1.0, z: 1.2 },
          LeftArm_01: { x: -0.5, y: -0.3, z: -0.3 },
          LeftForeArm: { x: 0, y: 0, z: 0.2 },
          LeftHand: { x: -0.1, y: -0.2, z: -0.3 },
        },
        duration_ms: 300,
      },
      // Step 4: Wave left hand
      {
        boneRotations: {
          RightArm_01: { x: -0.5, y: 0.3, z: 0.3 },
          RightForeArm: { x: 0, y: 0, z: -0.2 },
          RightHand: { x: 0.1, y: 0.2, z: 0.3 },
          LeftArm_01: { x: -0.8, y: -0.6, z: -0.3 },
          LeftForeArm: { x: -0.4, y: 0, z: 0.8 },
          LeftHand: { x: -0.8, y: -1.0, z: -1.2 },
        },
        duration_ms: 300,
      },
      // Step 5: Both hands up
      {
        boneRotations: {
          RightArm_01: { x: -1.2, y: 0.3, z: 0.1 },
          RightForeArm: { x: 0.6, y: 0, z: -0.4 },
          RightHand: { x: 0.5, y: 0.8, z: 0.6 },
          LeftArm_01: { x: -1.2, y: -0.3, z: -0.1 },
          LeftForeArm: { x: -0.6, y: 0, z: 0.4 },
          LeftHand: { x: -0.5, y: -0.8, z: -0.6 },
        },
        duration_ms: 500,
      },
      // Step 6: Circle motion - right
      {
        boneRotations: {
          RightArm_01: { x: -1.0, y: 0.8, z: 0.5 },
          RightForeArm: { x: 0.8, y: 0.2, z: -1.0 },
          RightHand: { x: 1.0, y: 1.2, z: 1.5 },
          LeftArm_01: { x: -0.8, y: -0.2, z: -0.2 },
          LeftForeArm: { x: -0.2, y: 0, z: 0.3 },
          LeftHand: { x: -0.3, y: -0.4, z: -0.5 },
        },
        duration_ms: 400,
      },
      // Step 7: Circle motion - left
      {
        boneRotations: {
          RightArm_01: { x: -0.8, y: 0.2, z: 0.2 },
          RightForeArm: { x: 0.2, y: 0, z: -0.3 },
          RightHand: { x: 0.3, y: 0.4, z: 0.5 },
          LeftArm_01: { x: -1.0, y: -0.8, z: -0.5 },
          LeftForeArm: { x: -0.8, y: -0.2, z: 1.0 },
          LeftHand: { x: -1.0, y: -1.2, z: -1.5 },
        },
        duration_ms: 400,
      },
      // Step 8: Both hands cross
      {
        boneRotations: {
          RightArm_01: { x: -0.9, y: 0.4, z: 0.9 },
          RightForeArm: { x: 0.4, y: 0.1, z: -0.7 },
          RightHand: { x: 0.6, y: 0.6, z: 1.1 },
          LeftArm_01: { x: -0.9, y: -0.4, z: -0.9 },
          LeftForeArm: { x: -0.4, y: -0.1, z: 0.7 },
          LeftHand: { x: -0.6, y: -0.6, z: -1.1 },
        },
        duration_ms: 600,
      },
      // Step 9: Open arms wide
      {
        boneRotations: {
          RightArm_01: { x: -0.6, y: 1.0, z: 0.3 },
          RightForeArm: { x: 0.3, y: 0, z: -0.9 },
          RightHand: { x: 0.4, y: 1.1, z: 0.7 },
          LeftArm_01: { x: -0.6, y: -1.0, z: -0.3 },
          LeftForeArm: { x: -0.3, y: 0, z: 0.9 },
          LeftHand: { x: -0.4, y: -1.1, z: -0.7 },
        },
        duration_ms: 500,
      },
      // Step 10: Return to rest position
      {
        boneRotations: {
          RightArm_01: { x: -0.3, y: 0, z: 0 },
          RightForeArm: { x: 0, y: 0, z: 0 },
          RightHand: { x: 0, y: 0, z: 0 },
          LeftArm_01: { x: -0.3, y: 0, z: 0 },
          LeftForeArm: { x: 0, y: 0, z: 0 },
          LeftHand: { x: 0, y: 0, z: 0 },
        },
        duration_ms: 800,
      },
    ];

    return steps;
  };

  // Function to create a sequence for "how are you"
  const createHowAreYouSequence = (): any[] => {
    const sequence = [];
    
    // 10-step sequence for "how are you"
    const steps = [
      // Step 1: "HOW" - Both hands questioning gesture
      {
        boneRotations: {
          RightArm_01: { x: -0.8, y: 0.4, z: 0.3 },
          RightForeArm: { x: 0.3, y: 0, z: -0.4 },
          RightHand: { x: 0.5, y: 0.6, z: 0.8 },
          LeftArm_01: { x: -0.8, y: -0.4, z: -0.3 },
          LeftForeArm: { x: -0.3, y: 0, z: 0.4 },
          LeftHand: { x: -0.5, y: -0.6, z: -0.8 },
        },
        duration_ms: 600,
      },
      // Step 2: Tilt head/question gesture
      {
        boneRotations: {
          RightArm_01: { x: -1.0, y: 0.5, z: 0.5 },
          RightForeArm: { x: 0.5, y: 0.1, z: -0.6 },
          RightHand: { x: 0.7, y: 0.8, z: 1.0 },
          LeftArm_01: { x: -0.6, y: -0.3, z: -0.2 },
          LeftForeArm: { x: -0.1, y: 0, z: 0.2 },
          LeftHand: { x: -0.2, y: -0.3, z: -0.4 },
        },
        duration_ms: 400,
      },
      // Step 3: "ARE" - Hands transition
      {
        boneRotations: {
          RightArm_01: { x: -0.6, y: 0.7, z: 0.2 },
          RightForeArm: { x: 0.2, y: -0.1, z: -0.5 },
          RightHand: { x: 0.4, y: 0.9, z: 0.6 },
          LeftArm_01: { x: -1.0, y: -0.5, z: -0.4 },
          LeftForeArm: { x: -0.4, y: 0.1, z: 0.6 },
          LeftHand: { x: -0.7, y: -0.8, z: -1.0 },
        },
        duration_ms: 500,
      },
      // Step 4: "ARE" gesture - palms up
      {
        boneRotations: {
          RightArm_01: { x: -0.7, y: 0.3, z: 0.4 },
          RightForeArm: { x: 0.4, y: 0.2, z: -0.8 },
          RightHand: { x: 0.9, y: 0.5, z: 1.2 },
          LeftArm_01: { x: -0.7, y: -0.3, z: -0.4 },
          LeftForeArm: { x: -0.4, y: -0.2, z: 0.8 },
          LeftHand: { x: -0.9, y: -0.5, z: -1.2 },
        },
        duration_ms: 600,
      },
      // Step 5: "YOU" preparation
      {
        boneRotations: {
          RightArm_01: { x: -0.5, y: 0.9, z: 0.1 },
          RightForeArm: { x: 0.1, y: -0.2, z: -0.3 },
          RightHand: { x: 0.2, y: 1.1, z: 0.4 },
          LeftArm_01: { x: -0.5, y: -0.9, z: -0.1 },
          LeftForeArm: { x: -0.1, y: 0.2, z: 0.3 },
          LeftHand: { x: -0.2, y: -1.1, z: -0.4 },
        },
        duration_ms: 400,
      },
      // Step 6: "YOU" - point forward with both hands
      {
        boneRotations: {
          RightArm_01: { x: -0.4, y: 0.2, z: 0.7 },
          RightForeArm: { x: 0.7, y: 0.3, z: -1.0 },
          RightHand: { x: 1.1, y: 0.3, z: 1.4 },
          LeftArm_01: { x: -0.4, y: -0.2, z: -0.7 },
          LeftForeArm: { x: -0.7, y: -0.3, z: 1.0 },
          LeftHand: { x: -1.1, y: -0.3, z: -1.4 },
        },
        duration_ms: 700,
      },
      // Step 7: Emphasize "YOU"
      {
        boneRotations: {
          RightArm_01: { x: -0.6, y: 0.1, z: 0.8 },
          RightForeArm: { x: 0.8, y: 0.5, z: -1.2 },
          RightHand: { x: 1.3, y: 0.1, z: 1.6 },
          LeftArm_01: { x: -0.6, y: -0.1, z: -0.8 },
          LeftForeArm: { x: -0.8, y: -0.5, z: 1.2 },
          LeftHand: { x: -1.3, y: -0.1, z: -1.6 },
        },
        duration_ms: 500,
      },
      // Step 8: Wiggle fingers for emphasis
      {
        boneRotations: {
          RightArm_01: { x: -0.5, y: 0.3, z: 0.6 },
          RightForeArm: { x: 0.6, y: 0.4, z: -0.9 },
          RightHand: { x: 1.4, y: 0.5, z: 1.8 },
          LeftArm_01: { x: -0.5, y: -0.3, z: -0.6 },
          LeftForeArm: { x: -0.6, y: -0.4, z: 0.9 },
          LeftHand: { x: -1.4, y: -0.5, z: -1.8 },
        },
        duration_ms: 300,
      },
      // Step 9: Return to questioning gesture
      {
        boneRotations: {
          RightArm_01: { x: -0.7, y: 0.5, z: 0.4 },
          RightForeArm: { x: 0.4, y: 0.2, z: -0.6 },
          RightHand: { x: 0.8, y: 0.7, z: 1.0 },
          LeftArm_01: { x: -0.7, y: -0.5, z: -0.4 },
          LeftForeArm: { x: -0.4, y: -0.2, z: 0.6 },
          LeftHand: { x: -0.8, y: -0.7, z: -1.0 },
        },
        duration_ms: 500,
      },
      // Step 10: Final rest position
      {
        boneRotations: {
          RightArm_01: { x: -0.2, y: 0, z: 0.1 },
          RightForeArm: { x: 0, y: 0, z: -0.1 },
          RightHand: { x: 0, y: 0.1, z: 0.2 },
          LeftArm_01: { x: -0.2, y: 0, z: -0.1 },
          LeftForeArm: { x: 0, y: 0, z: 0.1 },
          LeftHand: { x: 0, y: -0.1, z: -0.2 },
        },
        duration_ms: 800,
      },
    ];

    return steps;
  };

  // Default sequences based on input text
  const sequences: Record<string, () => any[]> = {
    "hello": createGreetingSequence,
    "hi": createGreetingSequence,
    "greetings": createGreetingSequence,
    "how are you": createHowAreYouSequence,
    "how are you doing": createHowAreYouSequence,
    "what's up": createHowAreYouSequence,
  };

  const lowercaseText = text.toLowerCase().trim();
  let sequence: any[] = [];

  // Find matching sequence
  for (const [key, creator] of Object.entries(sequences)) {
    if (lowercaseText.includes(key)) {
      sequence = creator();
      break;
    }
  }

  // If no match, use a default welcoming sequence
  if (sequence.length === 0) {
    sequence = createGreetingSequence();
  }

  // Add a slight variation to each step to make it more natural
  const variedSequence = sequence.map((step, index) => {
    const variationFactor = 0.05; // Small random variations
    const variedRotations: any = {};
    
    Object.entries(step.boneRotations).forEach(([boneName, rotation]: any) => {
      const randomVariation = (Math.random() - 0.5) * 2 * variationFactor;
      variedRotations[boneName] = {
        x: rotation.x + randomVariation,
        y: rotation.y + randomVariation,
        z: rotation.z + randomVariation,
      };
    });

    return {
      ...step,
      boneRotations: variedRotations,
      // Add slight variation to duration for more natural feel
      duration_ms: step.duration_ms + (Math.random() * 100 - 50),
    };
  });

  return NextResponse.json({ 
    sequence: variedSequence,
    originalText: text,
    sequenceLength: variedSequence.length,
    message: `Generated ${variedSequence.length}-step animation sequence`
  });
}