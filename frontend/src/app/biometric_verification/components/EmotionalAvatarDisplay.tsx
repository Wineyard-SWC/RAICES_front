"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { print } from "@/utils/debugLogger";

// 🔥 USAR EXACTAMENTE LAS MISMAS EXPRESIONES QUE EN avatarAnimationsDashboard.tsx
const EXPRESSIONS = {
  Relaxed: {
    eyeBlinkLeft:    0.2,
    eyeBlinkRight:   0.2,
    mouthClose:      0.1,
    cheekPuff:       0.1,
    browInnerUp:     0.1
  },
  Happy: {
    mouthSmileLeft:   0.8,
    mouthSmileRight:  0.8,
    mouthDimpleLeft:  0.3,
    mouthDimpleRight: 0.3,
    browOuterUpLeft:  0.1,
    browOuterUpRight: 0.1,
    eyeSquintLeft:    0.4,
    eyeSquintRight:   0.4,
    mouthUpperUpLeft: 0.3,
    mouthUpperUpRight:0.3,
    cheekSquintLeft:  0.5,
    cheekSquintRight: 0.5
  },
  Euphoric: {
    eyeBlinkLeft:    1.0,
    eyeBlinkRight:   1.0,
    mouthSmileLeft:  1.0,
    mouthSmileRight: 1.0,
    mouthOpen:       1.0,
    tongueOut:       0.3,
    cheekSquintLeft:  0.8,
    cheekSquintRight: 0.8,
    browInnerUp:      0.5,
    browOuterUpLeft:  0.7,
    browOuterUpRight: 0.7
  },
  Calm: {
    eyeBlinkLeft:   1.0,
    eyeBlinkRight:  1.0,
    mouthClose:     0.05,
    browInnerUp:    0.2
  },
  Excited: {
    mouthSmileLeft:   0.8,
    mouthSmileRight:  0.8,
    eyeWideLeft:      0.6,
    eyeWideRight:     0.6,
    browInnerUp:      0.5,
    browOuterUpLeft:  0.6,
    browOuterUpRight: 0.6,
    cheekSquintLeft:  0.5,
    cheekSquintRight: 0.5,
    mouthStretchLeft:  0.7,
    mouthStretchRight: 0.7,
    mouthOpen:        0.5
  },
  Sad: {
    browDownLeft:       0.6,
    browDownRight:      0.6,
    browInnerUp:        0.7,
    eyeLookDownLeft:    0.3,
    eyeLookDownRight:   0.3,
    eyeBlinkLeft:       0.2,
    eyeBlinkRight:      0.2,
    eyeSquintLeft:      0.2,
    eyeSquintRight:     0.2,
    mouthClose:         0.3,
    mouthFrownLeft:     0.6,
    mouthFrownRight:    0.6,
    mouthPressLeft:     0.1,
    mouthPressRight:    0.1,
    cheekSquintLeft:    0.2,
    cheekSquintRight:   0.2
  },
  Stressed: {
    browDownLeft:    0.8,
    browDownRight:   0.8,
    browInnerUp:     0.4,
    eyeSquintLeft:   0.5,
    eyeSquintRight:  0.5,
    jawForward:      0.3,
    noseSneerLeft:   0.4,
    noseSneerRight:  0.4,
    mouthPressLeft:  0.4,
    mouthPressRight: 0.4,
    mouthFrownLeft:   0.5,
    mouthFrownRight:  0.5,
    mouthLowerDownLeft:  0.4,
    mouthLowerDownRight: 0.4
  },
  Neutral: {
    // Sin expresiones
  }
};

function AvatarWithExpression({ 
  avatarUrl, 
  expression,
  expressionIntensity = 0.8 // 🔥 AGREGAR INTENSIDAD COMO EN EL DASHBOARD
}: { 
  avatarUrl: string;
  expression: string;
  expressionIntensity?: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(avatarUrl);
  
  useEffect(() => {
    if (!scene) return;
    
    print('🎭 EmotionalAvatarDisplay - Applying expression:', expression, 'with intensity:', expressionIntensity);
    
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
      print('✅ Found expression definition for:', expression, EXPRESSIONS[expression]);
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
          for (const [blendshapeName, value] of Object.entries(EXPRESSIONS[expression])) {
            const index = object.morphTargetDictionary[blendshapeName];
            if (index !== undefined) {
              // 🔥 APLICAR LA INTENSIDAD COMO EN EL DASHBOARD
              object.morphTargetInfluences[index] = value * expressionIntensity;
              print(`✅ Applied ${blendshapeName}: ${value * expressionIntensity} at index ${index}`);
            } else {
              console.warn(`❌ Blendshape ${blendshapeName} not found in avatar`);
            }
          }
        }
      });
    } else {
      console.warn('❌ Expression not found:', expression);
    }
  }, [scene, expression, expressionIntensity]);

  return (
    <group ref={group}>
      {/* 🔥 USAR EXACTAMENTE LA MISMA ESCALA Y POSICIÓN QUE EL DASHBOARD */}
      <primitive object={scene} scale={1.5} position={[0, -2.5, 0]} />
    </group>
  );
}

interface EmotionalAvatarDisplayProps {
  avatarUrl: string;
  expression: string;
  size?: number;
  expressionIntensity?: number; // 🔥 AGREGAR PROP PARA INTENSIDAD
}

export default function EmotionalAvatarDisplay({
  avatarUrl,
  expression,
  size = 300,
  expressionIntensity = 0.8 // 🔥 INTENSIDAD POR DEFECTO
}: EmotionalAvatarDisplayProps) {
  return (
    <div 
      className="bg-gray-50 rounded-lg overflow-hidden border"
      style={{ width: size, height: size }}
    >
      {/* 🔥 USAR LA MISMA CONFIGURACIÓN DE CÁMARA QUE EL DASHBOARD */}
      <Canvas camera={{ position: [0, 0.2, 2.5], fov: 15 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[1, 2, 1.5]} intensity={1.2} />
        <Suspense fallback={null}>
          <AvatarWithExpression 
            avatarUrl={avatarUrl} 
            expression={expression}
            expressionIntensity={expressionIntensity} // 🔥 PASAR LA INTENSIDAD
          />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}


