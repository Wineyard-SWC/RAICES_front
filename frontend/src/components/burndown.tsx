"use client"

import { useEffect, useState } from "react"
import { BurndownChart } from "@/components/burndownchart"

interface BurndownDataPoint {
  day: string
  Ideal: number
  Remaining: number
}

interface BurndownResponse {
  duration_days: number
  total_story_points: number
}

export default function BurndownPage() {
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([])

  useEffect(() => {
    const fetchBurndownData = async () => {
      const response = await fetch("http://localhost:8000/api/burndown")
      const data: BurndownResponse = await response.json()

      const { duration_days, total_story_points } = data
      const totalDays = duration_days + 1 // includes Day 0
      const idealDropPerDay = total_story_points / duration_days

      const generatedData: BurndownDataPoint[] = []

      for (let day = 0; day < totalDays; day++) {
        const ideal = total_story_points - idealDropPerDay * day
        generatedData.push({
          day: `Day ${day}`,
          Ideal: parseFloat(ideal.toFixed(2)),
          Remaining: total_story_points, // Will be manually adjusted below
        })
      }

      // Simulación de Remaining/Real Story Points
      if (generatedData.length > 1) generatedData[1].Remaining = total_story_points - 2
      if (generatedData.length > 2) generatedData[2].Remaining = total_story_points - 5
      if (generatedData.length > 3) generatedData[3].Remaining = total_story_points - 7
      if (generatedData.length > 4) generatedData[4].Remaining = total_story_points - 9

      setChartData(generatedData)
    }

    fetchBurndownData()
  }, [])

  return (
    <div className="p-6">
      <BurndownChart data={chartData} />
    </div>
  )
}