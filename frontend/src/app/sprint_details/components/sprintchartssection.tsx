"use client";

import { useEffect, useState } from "react"
import { BurndownChart } from "@/components/burndownchart"
import { VelocityTrendChart } from "@/components/velocitytrend"
import { useParams } from "next/navigation"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"
import { printError } from "@/utils/debugLogger";


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
  const { burndownData, velocityData } = useSprintDataContext()
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!burndownData?.chart_data) {
      setLoading(false)
      return
    }

    try {
      // Ordenar los datos por día si no están ya ordenados
      const sortedData = [...burndownData.chart_data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      
      setChartData(sortedData)
    } catch (error) {
      printError("Error processing burndown data:", error)
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
          <BurndownChart 
            data={chartData} 
            height={300}
            totalSP={burndownData?.sprint_info.total_story_points || 0}
          />
        ) : (
          <div className="bg-gray-100 rounded-md p-2 h-[300px] flex items-center justify-center">
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
          <VelocityTrendChart data={velocityData} height={300} />
        ) : (
          <div className="bg-gray-100 rounded-md p-2 h-[300px] flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">No data available</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SprintChartsSection