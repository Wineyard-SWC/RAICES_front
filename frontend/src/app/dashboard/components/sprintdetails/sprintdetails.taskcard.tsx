import { Progress } from "@/components/progress"
import { Calendar, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sprintTaskCardStyles as s} from "../../styles/sprintdetailstaskcardstyles"


type Props = {
    title: string
    description: string
    assigneeName: string
    assigneeAvatar: string
    date: string
    status: string
    progress: number
    priority: "low" | "medium" | "high"
  }
  
export const SprintTaskCard = ({
    title,
    description,
    assigneeName,
    assigneeAvatar,
    date,
    status,
    progress,
    priority,
}: Props) => {
    const priorityClass =
      priority === "low"
        ? s.priorityLow
        : priority === "high"
        ? s.priorityHigh
        : s.priorityMedium
  
    return (
      <div className={s.card}>
        {/* Header */}
        <div className={s.header}>
          <div>
            <h3 className={s.title}>{title}</h3>
            <p className={s.description}>{description}</p>
          </div>
  
          <div className="flex items-center gap-2">
            <Button variant="outline" className={s.statusButton}>
              {status} <span className="ml-1">▾</span>
            </Button>
            <MoreVertical className={s.optionsIcon} />
          </div>
        </div>
  
        {/* Footer */}
        <div className={s.footer}>
          <div className={s.assigneeContainer}>
            <img src={assigneeAvatar} alt={assigneeName} className={s.avatar} />
            <span className={s.assigneeName}>{assigneeName}</span>
            <Calendar className={s.calendarIcon} />
            <span className={s.date}>{date}</span>
          </div>
  
          <div className={s.progressContainer}>
            <span className={s.progressLabel}>Progress</span>
            <div className="w-24">
              <Progress
                value={progress}
                className={s.progressBar}
                indicatorClassName={s.progressIndicator}
              />
            </div>
            <span className={cn(s.priorityBase, priorityClass)}>{priority}</span>
          </div>
        </div>
      </div>
    )
}