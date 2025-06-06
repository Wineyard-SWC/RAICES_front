interface EmotionWheelProps {
  showNeutralPoint?: boolean
  currentEmotion?: string
}

export default function EmotionWheel({ showNeutralPoint = false, currentEmotion }: EmotionWheelProps) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Valence-Arousal wheel background */}
      <div className="w-full h-full rounded-full border-2 border-gray-300 relative bg-gradient-to-br from-red-100 via-yellow-100 to-green-100">
        {/* Axes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gray-400"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-0.5 bg-gray-400"></div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">High Arousal</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">Low Arousal</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium">Negative</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium">Positive</div>

        {/* Neutral point */}
        {showNeutralPoint && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-[#4a2b4a] rounded-full border-2 border-white"></div>
            <div className="text-xs font-medium mt-1 text-center whitespace-nowrap">Neutral</div>
          </div>
        )}

        {/* Current emotion indicator */}
        {currentEmotion && (
          <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  )
}
