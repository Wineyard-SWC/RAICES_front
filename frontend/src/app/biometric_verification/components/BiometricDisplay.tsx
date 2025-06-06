import type { BiometricData } from "../page"

interface BiometricDisplayProps {
  biometricData: BiometricData
  showToUser: boolean
}

const emotionEmojis = {
  Happy: "😊",
  Focused: "🎯",
  Bored: "😴",
  Stressed: "😰",
}

export default function BiometricDisplay({ biometricData, showToUser }: BiometricDisplayProps) {
  if (!showToUser) {
    // Only show a generic "monitoring" indicator to the user
    return (
      <div className="flex items-center text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
        Monitoring biometrics...
      </div>
    )
  }

  // This would be shown to the planning conductor
  return (
    <div className="flex items-center">
      <span className="text-sm mr-2">Emotion:</span>
      <div className="flex items-center">
        <span className="text-lg mr-1">{emotionEmojis[biometricData.emotion]}</span>
        <span className="text-sm">{biometricData.emotion}</span>
      </div>
    </div>
  )
}
