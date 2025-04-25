import { BurndownChart } from "@/components/burndownchart"
import { ChartCard} from "./sprintdetails.chartcard"
import { VelocityTrendChart } from "@/components/velocitytrend"
 
const burndownData = [
  { day: "Day 0", remaining: 100, ideal: 100 },
  { day: "Day 1", remaining: 95, ideal: 90 },
  { day: "Day 2", remaining: 90,  ideal: 80 },
  { day: "Day 3", remaining: 82,  ideal: 70 },
  { day: "Day 4", remaining: 76,  ideal: 60 },
  { day: "Day 5", remaining: 65,  ideal: 50 },
  { day: "Day 6", remaining: 58,  ideal: 40 },
  { day: "Day 7", remaining: 45,  ideal: 30 },
  { day: "Day 8", remaining: 35,  ideal: 20 },
  { day: "Day 9", remaining: 24,  ideal: 10 },
  { day: "Day 10", remaining: 15, ideal: 0  },
]

const velocityData = [
  { sprint: "Sprint 1", Planned: 35, Actual: 28 },
  { sprint: "Sprint 2", Planned: 40, Actual: 34 },
  { sprint: "Sprint 3", Planned: 42, Actual: 39 },
  { sprint: "Current",  Planned: 38, Actual: 22 },
]
const SprintChartsSection = () => {
  return (
    <div className="flex gap-4">
      <div className="w-1/2">
      <BurndownChart data={burndownData} />
      </div>
      <div className="w-1/2">
        <VelocityTrendChart data={velocityData} />
      </div>
    </div>
  )
}


export default SprintChartsSection