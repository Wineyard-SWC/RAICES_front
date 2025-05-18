"use client";

import { useEffect, useState } from "react"
import { BurndownChart } from "@/components/burndownchart"
import { VelocityTrendChart } from "@/components/velocitytrend"
import { useParams } from "next/navigation"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"


interface BurndownDataPoint {
  day: string
  Remaining: number
  Ideal: number
}

interface VelocityPoint {
  sprint: string
  Planned: number
  Actual: number
}

const SprintChartsSection = () => {
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const { burndownData, velocityData } = useSprintDataContext()

  

  useEffect(() => {
    if (!burndownData) return

    try {
      const { duration_days, total_story_points } = burndownData
      
      const totalDays = duration_days + 1
      const idealDropPerDay = total_story_points / duration_days
      
      const generatedData: BurndownDataPoint[] = []
      
      for (let day = 0; day < totalDays; day++) {
        const ideal = total_story_points - idealDropPerDay * day
        generatedData.push({
          day: `Day ${day}`,
          Ideal: parseFloat(ideal.toFixed(2)),
          Remaining: total_story_points, 
        })
      }
      
      setChartData(generatedData)
    } catch (error) {
      console.error("Error processing burndown data:", error)
    } finally {
      setLoading(false)
    }
  }, [burndownData])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-bold mb-3">Burndown Chart</h2>
        {loading ? (
          <div className="bg-gray-100 rounded-md p-2 h-[250px] flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">Loading burndown chart...</div>
          </div>
        ) : chartData.length > 0 ? (
          <BurndownChart data={chartData} height={250}/>
        ) : (
          <div className="bg-gray-100 rounded-md p-2 h-[250px] flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">No data available</div>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-lg font-bold mb-3">Velocity Trend</h2>
        {loading ? (
          <div className="bg-gray-100 rounded-md p-2 h-[250px] flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">Loading velocity chart...</div>
          </div>
        ) : velocityData.length > 0 ? (
          <VelocityTrendChart data={velocityData} height={250} />
        ) : (
          <div className="bg-gray-100 rounded-md p-2 h-[250px] flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">No data available</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SprintChartsSection