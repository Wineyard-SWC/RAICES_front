import { ProgressCard } from "./dashboard.progresscard"
import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { BurndownChart } from "@/components/burndownchart"
import { useEffect, useState } from "react"

type Props = {
  onViewSprintDetails: () => void;
  onViewCalendar?: () => void;
}

interface BurndownDataPoint {
  day: string
  Remaining: number
  Ideal: number
}

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',  
    month: 'long',    
    day: 'numeric',   
})

const DashboardStats = ({ onViewSprintDetails, onViewCalendar}: Props) => {
  const [burndownData, setBurndownData] = useState<BurndownDataPoint[]>([])
  const projectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null

  useEffect(() => {
    const fetchBurndownData = async () => {
      const response = await fetch(`http://127.0.0.1:8000/api/burndown?projectId=${projectId}`)
      const data = await response.json()
    
      const { duration_days, total_story_points, remaining_story_points } = data
    
      const totalDays = duration_days + 1
      const idealDropPerDay = total_story_points / duration_days
      const actualDropPerDay = (total_story_points - remaining_story_points) / duration_days
    
      const generatedData: BurndownDataPoint[] = []
    
      for (let day = 0; day < totalDays; day++) {
        const ideal = total_story_points - idealDropPerDay * day
        const remaining = total_story_points - actualDropPerDay * day
    
        generatedData.push({
          day: `Day ${day}`,
          Ideal: parseFloat(ideal.toFixed(2)),
          Remaining: parseFloat(remaining.toFixed(2)),
        })
      }
    
      setBurndownData(generatedData)
    }    
  
    fetchBurndownData()
  }, [])
  

  const initialHeight = burndownData[0]?.Remaining ?? 100
  const lastData = burndownData[burndownData.length - 1] ?? { Remaining: 100, Ideal: 100 }

  const actualPercentage = Math.round(((initialHeight - lastData.Remaining) / initialHeight) * 100)
  const idealPercentage = Math.round(((initialHeight - lastData.Ideal) / initialHeight) * 100)

    return (
        <div className={s.container}>
          <ProgressCard
            title="Calendar & Burndown"
            icon={<Calendar className={s.icon} />}
            footer={
              <Button variant="default" 
              className={`${s.button} mt-4`}
              onClick={onViewCalendar}
              >
                View Calendar
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-gray-700">{todayString}</h3>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Burndown Chart</h4>
                <BurndownChart data={burndownData} height={120} simple />
              </div>
    
              <div className="space-y-2">
                <div className={s.progressText}>
                <span>Actual: {actualPercentage}%</span>
                <span>Ideal: {idealPercentage}%</span>
                </div>
    
                {/* <div className={s.progressLabel}>My workload</div>
                <Progress value={60} className={s.progressBar} indicatorClassName={s.progressBarIndicator} />
                <div className="text-right text-sm">24h / 40h</div> */}
              </div>
            </div>
          </ProgressCard>
    
          <ProgressCard
            title="Sprint Progress"
            icon={<BarChart2 className={s.icon} />}
            footer={
              <Button
                variant="default"
                className={`${s.button} mt-auto`}
                onClick={onViewSprintDetails}
              >
                View Sprint Details
              </Button>
            }
          >
            <div className={`${s.progressCard} flex flex-col space-y-4`}>
              <div className="mb-4">
                <div className={s.sprintLabel}>Sprint Velocity</div>
                <Progress value={85} className={`${s.progressBar} mt-2 mb-2`} indicatorClassName={s.progressBarIndicator} />
                <div className={s.sprintStats}>
                  <span>45 SP/Sprint</span>
                </div>
              </div>
    
              <div className="mb-4">
                <div className="flex justify-between">
                  <div className={s.sprintLabel}>Task Completion</div>
                  <div className={s.sprintStats}>92%</div>
                </div>
                <div className="mt-2">
                  <Progress value={92} className={`${s.progressBar} mt-2 mb-2`} indicatorClassName={s.progressBarIndicator} />
                </div>
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                
                  <div className={s.statCard}>
                    <Clock className={s.statIcon} />
                    <div className={s.statValue}>8</div>
                    <div className={s.statLabel}>Days Left</div>
                  </div>
      
                  <div className={s.statCard}>
                    <BarChart2 className={s.statIcon} />
                    <div className={s.statValue}>92%</div>
                    <div className={s.statLabel}>Completion</div>
                  </div>
                </div>
              </div>
            </div>
          </ProgressCard>
    
          <ProgressCard
            title="Personal Progress"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={s.svgIcon}
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
          >
            <div className="flex justify-center mb-4">
              <div className={s.profileWrapper}>
                <div className={s.profileCircle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-white"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className={s.emojiBadge}>😄</div>
              </div>
            </div>
            
            <div className={`${s.progressCard} flex flex-col space-y-4`}>
              <div className={s.taskGrid}>
                <div className={s.statCard}>
                  <div className={s.statValue}>37</div>
                  <div className={s.statLabel}>Completed Tasks</div>
                </div>
      
                <div className={s.statCard}>
                  <div className={s.statValue}>2</div>
                  <div className={s.statLabel}>In Progress</div>
                </div>
              </div>
            </div>
          </ProgressCard>
        </div>
    );
}

export default DashboardStats;