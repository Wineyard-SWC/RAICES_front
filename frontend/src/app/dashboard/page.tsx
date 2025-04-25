"use client"

import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import Navbar from "@/components/NavBar"
import { ProgressCard } from "./components/progresscard"
import { TasksKanban } from "./components/taskskanban"
import { TaskColumns } from "@/types/taskkanban"
import { BurndownChart } from "@/components/burndownchart"

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
      <main className="bg-[#f5f3f7] min-h-screen py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Calendar & Burndown Card (Ajustado a v0.dev) */}
            <ProgressCard
              title="Calendar & Burndown"
              icon={<Calendar className="h-5 w-5 text-[#4a2b5c]" />}
              footer={
                <Button variant="default" className="w-full bg-[#4a2b5c] hover:bg-[#3a2248]">
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
                  <BurndownChart
                  actualData={[80, 68, 53, 35, 21, 12]}
                  idealData={[80, 60, 40, 20, 10, 0]}
                  height={80}
                  className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Actual 70%</span>
                    <span>Ideal: 83%</span>
                  </div>

                  <div className="text-sm">My workload</div>
                  <Progress value={60} className="h-2 bg-gray-200" indicatorClassName="bg-[#4a2b5c]" />

                  <div className="text-right text-sm">24h / 40h</div>
                </div>
              </div>
            </ProgressCard>

            {/* Sprint Progress Card (Ajustado a v0.dev) */}
            <ProgressCard
              title="Sprint Progress"
              icon={<BarChart2 className="h-5 w-5 text-[#4a2b5c]" />}
              footer={
                <Button variant="default" className="w-full bg-[#4a2b5c] hover:bg-[#3a2248]">
                  View Sprint Details
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="mb-2">
                  <div className="text-sm text-gray-500">Sprint Velocity</div>
                  <Progress value={85} className="h-2 mt-1 bg-gray-200" indicatorClassName="bg-[#4a2b5c]" />
                  <div className="flex justify-end mt-1">
                    <span className="text-sm">45 SP/Sprint</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-[#4a2b5c]" />
                    <div className="text-2xl font-bold text-[#4a2b5c]">8</div>
                    <div className="text-xs text-gray-500">Days Left</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <BarChart2 className="h-6 w-6 mx-auto mb-1 text-[#4a2b5c]" />
                    <div className="text-2xl font-bold text-[#4a2b5c]">92%</div>
                    <div className="text-xs text-gray-500">Completion</div>
                  </div>
                </div>
              </div>
            </ProgressCard>

            {/* Personal Progress Card (Ajustado a v0.dev) */}
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
                  className="text-[#4a2b5c]"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              }
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
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
                  <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl">
                    😄
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-[#4a2b5c]">37</div>
                  <div className="text-xs text-gray-500">Completed Tasks</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-[#4a2b5c]">2</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
              </div>
            </ProgressCard>
          </div>

          {/* Tasks Kanban */}
          <TasksKanban tasks={initialTasks} />
        </div>
      </main>
    </>
  )
}