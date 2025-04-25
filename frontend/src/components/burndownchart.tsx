"use client"

import React from "react"

interface BurndownChartProps {
  actualData: number[]
  idealData: number[]
  width?: number
  height?: number
  strokeColor?: string
  idealStrokeColor?: string
  className?: string
}

export const BurndownChart: React.FC<BurndownChartProps> = ({
  actualData,
  idealData,
  width = 300,
  height = 80,
  strokeColor = "#4a2b5c",
  idealStrokeColor = "#aaa",
  className = "",
}) => {
  const maxLength = Math.max(actualData.length, idealData.length)
  const scaleX = width / (maxLength - 1)
  const scaleY = height / 100

  const buildPath = (data: number[]) =>
    data
      .map((value, index) => `L${index * scaleX},${height - value * scaleY}`)
      .join(" ")
      .replace(/^L/, "M")

  const actualPath = buildPath(actualData)
  const idealPath = buildPath(idealData)

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      {/* Ideal */}
      <path
        d={idealPath}
        fill="none"
        stroke={idealStrokeColor}
        strokeWidth={2}
        strokeDasharray="4"
      />
      {/* Real */}
      <path
        d={actualPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
      />
    </svg>
  )
}