import DashboardStats from "./dashboard.dashboardstats"
import { TasksKanban } from "./dashboard.taskskanban"
import { TaskColumns } from "@/types/taskkanban"

 // Initial tasks data
  const initialTasks: TaskColumns = {
    inProgress: [
      {
        id: "1",
        title: "Implement user authentication",
        description: "Add email/password and social login options.",
        date: "2024-03-15",
        comments: 3,
        priority: "Low",
      },
      {
        id: "2",
        title: "Optimize database queries",
        description: "Improve the efficiency of SQL queries to reduce load times.",
        date: "2024-03-16",
        comments: 2,
        priority: "Medium",
      },
    ],
    inReview: [
      {
        id: "3",
        title: "Fix broken UI on mobile devices",
        description: "Ensure full compatibility across different screen sizes like mobile screens",
        date: "2024-03-17",
        comments: 1,
        priority: "High",
      },
    ],
    completed: [],
  }

type Props = {
    onNavigateSprintDetails : () => void;
    onNavigateCalendar?: () => void;
    onNavigateProductBacklog?: () => void;

}

const DashboardMainPage = ({ onNavigateSprintDetails,onNavigateProductBacklog,onNavigateCalendar}: Props) => {
   return (
        <>
            {/* Dashboard Stats*/}
            <DashboardStats onViewSprintDetails={onNavigateSprintDetails} onViewCalendar={onNavigateCalendar}/>
            {/* Tasks Kanban */}
            <TasksKanban tasks={initialTasks} onNavigate={onNavigateProductBacklog} view="dashboard"/>
            
        </>
    );
}

export default DashboardMainPage;