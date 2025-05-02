import { ProgressCard } from "./dashboard.progresscard";
import { Calendar, Clock, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/progress";
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles";
import { BurndownChart } from "@/components/burndownchart";
import { useEffect, useState, useMemo } from "react";
import { useSprintDataContext } from "@/contexts/sprintdatacontext";
import { useBacklogContext } from "@/contexts/backlogcontext";

type Props = {
  onViewSprintDetails: () => void;
  onViewCalendar?: () => void;
};

interface BurndownDataPoint {
  day: string;
  Remaining: number;
  Ideal: number;
}

const today = new Date();
const todayString = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const apiURL = process.env.NEXT_PUBLIC_API_URL!;

const DashboardStats = ({ onViewSprintDetails, onViewCalendar }: Props) => {
  // State for burndown chart
  const [burndownChartData, setBurndownChartData] = useState<BurndownDataPoint[]>([]);
  const [actualPercentage, setActualPercentage] = useState(0);
  const [idealPercentage, setIdealPercentage] = useState(0);

  // Get the active projectId from localStorage and make it reactive
  const [projectId, setProjectId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null
  );

  // Update projectId state when localStorage changes (e.g., project selection)
  useEffect(() => {
    const handleStorageChange = () => {
      setProjectId(localStorage.getItem("currentProjectId"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // State for sprint progress
  const [sprintVelocity, setSprintVelocity] = useState(0);
  const [taskCompletion, setTaskCompletion] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);

  // Use the sprint data context to get the data
  const {
    burndownData,
    velocityData,
    refreshBurndownData,
    refreshVelocityData,
  } = useSprintDataContext();

  // Use the backlog context to get task data
  const { tasks, refreshAll: refreshTasks } = useBacklogContext();

  // Process burndown data for chart
  useEffect(() => {
    const fetchBurndownData = async () => {
      if (!projectId) {
        setBurndownChartData([]);
        setActualPercentage(0);
        setIdealPercentage(0);
        return;
      }
      try {
        const response = await fetch(`${apiURL}/api/burndown?projectId=${projectId}`);
        if (!response.ok) {
          console.error(`Failed to fetch burndown data for project ID: ${projectId}`);
          setBurndownChartData([]);
          setActualPercentage(0);
          setIdealPercentage(0);
          return;
        }
        const data = await response.json();
        const { duration_days, total_story_points, remaining_story_points } = data;

        const totalDays = duration_days + 1;
        const idealDropPerDay = total_story_points / duration_days;
        const actualDropPerDay =
          (total_story_points - remaining_story_points) / duration_days;

        const generatedData: BurndownDataPoint[] = [];
        for (let day = 0; day < totalDays; day++) {
          const ideal = total_story_points - idealDropPerDay * day;
          const remaining = total_story_points - actualDropPerDay * day;

          generatedData.push({
            day: `Day ${day}`,
            Ideal: parseFloat(ideal.toFixed(2)),
            Remaining: parseFloat(remaining.toFixed(2)),
          });
        }

        setBurndownChartData(generatedData);

        // Calculate percentages
        const initial = total_story_points;
        if (generatedData.length > 0) {
          const last = generatedData[generatedData.length - 1];
          setActualPercentage(Math.round(((initial - last.Remaining) / initial) * 100));
          setIdealPercentage(Math.round(((initial - last.Ideal) / initial) * 100));
        } else {
          setActualPercentage(0);
          setIdealPercentage(0);
        }

        // Calculate days left (moved here to be within the project-specific fetch)
        const sprintStartDate = localStorage.getItem("sprint_start_date");
        if (sprintStartDate && duration_days !== undefined) {
          const startDate = new Date(sprintStartDate);
          const currentDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + duration_days);
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysRemaining = Math.max(
            0,
            Math.ceil((endDate.getTime() - currentDate.getTime()) / msPerDay)
          );
          setDaysLeft(daysRemaining);
        } else if (duration_days !== undefined) {
          setDaysLeft(duration_days);
        } else {
          setDaysLeft(0); // Default if no start date or duration
        }
      } catch (error) {
        console.error("Error fetching burndown data:", error);
        setBurndownChartData([]);
        setActualPercentage(0);
        setIdealPercentage(0);
      }
    };

    fetchBurndownData();
  }, [projectId, burndownData?.duration_days]); // Re-run when projectId or duration changes

  // Process velocity data
  useEffect(() => {
    if (!velocityData || velocityData.length === 0) {
      setSprintVelocity(0);
      setTaskCompletion(0);
      return;
    }
    try {
      // Calculate average velocity from last 3 sprints
      const recentVelocity = velocityData.slice(-3);
      const avgVelocity =
        recentVelocity.reduce((sum, sprint) => sum + sprint.Actual, 0) / recentVelocity.length;
      setSprintVelocity(Math.round(avgVelocity) || 0);

      // Get task completion from localStorage or calculate from recent sprint
      const storedCompletion = parseInt(localStorage.getItem("sprint_task_completion") || "0");
      if (storedCompletion) {
        setTaskCompletion(storedCompletion);
      } else if (velocityData.length > 0) {
        const latestSprint = velocityData[velocityData.length - 1];
        const completion = (latestSprint.Actual / latestSprint.Planned) * 100;
        setTaskCompletion(Math.round(completion) || 0);
      }
    } catch (error) {
      console.error("Error processing velocity data:", error);
      setSprintVelocity(0);
      setTaskCompletion(0);
    }
  }, [velocityData]);

  // Calculate task statistics from the TaskColumns
  const taskStats = useMemo(() => {
    if (!tasks)
      return { completedTasks: 0, inProgressTasks: 0, totalTasks: 0, completionPercentage: 0 };
    // Count tasks in each column
    const done = tasks.done?.length || 0;
    const inProgress = tasks.inprogress?.length || 0;
    const review = tasks.inreview?.length || 0;
    const todo = tasks.todo?.length || 0;

    const totalTasks = done + inProgress + review + todo;
    const completionPercentage = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

    return {
      completedTasks: done,
      inProgressTasks: inProgress + review, // Counting both in progress and review as active tasks
      totalTasks,
      completionPercentage,
    };
  }, [tasks]);

  // Refresh data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshBurndownData();
        await refreshVelocityData();
        await refreshTasks();
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };
    loadData();
  }, [refreshBurndownData, refreshVelocityData, refreshTasks]);

  return (
    <div className={s.container}>
      <ProgressCard
        title="Calendar & Burndown"
        icon={<Calendar className={s.icon} />}
        footer={
          <Button variant="default" className={`${s.button} mt-4`} onClick={onViewCalendar}>
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
            <BurndownChart data={burndownChartData} height={120} simple />
          </div>
          <div className="space-y-2">
            <div className={s.progressText}>
              <span>Actual: {actualPercentage}%</span>
              <span>Ideal: {idealPercentage}%</span>
            </div>
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
            <Progress
              value={sprintVelocity > 0 ? Math.min(sprintVelocity, 100) : 0}
              className={`${s.progressBar} mt-2 mb-2`}
              indicatorClassName={s.progressBarIndicator}
            />
            <div className={s.sprintStats}>
              <span>{sprintVelocity > 0 ? sprintVelocity : 0} SP/Sprint</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <div className={s.sprintLabel}>Task Completion</div>
              <div className={s.sprintStats}>{taskStats.completionPercentage}%</div>
            </div>
            <div className="mt-2">
              <Progress
                value={taskStats.completionPercentage}
                className={`${s.progressBar} mt-2 mb-2`}
                indicatorClassName={s.progressBarIndicator}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={s.statCard}>
                <Clock className={s.statIcon} />
                <div className={s.statValue}>{daysLeft}</div>
                <div className={s.statLabel}>Days Left</div>
              </div>

              <div className={s.statCard}>
                <BarChart2 className={s.statIcon} />
                <div className={s.statValue}>{taskStats.completionPercentage}%</div>
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
              <div className={s.statValue}>{taskStats.completedTasks}</div>
              <div className={s.statLabel}>Completed Tasks</div>
            </div>

            <div className={s.statCard}>
              <div className={s.statValue}>{taskStats.inProgressTasks}</div>
              <div className={s.statLabel}>In Progress</div>
            </div>
          </div>
        </div>
      </ProgressCard>
    </div>
  );
};

export default DashboardStats;