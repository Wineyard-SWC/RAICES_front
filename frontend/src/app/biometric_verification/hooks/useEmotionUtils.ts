"use client";

// ✅ MAPEO CORREGIDO - usar exactamente las mismas claves que en EXPRESSIONS
const EMOTION_TO_EXPRESSION = {
  'Relaxed': 'Relaxed',     // ✅ Coincide con EXPRESSIONS
  'Happy': 'Happy',         // ✅ Coincide con EXPRESSIONS
  'Euphoric': 'Euphoric',   // ✅ Coincide con EXPRESSIONS
  'Calm': 'Calm',           // ✅ Coincide con EXPRESSIONS
  'Excited': 'Excited',     // ✅ Coincide con EXPRESSIONS
  'Sad': 'Sad',             // ✅ Coincide con EXPRESSIONS
  'Stressed': 'Stressed',   // ✅ Coincide con EXPRESSIONS
  'Neutral': 'Neutral'      // ✅ Coincide con EXPRESSIONS
};

// Mapeo de emociones a emojis (este está bien)
const EMOTION_EMOJIS = {
  'Relaxed': '😌',
  'Happy': '😁',
  'Euphoric': '🤯',
  'Calm': '😌',
  'Excited': '🤩',
  'Sad': '😢',
  'Stressed': '😰',
  'Neutral': '😐'
};

export const useEmotionUtils = () => {
  
  const getEmotionExpression = (emotion: string): string => {
    return EMOTION_TO_EXPRESSION[emotion] || 'Neutral'; // ✅ Fallback a 'Neutral' en lugar de 'neutral'
  };

  const getEmotionEmoji = (emotion: string): string => {
    return EMOTION_EMOJIS[emotion] || '😐';
  };

  const getStressLevel = (stress: number): { level: string; color: string; description: string } => {
    if (stress <= 0.3) {
      return {
        level: 'Low',
        color: 'text-green-600 bg-green-50',
        description: 'Very manageable stress level'
      };
    } else if (stress <= 0.6) {
      return {
        level: 'Moderate',
        color: 'text-yellow-600 bg-yellow-50',
        description: 'Normal stress level'
      };
    } else {
      return {
        level: 'High',
        color: 'text-red-600 bg-red-50',
        description: 'Elevated stress level'
      };
    }
  };

  const getHeartRateStatus = (hr: number | null, baseline: number): { status: string; color: string } => {
    if (!hr) return { status: 'Unknown', color: 'text-gray-500' };
    
    const diff = ((hr - baseline) / baseline) * 100;
    
    if (Math.abs(diff) <= 10) {
      return { status: 'Normal', color: 'text-green-600' };
    } else if (diff > 10) {
      return { status: 'Elevated', color: 'text-red-600' };
    } else {
      return { status: 'Below baseline', color: 'text-blue-600' };
    }
  };

  const getArousalValenceStatus = (arousal: number, valence: number): { 
    status: string; 
    color: string; 
    description: string 
  } => {
    if (arousal > 0 && valence > 0) {
      return {
        status: 'Positive Energy',
        color: 'text-green-600',
        description: 'High energy, positive mood'
      };
    } else if (arousal > 0 && valence < 0) {
      return {
        status: 'Agitated',
        color: 'text-red-600',
        description: 'High energy, negative mood'
      };
    } else if (arousal < 0 && valence > 0) {
      return {
        status: 'Peaceful',
        color: 'text-blue-600',
        description: 'Low energy, positive mood'
      };
    } else {
      return {
        status: 'Low Energy',
        color: 'text-gray-600',
        description: 'Low energy, neutral/negative mood'
      };
    }
  };

  return {
    getEmotionExpression,
    getEmotionEmoji,
    getStressLevel,
    getHeartRateStatus,
    getArousalValenceStatus
  };
};