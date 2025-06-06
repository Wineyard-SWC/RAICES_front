// Mapeo de emociones del backend a expresiones faciales
export const EMOTION_EXPRESSIONS = {
  Relaxed: {
    mouthSmileLeft: 0.2,
    mouthSmileRight: 0.2,
    eyeSquintLeft: 0.1,
    eyeSquintRight: 0.1,
    cheekSquintLeft: 0.1,
    cheekSquintRight: 0.1
  },
  Happy: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4
  },
  Euphoric: {
    mouthSmileLeft: 1.0,
    mouthSmileRight: 1.0,
    mouthOpen: 0.4,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    cheekSquintLeft: 0.8,
    cheekSquintRight: 0.8,
    browInnerUp: 0.3
  },
  Calm: {
    mouthSmileLeft: 0.1,
    mouthSmileRight: 0.1,
    eyeSquintLeft: 0.05,
    eyeSquintRight: 0.05
  },
  Excited: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    eyeWideLeft: 0.3,
    eyeWideRight: 0.3,
    browInnerUp: 0.4,
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
    cheekSquintLeft: 0.5,
    cheekSquintRight: 0.5
  },
  Sad: {
    browDownLeft: 0.5,
    browDownRight: 0.5,
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    mouthLowerDownLeft: 0.3,
    mouthLowerDownRight: 0.3,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2
  },
  Stressed: {
    browDownLeft: 0.7,
    browDownRight: 0.7,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
    jawForward: 0.2,
    noseSneerLeft: 0.3,
    noseSneerRight: 0.3
  },
  Neutral: {
    // Expresión neutral - todos los valores en 0 (no necesarios, pero por claridad)
  }
} as const;

export type EmotionKey = keyof typeof EMOTION_EXPRESSIONS;

// Función para obtener la expresión basada en la emoción del backend
export function getExpressionFromEmotion(emotion: string): EmotionKey {
  // Mapear las emociones del backend a nuestras expresiones
  const emotionMap: Record<string, EmotionKey> = {
    'Relaxed': 'Relaxed',
    'Happy': 'Happy', 
    'Euphoric': 'Euphoric',
    'Calm': 'Calm',
    'Excited': 'Excited',
    'Sad': 'Sad',
    'Stressed': 'Stressed',
    // Fallbacks para otras posibles emociones
    'Neutral': 'Neutral',
    'Angry': 'Stressed', // Mapear angry a stressed
    'Surprised': 'Excited', // Mapear surprised a excited
  };

  return emotionMap[emotion] || 'Neutral';
}

// Función para aplicar expresión a un mesh con morph targets
export function applyExpressionToMesh(
  mesh: THREE.Mesh, 
  expression: EmotionKey,
  intensity: number = 1.0
) {
  if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
    return;
  }

  // Resetear todas las expresiones primero
  for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
    mesh.morphTargetInfluences[i] = 0;
  }

  // Aplicar la nueva expresión
  const expressionData = EMOTION_EXPRESSIONS[expression];
  if (expressionData) {
    for (const [blendshapeName, value] of Object.entries(expressionData)) {
      const index = mesh.morphTargetDictionary[blendshapeName];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = (value as number) * intensity;
      }
    }
  }
}