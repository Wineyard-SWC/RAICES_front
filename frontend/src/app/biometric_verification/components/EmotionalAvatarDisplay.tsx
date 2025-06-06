"use client";

import { useState, useRef, useEffect, Suspense, use } from "react";
import { Canvas, ReactThreeFiber } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Expresiones predefinidas (las mismas de tu avatar_test)
const EXPRESSIONS = {
  neutral: {},
  happy: { 
    mouthSmileLeft: 0.7, 
    mouthSmileRight: 0.7, 
    cheekSquintLeft: 0.3, 
    cheekSquintRight: 0.3,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3
  },
  bigSmile: {
    mouthSmileLeft: 1.0,
    mouthSmileRight: 1.0,
    mouthOpen: 0.3,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    cheekSquintLeft: 0.6,
    cheekSquintRight: 0.6
  },
  sad: {
    browDownLeft: 0.5,
    browDownRight: 0.5,
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    mouthLowerDownLeft: 0.3,
    mouthLowerDownRight: 0.3
  },
  angry: {
    browDownLeft: 0.8,
    browDownRight: 0.8,
    eyeSquintLeft: 0.5,
    eyeSquintRight: 0.5,
    mouthFrownLeft: 0.7,
    mouthFrownRight: 0.7,
    noseSneerLeft: 0.4,
    noseSneerRight: 0.4,
    jawForward: 0.2
  },
  surprised: {
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
    browInnerUp: 0.6,
    browOuterUpLeft: 0.6,
    browOuterUpRight: 0.6,
    mouthOpen: 0.7,
    jawOpen: 0.5
  }
};

function AvatarWithExpression({ 
  avatarUrl, 
  expression 
}: { 
  avatarUrl: string;
  expression: string;
}) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(avatarUrl);
  
  useEffect(() => {
    if (!scene) return;
    
    // Reset all blendshapes first
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        for (let i = 0; i < object.morphTargetInfluences.length; i++) {
          object.morphTargetInfluences[i] = 0;
        }
      }
    });
    
    // Apply the selected expression
    if (expression && EXPRESSIONS[expression]) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
          for (const [blendshapeName, value] of Object.entries(EXPRESSIONS[expression])) {
            const index = object.morphTargetDictionary[blendshapeName];
            if (index !== undefined) {
              object.morphTargetInfluences[index] = value;
            }
          }
        }
      });
    }
  }, [scene, expression]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={3} position={[0, -5, 0]} />
    </group>
  );
}

interface EmotionalAvatarDisplayProps {
  avatarUrl: string;
  expression: string;
  size?: number;
}

export default function EmotionalAvatarDisplay({
  avatarUrl,
  expression,
  size = 300
}: EmotionalAvatarDisplayProps) {
  return (
    <div 
      className="bg-gray-50 rounded-lg overflow-hidden border"
      style={{ width: size, height: size }}
    >
      <Canvas camera={{ position: [0, 0, 2.5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 5, 2]} intensity={1} />
        <Suspense fallback={null}>
          <AvatarWithExpression 
            avatarUrl={avatarUrl} 
            expression={expression} 
          />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}


