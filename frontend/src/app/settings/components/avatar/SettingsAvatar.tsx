"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { Suspense } from "react"
import dynamic from "next/dynamic"

// Componente dinámico para evitar problemas de SSR
const DynamicCanvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
)

interface SettingsAvatarProps {
  avatarUrl: string
  gender?: "masculine" | "feminine"
}

function AvatarModel({ avatarUrl, gender = "masculine" }: SettingsAvatarProps) {
  const group = useRef<THREE.Group>(null!)
  const [animationPhase, setAnimationPhase] = useState<"expression" | "idle">("expression")
  
  // Prefijo según género
  const prefix = gender === "feminine" ? "F" : "M"
  
  // URLs de las animaciones necesarias
  const expressionUrl = `/animation/avatarAnimations/expression/${prefix}_Standing_Expressions_013.glb`
  const idleUrl = `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_001.glb`

  // Cargar el modelo del avatar
  const avatarGltf = useGLTF(avatarUrl)
  
  // Cargar las animaciones
  const expressionGltf = useGLTF(expressionUrl)
  const idleGltf = useGLTF(idleUrl)
  
  // Configurar animaciones
  const expressionAnimations = useAnimations(expressionGltf.animations, group)
  const idleAnimations = useAnimations(idleGltf.animations, group)

  useEffect(() => {
    // Primero mostrar la animación de expresión
    const expressionAction = expressionAnimations.actions[`${prefix}_Standing_Expressions_013`]
    if (expressionAction) {
      // Configurar la animación para que se reproduzca solo una vez
      expressionAction.reset()
      expressionAction.setLoop(THREE.LoopOnce, 1)
      expressionAction.clampWhenFinished = false
      expressionAction.play()

      // Obtener la duración de la animación y programar la transición a idle
      const expressionDuration = expressionAction.getClip().duration * 1000
      
      // Cuando termine la expresión, transicionar a idle
      setTimeout(() => {
        expressionAction.fadeOut(0.5)
        setAnimationPhase("idle")
        
        // Iniciar la animación idle
        const idleAction = idleAnimations.actions[`${prefix}_Standing_Idle_001`]
        if (idleAction) {
          idleAction.reset()
          idleAction.setLoop(THREE.LoopRepeat, Infinity)
          idleAction.fadeIn(0.5)
          idleAction.play()
        }
      }, expressionDuration + 300) // Agregamos un pequeño margen
    }

    return () => {
      // Detener todas las animaciones al desmontar
      Object.values(expressionAnimations.actions).forEach(action => action?.stop())
      Object.values(idleAnimations.actions).forEach(action => action?.stop())
    }
  }, [prefix, expressionAnimations, idleAnimations])

  return (
    <group ref={group}>
      <primitive 
        object={avatarGltf.scene} 
        scale={1.5} 
        position={[0, -2.2, 0]}
      />
    </group>
  )
}

export default function SettingsAvatar({ avatarUrl, gender = "masculine" }: SettingsAvatarProps) {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "200px" }}>
      <DynamicCanvas
        camera={{ position: [0, 0.3, 3.5], fov: 25 }}
        shadows
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={1} />
        <Suspense fallback={null}>
          <AvatarModel 
            avatarUrl={avatarUrl} 
            gender={gender} 
          />
        </Suspense>
      </DynamicCanvas>
    </div>
  )
}