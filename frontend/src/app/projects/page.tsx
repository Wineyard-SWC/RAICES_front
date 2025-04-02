'use client';

import { Project } from '@/types/project';
import ProjectCard from "./components/projectcard";
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/contexts/usercontext';

export default function ProjectsPage() {
  const { userId } = useUser();
  const { projects, loading } = useProjects(userId);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        id={1}
        title="Food Donation Tracker"
        description="An app to track food donations for shelters."
        status="Active"
        priority="High"
        progress={60}
        startDate="2025-03-01"
        endDate="2025-07-01"
        team="Community Ops"
        teamSize={5}
        tasksCompleted={8}
        totalTasks={14}
      />

      <ProjectCard
        id={2}
        title="Recycling Map"
        description="Locate and manage local recycling centers."
        status="On Hold"
        priority="Medium"
        progress={35}
        startDate="2025-01-10"
        endDate="2025-06-15"
        team="Eco Team"
        teamSize={3}
        tasksCompleted={4}
        totalTasks={12}
      />

      <ProjectCard
        id={3}
        title="Volunteer Scheduler"
        description="Schedule shifts for volunteers across events."
        status="Completed"
        priority="Low"
        progress={100}
        startDate="2024-11-01"
        endDate="2025-02-28"
        team="Events Team"
        teamSize={7}
        tasksCompleted={20}
        totalTasks={20}
      />
    </div>
  );
}

/*{projects.map((project: Project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          description={project.description}
          status={project.status}
          priority={project.priority}
          progress={project.progress}
          startDate={new Date(project.startDate).toDateString()}
          endDate={new Date(project.endDate).toDateString()}
          team={project.team}
          teamSize={project.teamSize}
          tasksCompleted={project.tasksCompleted}
          totalTasks={project.totalTasks}
        />
    ))}*/