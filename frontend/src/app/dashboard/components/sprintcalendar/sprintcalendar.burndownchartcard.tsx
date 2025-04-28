import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { BurndownChart } from "@/components/burndownchart"
import { Calendar} from "lucide-react"

interface BurndownChartCardProps {
  actualPercentage: number
  idealPercentage: number
  burndownData: any
}

const BurndownChartCard = ({actualPercentage, idealPercentage, burndownData }: BurndownChartCardProps) => (
  <ProgressCard
    title="Burdown Chart"
    icon={<Calendar className={s.icon}/>}
  >
    <div className="space-y-4">
      {/* Burndown Chart */}
      <div>
        <BurndownChart data={burndownData} height={120} simple />
      </div>

      {/* Progress stats */}
        <div className={s.progressText}>
          <span>Actual: {actualPercentage}%</span>
          <span>Ideal: {idealPercentage}%</span>
        </div>
    </div>
  </ProgressCard>
)

export default BurndownChartCard
