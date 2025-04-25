import { ProgressCard } from "./progresscard"
import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../styles/dashboardstyles"

const DashboardStats = () => {
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
                <div className={s.chartContainer}>
                  <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <path d="M0,10 L75,30 L150,20 L225,40 L300,35" fill="none" stroke="#4a2b5c" strokeWidth="2" />
                  </svg>
                </div>
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
              <Button variant="default" className={s.button}>
                View Sprint Details
              </Button>
            }
          >
            <div className="space-y-4">
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