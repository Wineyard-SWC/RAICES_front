"use client"

import React from "react";

interface ElectrodeQualityIndicatorProps {
  electrodeQuality: number[];
}

export default function ElectrodeQualityIndicator({ 
  electrodeQuality 
}: ElectrodeQualityIndicatorProps) {
  // Map electrode names to positions
  const electrodes = [
    { name: "TP9", value: electrodeQuality[0], position: { top: "70%", left: "15%" } },
    { name: "AF7", value: electrodeQuality[1], position: { top: "20%", left: "30%" } },
    { name: "AF8", value: electrodeQuality[2], position: { top: "20%", right: "30%" } },
    { name: "TP10", value: electrodeQuality[3], position: { top: "70%", right: "15%" } },
  ];

  // Get color based on quality value
  const getQualityColor = (value: number): string => {
    if (value > 0.8) return "bg-emerald-500";
    if (value > 0.6) return "bg-green-500";
    if (value > 0.4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="relative h-64 w-full max-w-md mx-auto bg-gray-50 rounded-lg p-4">
      {/* Head outline */}
      <div className="absolute h-40 w-32 border-2 border-gray-300 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Eyes */}
        <div className="absolute h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ top: "35%", left: "35%" }}></div>
        <div className="absolute h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ top: "35%", right: "35%" }}></div>
        {/* Nose */}
        <div className="absolute h-3 w-1.5 bg-gray-400 rounded-full" style={{ top: "45%", left: "50%", transform: "translateX(-50%)" }}></div>
        {/* Mouth */}
        <div className="absolute h-1 w-6 bg-gray-400 rounded-full" style={{ top: "60%", left: "50%", transform: "translateX(-50%)" }}></div>
      </div>

      {/* Electrodes */}
      {electrodes.map((electrode, index) => (
        <div key={index} className="absolute" style={electrode.position as React.CSSProperties}>
          <div className="relative">
            <div className={`h-4 w-4 rounded-full ${getQualityColor(electrode.value)}`}></div>
            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
              {electrode.name}
            </span>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-3 text-xs">
        <div className="flex items-center">
          <div className="h-2 w-2 bg-red-500 rounded-full mr-1"></div>
          <span>Poor</span>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></div>
          <span>Fair</span>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
          <span>Good</span>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-emerald-500 rounded-full mr-1"></div>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
}