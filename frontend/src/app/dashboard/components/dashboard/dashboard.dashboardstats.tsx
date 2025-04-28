import { ProgressCard } from "./dashboard.progresscard"
import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { BurndownChart } from "@/components/burndownchart"

type Props = {
  onViewSprintDetails: () => void;
  onViewCalendar?: () => void;
}

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

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',  
    month: 'long',    
    day: 'numeric',   
})

const DashboardStats = ({ onViewSprintDetails, onViewCalendar}: Props) => {
  const initialHeight = burndownData[0].Remaining;
  const lastData = burndownData[burndownData.length - 1];

  const actualPercentage = Math.round(((initialHeight - lastData.Remaining) / initialHeight) * 100);
  const idealPercentage = Math.round(((initialHeight - lastData.Ideal) / initialHeight) * 100);
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
    
                <div className={s.progressLabel}>My workload</div>
                <Progress value={60} className={s.progressBar} indicatorClassName={s.progressBarIndicator} />
                <div className="text-right text-sm">24h / 40h</div>
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