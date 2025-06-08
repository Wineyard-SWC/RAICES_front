// Mapeo de emociones del backend a expresiones faciales
export const EMOTION_EXPRESSIONS = {
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