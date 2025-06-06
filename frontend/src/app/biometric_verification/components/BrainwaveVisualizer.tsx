"use client"

import React from "react";

interface BrainwaveVisualizerProps {
  eegData: number[];
  className?: string;
}

export default function BrainwaveVisualizer({ 
  eegData, 
  className = "h-16" 
}: BrainwaveVisualizerProps) {
  // No data to display
  if (!eegData || eegData.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-md ${className} p-2 relative overflow-hidden flex items-center justify-center`}>
        <p className="text-gray-400 text-sm">No EEG data available</p>
      </div>
    );
  }

  // Calculate path for visualization
  const path = `M 0,15 ${eegData.map((val, i) => `L ${i * (100 / Math.max(50, eegData.length))},${15 - val}`).join(" ")}`;

  return (
    <div className={`bg-gray-50 rounded-md ${className} p-2 relative overflow-hidden`}>
      <svg className="w-full h-full" viewBox="0 0 100 30">
        <path 
          d={path} 
          fill="none" 
          stroke="#8b5cf6" 
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}