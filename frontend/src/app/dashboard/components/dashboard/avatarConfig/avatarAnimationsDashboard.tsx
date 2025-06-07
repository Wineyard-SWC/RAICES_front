// AnimatedAvatar.tsx
"use client"

import { useRef, useEffect, useState } from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { EmotionKey, getExpressionFromEmotion, applyExpressionToMesh } from "@/utils/avatarExpressions"
import { print } from "@/utils/debugLogger"

interface AvatarAnimationOptions {
  minDelay?: number
  maxDelay?: number
  idleTime?: number
  gender?: 'masculine' | 'feminine'
}

export function useAvatarAnimationName(options: AvatarAnimationOptions = {}) {
  const {
    minDelay = 2000,
    maxDelay = 4000,
    idleTime = 3000,
    gender = 'masculine'
  } = options

  const prefix = gender === 'feminine' ? 'F' : 'M'
  const idleName = `${prefix}_Standing_Idle_001`

  const specialNames = [
    `${prefix}_Standing_Idle_Variations_001`,
    `${prefix}_Standing_Idle_Variations_002`,
    `${prefix}_Standing_Idle_Variations_003`,
    `${prefix}_Standing_Idle_Variations_004`,
    `${prefix}_Standing_Idle_Variations_005`,
    `${prefix}_Standing_Idle_Variations_006`,
    `${prefix}_Standing_Idle_Variations_007`,
    `${prefix}_Standing_Idle_Variations_008`,
    `${prefix}_Standing_Idle_Variations_009`,
    // y si es masculino:
    ...(prefix === 'M' ? [`M_Standing_Idle_002`, `M_Standing_Idle_Variations_010`] : [])
  ]

  const [currentClip, setCurrentClip] = useState<string>(idleName)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const scheduleNext = (delay: number) => {
      timeout = setTimeout(() => {
        // pick special
        const variation = specialNames[Math.floor(Math.random() * specialNames.length)]
        setCurrentClip(variation)

        // después de ~3s volvemos a idle
        timeout = setTimeout(() => {
          setCurrentClip(idleName)
          // esperar idleTime para la siguiente
          scheduleNext(idleTime)
        }, 10000)
      }, delay)
    }

    // delay inicial
    const initial = minDelay + Math.random() * (maxDelay - minDelay)
    scheduleNext(initial)

    return () => clearTimeout(timeout)
  }, [idleName, specialNames.join(','), minDelay, maxDelay, idleTime])

  return { currentClip }
}

interface AnimatedAvatarProps {
  avatarUrl: string
  gender?: "masculine" | "feminine"
  minDelay?: number     // ms, delay mínimo antes de cada variación
  maxDelay?: number     // ms, delay máximo antes de cada variación
  idleTime?: number     // ms, tiempo en idle entre variaciones
  emotion?: string      // 🔥 NUEVA PROP: emoción del backend
  expressionIntensity?: number // 🔥 NUEVA PROP: intensidad de la expresión (0-1)
}

export function AnimatedAvatar({
  avatarUrl,
  gender = "masculine",
  minDelay = 2000,
  maxDelay = 4000,
  idleTime = 7000,
  emotion = "Neutral", // 🔥 VALOR POR DEFECTO
  expressionIntensity = 1.0 // 🔥 VALOR POR DEFECTO
}: AnimatedAvatarProps) {
  const group = useRef<THREE.Group>(null!)
  const [avatarScene, setAvatarScene] = useState<THREE.Object3D | null>(null)

  // Prefijo según género
  const prefix = gender === "feminine" ? "F" : "M"

  // Rutas a los GLB de idle + variaciones
  const idlePath = `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_001.glb`
  const variationPaths = [
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_001.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_002.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_003.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_004.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_005.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_006.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_007.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_008.glb`,
    `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_Variations_009.glb`,
    // si es masculino, un par extra
    ...(prefix === "M"
      ? [`/animation/avatarAnimations/idle/M_Standing_Idle_Variations_010.glb`]
      : []
    ),
  ]

  // 1) Carga GLBs
  const avatarGltf = useGLTF(avatarUrl)
  const idleGltf   = useGLTF(idlePath)
  const variationGltfs = variationPaths.map(p => useGLTF(p))

  // 2) Fusiona todos los clips
  const allClips = [
    ...idleGltf.animations,
    ...variationGltfs.flatMap(g => g.animations),
  ]

  // 3) Conecta acciones al grupo
  const { actions } = useAnimations(allClips, group)

  // 🔥 EFECTO PARA MANEJAR EXPRESIONES FACIALES
  useEffect(() => {
    if (!avatarScene) return;

    const targetExpression = getExpressionFromEmotion(emotion);
    
    // Buscar meshes con morph targets y aplicar la expresión
    avatarScene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        applyExpressionToMesh(object, targetExpression, expressionIntensity);
      }
    });

    print(`🎭 Applied expression: ${targetExpression} for emotion: ${emotion} with intensity: ${expressionIntensity}`);
  }, [avatarScene, emotion, expressionIntensity]);

  // 🔥 ESTABLECER LA ESCENA DEL AVATAR CUANDO SE CARGA
  useEffect(() => {
    if (avatarGltf.scene) {
      setAvatarScene(avatarGltf.scene);
    }
  }, [avatarGltf.scene]);

  // 4) SISTEMA DE ANIMACIONES (sin cambios)
  useEffect(() => {
    if (!actions) return

    // Nombres de los clips
    const idleName = `${prefix}_Standing_Idle_001`
    const specialNames = Object.keys(actions).filter(
      name => name !== idleName
    )

    let timer: NodeJS.Timeout

    // Función para reproducir una variación aleatoria
    function playVariation() {
      const variation = specialNames[
        Math.floor(Math.random() * specialNames.length)
      ]
      const varAction = actions[variation]!
      const idleAction = actions[idleName]!

      // cross-fade out del idle
      idleAction.fadeOut(0.5)

      // configurar la variación: 1 sola pasada y "clamp" en el último frame
      varAction.reset()
      varAction.setLoop(THREE.LoopOnce, 1)
      varAction.clampWhenFinished = true
      varAction.fadeIn(0.5).play()

      print("🎬 Playing animation variation:", variation)

      // programa el retorno al idle usando la duración real
      const durationMs = (varAction.getClip().duration || 3) * 1000

      timer = setTimeout(() => {
        // fade out de la variación
        varAction.fadeOut(0.5)
        // fade in del idle en bucle
        idleAction
          .reset()
          .setLoop(THREE.LoopRepeat, Infinity)
          .fadeIn(0.5)
          .play()

        // después de idleTime, lanzamos otra variación
        timer = setTimeout(playVariation, idleTime)
      }, durationMs + 200) // +200ms de buffer
    }

    // Al montar, arranca el idle en bucle
    const idleAction = actions[idleName]!
    idleAction
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .play()

    // Programa la primera variación con delay aleatorio
    const initialDelay = minDelay + Math.random() * (maxDelay - minDelay)
    timer = setTimeout(playVariation, initialDelay)

    return () => clearTimeout(timer)
  }, [actions, prefix, minDelay, maxDelay, idleTime])

  return (
    <group ref={group}>
      <primitive object={avatarGltf.scene} scale={1.5} position={[0, -2.2, 0]} />
    </group>
  )
}