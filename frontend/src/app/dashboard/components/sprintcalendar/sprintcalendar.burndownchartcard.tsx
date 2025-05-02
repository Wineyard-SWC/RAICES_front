import { useEffect, useState } from "react"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { BurndownChart } from "@/components/burndownchart"
import { Calendar } from "lucide-react"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"

interface BurndownDataPoint {
  day: string
  Remaining: number
  Ideal: number
}
const apiURL = process.env.NEXT_PUBLIC_API_URL!

const BurndownChartCard = () => {
  const [chartData, setChartData] = useState<BurndownDataPoint[]>([])
  const [actualPercentage, setActualPercentage] = useState(0)
  const [idealPercentage, setIdealPercentage] = useState(0)
  const { burndownData } = useSprintDataContext()

  useEffect(() => {
    if (!burndownData) return
    
    const { duration_days, total_story_points } = burndownData
    const totalDays = duration_days + 1
    const idealDropPerDay = total_story_points / duration_days
    
    const generatedData: BurndownDataPoint[] = []
    
    for (let day = 0; day < totalDays; day++) {
      const ideal = total_story_points - idealDropPerDay * day
      generatedData.push({
        day: Day ${day},
        Ideal: parseFloat(ideal.toFixed(2)),
        Remaining: total_story_points, // This would be replaced with actual remaining points
      })
    }
    
    setChartData(generatedData)
    
    const initial = total_story_points
    const last = generatedData[generatedData.length - 1]
    
    setActualPercentage(Math.round(((initial - last.Remaining) / initial) * 100))
    setIdealPercentage(Math.round(((initial - last.Ideal) / initial) * 100))
  }, [burndownData])

  return (
    <ProgressCard
      title="Burndown Chart"
      icon={<Calendar className={s.icon} />}
    >
      <div className="space-y-4">
        <div>
          {chartData.length > 0 && (
            <BurndownChart data={chartData} height={120} simple />
          )}
        </div>
        <div className={s.progressText}>
          <span>Actual: {actualPercentage}%</span>
          <span>Ideal: {idealPercentage}%</span>
        </div>
      </div>
    </ProgressCard>
  )
}


export default BurndownChartCard