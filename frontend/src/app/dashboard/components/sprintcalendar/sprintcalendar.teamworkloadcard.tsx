import { Users } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { Progress } from "@/components/progress"
import {styles} from "../../styles/calendarstyles"

interface UserWorkload {
  name: string
  progress: number 
  tasks: string
}

const users: UserWorkload[] = [
  { name: "Emma Smith", progress: 75, tasks: "3/4 Tasks" },
  { name: "Mike Johnson", progress: 83, tasks: "5/6 Tasks" },
]


const TeamWorkloadCard = () => {
  return (
    <ProgressCard
      title="Team Workload"
      icon={<Users className={styles.icon} />} // Icono de "equipo"
    >
      <div className="space-y-4">
        {users.map((user, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                  <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <span className="text-sm text-gray-600">{user.tasks}</span>
            </div>

            {/* Barra de progreso */}
            <Progress
              value={user.progress}
              className={styles.progressBar}
              indicatorClassName={styles.progressBarIndicator}
            />
          </div>
        ))}
      </div>
    </ProgressCard>
  )
}

export default TeamWorkloadCard
