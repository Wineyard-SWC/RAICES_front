"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { print } from "@/utils/debugLogger";

function AvatarWithExpression({
  avatarUrl,
  animUrl,
  play,
}: {
  avatarUrl: string;
  animUrl: string;
  play: boolean;
}) {
  const group = useRef<THREE.Group>(null!);

  const avatarGltf = useGLTF(avatarUrl);
  const animGltf = useGLTF(animUrl);

  // Usa solo las animaciones externas
  const { actions } = useAnimations(animGltf.animations, group);

  useEffect(() => {
    const name = "M_Standing_Expressions_002";
    const action = actions[name];
    print("Intentando reproducir animación:", name, "Existe:", !!action);
    if (play && action) {
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.fadeIn(0.3).play();
    }
    return () => {
      if (action) action.fadeOut(0.3);
    };
  }, [actions, play]);

  return (
    <group ref={group} dispose={null}>
      <primitive
        object={avatarGltf.scene}
        scale={1.7}
        position={[0, -1.7, 0]}
      />
    </group>
  );
}

export default function AvatarTestExpression() {
  const [play, setPlay] = useState(true);

  const handlePlay = () => {
    setPlay(false);
    setTimeout(() => setPlay(true), 50);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl h-[70vh] bg-black/20 rounded-lg flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <AvatarWithExpression
              avatarUrl="https://models.readyplayer.me/67d45fdb3c8fe26009a1fe47.glb"
              animUrl="/animation/avatarAnimations/masculine/expression/M_Standing_Expressions_002.glb"
              play={play}
            />
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
      <button
        className="mt-6 px-6 py-2 rounded bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
        onClick={handlePlay}
      >
        Reproducir animación
      </button>
    </main>
  );
}
