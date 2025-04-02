export interface Project {
    id: number;
    title: string;
    description: string;
    status: 'Active' | 'Completed' | 'On Hold';
    priority: 'High' | 'Medium' | 'Low';
    progress: number;
    startDate: string; 
    endDate: string;
    team: string;
    teamSize: number;
    tasksCompleted: number;
    totalTasks: number;
  }