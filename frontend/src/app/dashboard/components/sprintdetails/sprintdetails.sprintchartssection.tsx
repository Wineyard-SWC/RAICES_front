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
          Remaining: total_story_points, // This would be replaced with actual data
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
    <div className="flex gap-4 mt-10">
      <div className="w-1/2">
        {loading ? (
          <div className="text-center text-sm text-gray-500">Cargando burndown chart...</div>
        ) : chartData.length > 0 ? (
          <BurndownChart data={chartData} />
        ) : (
          <div className="text-center text-sm text-gray-500">No hay datos disponibles</div>
        )}
      </div>
      <div className="w-1/2">
        {velocityData.length > 0 ? (
          <VelocityTrendChart data={velocityData} />
        ) : (
          <div className="text-center text-sm text-gray-500">No hay datos de velocidad disponibles</div>
        )}
      </div>
    </div>
  )
}

export default SprintChartsSection