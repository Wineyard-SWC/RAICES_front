import { BurndownChart } from "@/components/burndownchart"
import { ChartCard} from "./sprintdetails.chartcard"
import { VelocityTrendChart } from "@/components/velocitytrend"

const burndownData = [
  { day: "Day 0", Remaining: 100, Ideal: 100 },
  { day: "Day 1", Remaining: 95, Ideal: 90 },
  { day: "Day 2", Remaining: 90,  Ideal: 80 },
  { day: "Day 3", Remaining: 82,  Ideal: 70 },
  { day: "Day 4", Remaining: 76,  Ideal: 60 },
  { day: "Day 5", Remaining: 65,  Ideal: 50 },
  { day: "Day 6", Remaining: 58,  Ideal: 40 },
  { day: "Day 7", Remaining: 45,  Ideal: 30 },
  { day: "Day 8", Remaining: 35,  Ideal: 20 },
  { day: "Day 9", Remaining: 24,  Ideal: 10 },
  { day: "Day 10", Remaining: 15, Ideal: 0  },
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