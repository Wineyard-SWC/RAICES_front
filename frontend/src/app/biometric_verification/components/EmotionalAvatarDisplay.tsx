"use client";

import { useState, useRef, useEffect, Suspense, use } from "react";
import { Canvas, ReactThreeFiber } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Expresiones predefinidas (las mismas de tu avatar_test)
const EXPRESSIONS = {
  Relaxed: {
    // Parpadeo suave: sensación de calma/ojos medio cerrados
    eyeBlinkLeft:    0.2,
    eyeBlinkRight:   0.2,
    // Comisura de labios apenas cerrada: labios relajados
    mouthClose:      0.1,
    // Leve hinchazón de mejillas: respiración tranquila
    cheekPuff:       0.1,
    // Una ligera elevación interna de cejas para no verse completamente neutro
    browInnerUp:     0.1
  },
  Happy: {
    // Sonrisa amplia
    mouthSmileLeft:   0.8,
    mouthSmileRight:  0.8,
    // Hoyuelos en mejillas
    mouthDimpleLeft:  0.3,
    mouthDimpleRight: 0.3,
    // Ceño “suave” arqueado hacia arriba
    browOuterUpLeft:  0.1,
    browOuterUpRight: 0.1,
    // Ojos entrecerrados por la sonrisa
    eyeSquintLeft:    0.4,
    eyeSquintRight:   0.4,
    // Elevación de parte superior del labio para enfatizar la sonrisa
    mouthUpperUpLeft: 0.3,
    mouthUpperUpRight:0.3,
    // Leve arrugado de mejillas
    cheekSquintLeft:  0.5,
    cheekSquintRight: 0.5
  },
  Euphoric: {
    // Cierre completo de ojos: éxtasis
    eyeBlinkLeft:    1.0,
    eyeBlinkRight:   1.0,
    // Sonrisa máxima
    mouthSmileLeft:  1.0,
    mouthSmileRight: 1.0,
    // Boca bien abierta de júbilo
    mouthOpen:       1.0,
    // Sacar un poco la lengua para acentuar la intensidad
    tongueOut:       0.3,
    // Mejillas muy arrugadas por la sonrisa
    cheekSquintLeft:  0.8,
    cheekSquintRight: 0.8,
    // Cejas levantadas en el centro y hacia fuera
    browInnerUp:      0.5,
    browOuterUpLeft:  0.7,
    browOuterUpRight: 0.7
  },
  Calm: {
    // Ojos cerrados por completo: estado de meditación/binocular
    eyeBlinkLeft:   1.0,
    eyeBlinkRight:  1.0,
    // Labio ligeramente fruncido o casi neutro
    mouthClose:     0.05,
    // Una pequeña elevación interna de cejas, como “suave atención”
    browInnerUp:    0.2
  },
  Excited: {
    // Sonrisa marcada
    mouthSmileLeft:   0.8,
    mouthSmileRight:  0.8,
    // Ojos muy abiertos (asombro)
    eyeWideLeft:      0.6,
    eyeWideRight:     0.6,
    // Elevación de cejas internas y externas: entusiasmo
    browInnerUp:      0.5,
    browOuterUpLeft:  0.6,
    browOuterUpRight: 0.6,
    // Mejillas arrugadas por la sonrisa
    cheekSquintLeft:  0.5,
    cheekSquintRight: 0.5,
    // Labios estirados hacia los lados para enfatizar excitación
    mouthStretchLeft:  0.7,
    mouthStretchRight: 0.7,
    // Una ligera apertura de boca para transmitir energía
    mouthOpen:        0.5
  },
  Sad: {
  // ===== Ceja: forma de “V” invertida más pronunciada =====
  browDownLeft:       0.6,    // baja el extremo exterior de la ceja
  browDownRight:      0.6,
  browInnerUp:        0.7,    // eleva más el centro de ambas cejas

  // ===== Ojos: mirada hacia abajo y párpados algo cargados =====
  eyeLookDownLeft:    0.3,
  eyeLookDownRight:   0.3,
  eyeBlinkLeft:       0.2,
  eyeBlinkRight:      0.2,
  eyeSquintLeft:      0.2,
  eyeSquintRight:     0.2,

  // ===== Boca: cerrada (sin mostrar dientes), pero con comisuras caídas =====
  mouthClose:         0.3,    // cierra los labios lo suficiente para no ver los dientes
  mouthFrownLeft:     0.6,    // baja las comisuras sin forzar apertura
  mouthFrownRight:    0.6,
  mouthPressLeft:     0.1,    // presiona ligeramente los labios para tensión contenida
  mouthPressRight:    0.1,

  // ===== Mejillas: leve arrugado por la tensión de la boca/ojos =====
  cheekSquintLeft:    0.2,
  cheekSquintRight:   0.2
  },
  Stressed: {
    // Cejas muy arqueadas hacia abajo (fruncido)
    browDownLeft:    0.8,
    browDownRight:   0.8,
    // Cejas internas levantadas para tensión
    browInnerUp:     0.4,
    // Ojos entrecerrados por fatiga/tensión
    eyeSquintLeft:   0.5,
    eyeSquintRight:  0.5,
    // Apertura parcial de mandíbula
    jawForward:      0.3,
    // Arrugado de nariz (desagrado/estrés)
    noseSneerLeft:   0.4,
    noseSneerRight:  0.4,
    // Labios presionados para contener tensión
    mouthPressLeft:  0.4,
    mouthPressRight: 0.4,
    // Comisuras de labios levemente hacia abajo
    mouthFrownLeft:   0.5,
    mouthFrownRight:  0.5,
    // Labio inferior caído
    mouthLowerDownLeft:  0.4,
    mouthLowerDownRight: 0.4
  },
  Neutral: {
    // Sin ninguna influencia activada: expresión totalmente neutra
    // (Todos los demás blendshapes en 0 por defecto)
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


