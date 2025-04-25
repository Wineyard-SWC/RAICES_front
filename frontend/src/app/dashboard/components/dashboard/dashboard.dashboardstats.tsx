import { ProgressCard } from "./dashboard.progresscard"
import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { BurndownChart } from "@/components/burndownchart"

type Props = {
  onViewSprintDetails: () => void;
}

const burndownData = [
  { day: "Day 1", remaining: 100, ideal: 90 },
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

const DashboardStats = ({ onViewSprintDetails }: Props) => {
    return (
        <div className={s.container}>
          <ProgressCard
            title="Calendar & Burndown"
            icon={<Calendar className={s.icon} />}
            footer={
              <Button variant="default" className={s.button}>
                View Calendar
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-gray-700">Friday, March 7</h3>
              </div>
    
              <div>
                <h4 className="font-medium mb-2">Burndown Chart</h4>
                <BurndownChart data={burndownData} />
              </div>
    
              <div className="space-y-2">
                <div className={s.progressText}>
                  <span>Actual 70%</span>
                  <span>Ideal: 83%</span>
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
                className={s.button}
                onClick={onViewSprintDetails}
              >
                View Sprint Details
              </Button>
            }
          >
            <div className="space-y-4 mb-20">
              <div className="mb-2">
                <div className={s.sprintLabel}>Sprint Velocity</div>
                <Progress value={85} className={`${s.progressBar} mt-1`} indicatorClassName={s.progressBarIndicator} />
                <div className={s.sprintStats}>
                  <span>45 SP/Sprint</span>
                </div>
              </div>
    
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
          </ProgressCard>
        </div>
    );
}

export default DashboardStats;