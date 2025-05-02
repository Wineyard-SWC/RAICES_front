import { useEffect, useState } from "react"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { BurndownChart } from "@/components/burndownchart"
import { Calendar } from "lucide-react"

interface BurndownDataPoint {
  day: string
  Remaining: number
  Ideal: number
}

const BurndownChartCard = () => {
  const [burndownData, setBurndownData] = useState<BurndownDataPoint[]>([])
  const [actualPercentage, setActualPercentage] = useState(0)
  const [idealPercentage, setIdealPercentage] = useState(0)

  useEffect(() => {
    const fetchBurndownData = async () => {
      const response = await fetch("http://localhost:8000/api/burndown")
      const data = await response.json()

      const { duration_days } = data
      let { total_story_points } = data

      const totalDays = duration_days + 1
      const idealDropPerDay = total_story_points / duration_days

      const generatedData: BurndownDataPoint[] = []

      for (let day = 0; day < totalDays; day++) {
        const ideal = total_story_points - idealDropPerDay * day
        generatedData.push({
          day: `Day ${day}`,
          Ideal: parseFloat(ideal.toFixed(2)),
          Remaining: total_story_points, // puedes cambiar esto si más adelante se calcula dinámicamente
        })
      }

      setBurndownData(generatedData)

      const initialHeight = generatedData[0]?.Remaining ?? 100
      const lastData = generatedData[generatedData.length - 1] ?? { Remaining: 100, Ideal: 100 }

      const actual = Math.round(((initialHeight - lastData.Remaining) / initialHeight) * 100)
      const ideal = Math.round(((initialHeight - lastData.Ideal) / initialHeight) * 100)

      setActualPercentage(actual)
      setIdealPercentage(ideal)
    }

    fetchBurndownData()
  }, [])

  return (
    <ProgressCard
      title="Burndown Chart"
      icon={<Calendar className={s.icon} />}
    >
      <div className="space-y-4">
        <div>
          <BurndownChart data={burndownData} height={120} simple />
        </div>
      </div>
    </ProgressCard>
  )
}

export default BurndownChartCard