"use client"

import { useState } from "react"

interface ComplexitySliderProps {
  value: number
  onValueChange: (value: number) => void
  className?: string
}

export default function ComplexitySlider({ 
  value, 
  onValueChange, 
  className = "" 
}: ComplexitySliderProps) {
  // Función para obtener el color basado en el valor (5 = verde, 1 = rojo)
  const getSliderColor = (val: number): string => {
    const colors = {
      1: "#ef4444", // rojo - muy difícil
      2: "#f97316", // naranja
      3: "#eab308", // amarillo
      4: "#84cc16", // verde claro
      5: "#22c55e"  // verde - muy simple
    }
    return colors[val as keyof typeof colors] || "#6b7280"
  }

  // Función para obtener el texto de la complejidad
  const getComplexityText = (val: number): string => {
    const texts = {
      1: "Very difficult",
      2: "Difficult", 
      3: "Normal",
      4: "Simple",
      5: "Very simple"
    }
    return texts[val as keyof typeof texts] || "Normal"
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">Very difficult</span>
        <span className="text-sm text-gray-600">Very simple</span>
      </div>
      
      <div className="relative px-2">
        {/* Track background */}
        <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden">
          {/* Gradient background */}
          <div 
            className="h-full rounded-full transition-all duration-300 ease-in-out"
            style={{
              background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)',
              width: `${(value / 5) * 100}%`
            }}
          />
        </div>
        
        {/* Slider input */}
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onValueChange(parseInt(e.target.value))}
          className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
        />
        
        {/* Custom thumb */}
        <div
          className="absolute top-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg cursor-pointer transform -translate-y-1/2 transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: getSliderColor(value),
            left: `calc(${((value - 1) / 4) * 100}% - 12px)`
          }}
        />
      </div>
      
      {/* Value markers */}
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <span 
            key={num}
            className={`transition-colors ${value === num ? 'text-gray-700 font-medium' : ''}`}
          >
            {num}
          </span>
        ))}
      </div>
      
      {/* Current value display */}
      <div className="text-center mt-4">
        <span 
          className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white transition-colors duration-300"
          style={{ backgroundColor: getSliderColor(value) }}
        >
          {getComplexityText(value)}
        </span>
      </div>
    </div>
  )
}