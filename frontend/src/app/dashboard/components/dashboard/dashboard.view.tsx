import DashboardStats from "./dashboard.dashboardstats"
import { TasksKanban } from "./dashboard.taskskanban"

type Props = {
    onNavigateSprintDetails: () => void;
    onNavigateCalendar?: () => void;
    onNavigateProductBacklog?: () => void;
}

const DashboardMainPage = ({ onNavigateSprintDetails, onNavigateProductBacklog, onNavigateCalendar }: Props) => {
   return (
        <>
            {/* Dashboard Stats*/}
            <DashboardStats onViewSprintDetails={onNavigateSprintDetails} onViewCalendar={onNavigateCalendar}/>
            {/* Tasks Kanban */}
            <TasksKanban view="dashboard" onNavigate={onNavigateProductBacklog}/>
        </>
    );
}

export default DashboardMainPage;