import { useEffect, useState } from "react"
import { BurndownChart } from "@/components/burndownchart"
import { VelocityTrendChart } from "@/components/velocitytrend"
import { useParams } from "next/navigation"

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
  const [burndownData, setBurndownData] = useState<BurndownDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const projectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null

  useEffect(() => {
    const fetchBurndownData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/burndown?projectId=${projectId}`)
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
            Remaining: total_story_points, // Simulación inicial
          })
        }

        setBurndownData(generatedData)
      } catch (error) {
        console.error("Error al cargar burndown data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBurndownData()
  }, [])

  const [velocityData, setVelocityData] = useState<VelocityPoint[]>([])

  useEffect(() => {
    const fetchVelocityTrend = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/velocitytrend?projectId=${projectId}`)
        const data = await res.json()
        setVelocityData(data)
      } catch (err) {
        console.error("Error fetching velocity trend:", err)
      }
    }

    fetchVelocityTrend()
  }, [])

  return (
    <div className="flex gap-4 mt-10">
      <div className="w-1/2">
        {loading ? (
          <div className="text-center text-sm text-gray-500">Cargando burndown chart...</div>
        ) : (
          <BurndownChart data={burndownData} />
        )}
      </div>
      <div className="w-1/2">
      <VelocityTrendChart data={velocityData} />
      </div>
    </div>
  )
}

export default SprintChartsSection