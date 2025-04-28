import {styles} from "../../styles/calendarstyles"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { ListChecks } from "lucide-react"

const TaskStatusCard = () => (
  <ProgressCard
    title="Task Status"
    icon={<ListChecks className={styles.icon} />} 
  >
    <div className={styles.taskStatusGrid}>
      <div className="bg-blue-100 rounded flex items-center justify-center py-2">
        <span className="text-sm font-medium text-blue-800">4 To Do</span>
      </div>
      <div className="bg-purple-100 rounded flex items-center justify-center py-2">
        <span className="text-sm font-medium text-purple-800">3 In Progress</span>
      </div>
      <div className="bg-yellow-100 rounded flex items-center justify-center py-2">
        <span className="text-sm font-medium text-yellow-800">2 Review</span>
      </div>
      <div className="bg-green-100 rounded flex items-center justify-center py-2">
        <span className="text-sm font-medium text-green-800">3 Done</span>
      </div>
    </div>
  </ProgressCard>
)


export default TaskStatusCard
