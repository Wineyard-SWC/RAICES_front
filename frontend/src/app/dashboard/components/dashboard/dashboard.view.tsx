import DashboardStats from "./dashboard.dashboardstats"
import { TasksKanban } from "./dashboard.taskskanban"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { useProjectContext } from "@/contexts/projectcontext"
import { TaskColumns } from "@/types/taskkanban"

type Props = {
    onNavigateSprintDetails : () => void;
    onNavigateCalendar?: () => void;
    onNavigateProductBacklog?: () => void;
    tasks: TaskColumns;
    refreshTasks: () => void;

}

const DashboardMainPage = ({ onNavigateSprintDetails,onNavigateProductBacklog,onNavigateCalendar,tasks, refreshTasks}: Props) => {
   
   return (
        <>
            {/* Dashboard Stats*/}
            <DashboardStats onViewSprintDetails={onNavigateSprintDetails} onViewCalendar={onNavigateCalendar}/>
            {/* Tasks Kanban */}
            <TasksKanban tasks={tasks} onNavigate={onNavigateProductBacklog} refreshTasks={refreshTasks} view="dashboard"/>
            
        </>
    );
}

export default DashboardMainPage;