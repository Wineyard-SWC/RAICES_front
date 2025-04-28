import {styles} from "../../styles/calendarstyles"
import { Activity } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { Progress } from "@/components/progress"


interface SprintProgressCardProps {
  completedTasks: number
  totalTasks: number
}

const SprintProgressCard = ({ completedTasks, totalTasks }: SprintProgressCardProps) => {
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <ProgressCard
      title="Sprint Progress"
      icon={<Activity className={styles.icon} />} 
    >
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress
            value={completionPercentage}
            className={styles.progressBar}
            indicatorClassName={styles.progressBarIndicator}
          />
          <div className={styles.progressText}>
            <span>{completionPercentage}% completed</span>
            <span>{completedTasks} of {totalTasks} tasks</span>
          </div>
        </div>
      </div>
    </ProgressCard>
  )
}

export default SprintProgressCard;
