"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/NavBar"

import DashboardStats from "./components/dashboardstats"
import { TasksKanban } from "./components/taskskanban"
import { AddTeamMemberCard } from "./components/SprintPlanning/addteammembercard"
import { TeamMembersSection } from "./components/SprintPlanning/teammemberssection"
import MetricCard from "./components/metriccard"
import { CardStatsWidget } from "./components/cardstatswidget"

import SprintDetailsPage from "./components/sprintdetails/sprintdetails.view"
import DashboardMainPage from "./components/dashboard/dashboard.view"
import ProductBacklogPage from "./components/productbacklog/productbacklog.view"
import CalendarPageView from "./components/sprintcalendar/sprintcalendar.view"
import { useRouter } from "next/navigation"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { UserStory } from "@/types/userstory"
import { TaskColumns } from "@/types/taskkanban"
import { mergeUserStoriesIntoTasks } from "@/utils/mergeUserStoriesIntoTasks"

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "details" | "planning" | "calendar">("dashboard")
  const [projectId, setProjectId] = useState<string | null>(null);
  const [backlogItems, setBacklogItems] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    } else {
      setLoading(false) 
    }
  }, [router])

  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);
  
  useEffect(() => {
    async function fetchUserStories() {
      try {
        const stories = await getProjectUserStories(projectId ?? "");
        setBacklogItems(stories);
      } catch (error) {
        console.error("Failed to fetch user stories:", error);
      }
    }

    if (projectId) {
      fetchUserStories();
    }
  }, [projectId]);


  const { tasks, setTasks, refreshTasks } = useProjectTasks(projectId ?? "");
  
  if (loading || !projectId) {
    return null;
  }

  const refreshAll = async () => {
    await refreshTasks();
    const stories = await getProjectUserStories(projectId ?? "");
    setBacklogItems(stories);
  };

  const combinedTasks: TaskColumns = mergeUserStoriesIntoTasks(tasks, backlogItems);
  
  const handleDeleteStory = (id: string) => {
    setBacklogItems((prev) => prev.filter((item) => item.id !== id));
  };
 


  return (
    <>
      <Navbar projectSelected={true} />
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          {/*---------------------------------------DashboardView-----------------------------------------*/}
          {activeView === "dashboard" && (
            <DashboardMainPage 
            tasks={tasks}
            onNavigateSprintDetails={() => setActiveView("details")}
            onNavigateCalendar={() => setActiveView("calendar")} 
            onNavigateProductBacklog={() => setActiveView("planning")}
            refreshTasks={refreshTasks}
            />
          )}
          {/*---------------------------------------DashboardView-----------------------------------------*/}

          {/*---------------------------------------SprintDetailsView-------------------------------------*/}
          {activeView === "details" && (
            <SprintDetailsPage onBack={() => setActiveView("dashboard")} />
          )}
          {/*---------------------------------------SprintDetailsView-------------------------------------*/}
          
          {/*---------------------------------------SprintPlanningView-------------------------------------*/}
        
          {/*---------------------------------------SprintPlanningView-------------------------------------*/}
          
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          {activeView === "calendar" && (
            <CalendarPageView onBack={() => setActiveView("dashboard")}/>
          )}
          
          {/*---------------------------------------DetailTaskAssignmentView-------------------------------*/}
          
          {/*---------------------------------------DetailTaskAssignmentView-------------------------------*/}
          
        </div>
        {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          {/* Show ProductBacklogView when "backlog" is active */}
          {activeView === "planning" && projectId && (
            <ProductBacklogPage 
            stories={backlogItems}
            tasks={combinedTasks}
            onBack={() => setActiveView("dashboard")} 
            refreshTasks={refreshTasks}
            onDeleteStory={handleDeleteStory}
            />
          )}
        {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          
      </main>
    </>
  )
}