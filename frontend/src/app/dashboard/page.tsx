"use client"
import { TaskColumns } from "@/types/taskkanban"

import Navbar from "@/components/NavBar"
import DashboardStats from "./components/dashboardstats"
import { TasksKanban } from "./components/taskskanban"
import { AddTeamMemberCard } from "./components/SprintPlanning/addteammembercard"
import { TeamMembersSection } from "./components/SprintPlanning/teammemberssection"
import MetricCard from "./components/metriccard"
import { CardStatsWidget } from "./components/cardstatswidget"

export default function DashboardPage() {
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

  return (
    <>
      <Navbar projectSelected={true} />
      <main className="bg-[#f5f0f1] min-h-screen py-6">
        <div className="container mx-auto px-4">
          {/* <TeamMembersSection></TeamMembersSection> */}
          
          <DashboardStats/>
          
          
          <TasksKanban tasks={initialTasks} />
         
        </div>
      </main>
    </>
  )
}