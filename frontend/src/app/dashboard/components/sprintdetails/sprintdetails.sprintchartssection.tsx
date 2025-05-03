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
      const { duration_days, total_story_points, remaining_story_points } = burndownData
      const totalDays = duration_days + 1
      const idealDropPerDay = total_story_points / duration_days
      const actualDropPerDay = (total_story_points - remaining_story_points) / duration_days
    
      const generatedData: BurndownDataPoint[] = []
      for (let day = 0; day < totalDays; day++) {
        const ideal = total_story_points - idealDropPerDay * day
        const remaining = total_story_points - actualDropPerDay * day
        generatedData.push({
        day: `Day ${day}`,
        Ideal: parseFloat(ideal.toFixed(2)),
        Remaining: parseFloat(remaining.toFixed(2)),
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
    <div className="flex gap-4 mt-2 mb-2">
      <div className="w-1/2">
        {loading ? (
          <div className="text-center text-sm text-gray-500">Loading burndown chart...</div>
        ) : chartData.length > 0 ? (
          <BurndownChart data={chartData} height={350}/>
        ) : (
          <div className="text-center text-sm text-gray-500">No data available</div>
        )}
      </div>
      <div className="w-1/2">
        {velocityData.length > 0 ? (
          <VelocityTrendChart data={velocityData} height={350} />
        ) : (
          <div className="text-center text-sm text-gray-500">No data available</div>
        )}
      </div>
    </div>
  )
}

export default SprintChartsSection