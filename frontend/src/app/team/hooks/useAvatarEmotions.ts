"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { print, printError } from "@/utils/debugLogger";

// Mapeo de emociones a morfos faciales (mismo que AvatarDisplay)
const EMOTION_MORPH_MAP = {
  anger: 'viseme_aa',
  disgust: 'mouthPucker',
  fear: 'mouthOpen',
  joy: 'mouthSmile',
  sadness: 'mouthFrown',
  surprise: 'jawOpen',
  neutral: null, // Sin morfos para neutral
  happy: 'mouthSmile',
  excited: 'mouthSmile',
  calm: null,
  stressed: 'mouthFrown',
  focused: 'mouthPress',
  tired: 'eyesClosed'
};

export const useAvatarEmotions = (avatarScene, emotion = 'neutral', intensity = 0.6) => {
  useEffect(() => {
    if (!avatarScene || !emotion) return;

    try {
      // Buscar el mesh del avatar que tiene morfos
      let avatarMesh = null;
      
      avatarScene.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 0) {
          avatarMesh = child;
        }
      });

      if (!avatarMesh || !avatarMesh.morphTargetDictionary || !avatarMesh.morphTargetInfluences) {
        print("🎭 No morph targets found for avatar");
        return;
      }

      // Resetear todos los morfos a 0
      const morphTargets = avatarMesh.morphTargetDictionary;
      for (let i = 0; i < avatarMesh.morphTargetInfluences.length; i++) {
        avatarMesh.morphTargetInfluences[i] = 0;
      }

      // Aplicar emoción específica
      const targetMorph = EMOTION_MORPH_MAP[emotion.toLowerCase()];
      
      if (targetMorph && morphTargets[targetMorph] !== undefined) {
        const morphIndex = morphTargets[targetMorph];
        avatarMesh.morphTargetInfluences[morphIndex] = intensity;
        print(`🎭 Applied emotion "${emotion}" with morph "${targetMorph}" at intensity ${intensity}`);
      } else {
        print(`🎭 Emotion "${emotion}" mapped to neutral (no morph applied)`);
      }

    } catch (error) {
      printError("Error applying avatar emotion:", error);
    }
  }, [avatarScene, emotion, intensity]);
};