"use client"

import { useState, useEffect } from "react"
import SprintProgressCard from "./sprintcalendar.progresscard"
import BurndownChartCard from "./sprintcalendar.burndownchartcard"
import TaskStatusCard from "./sprintcalendar.taskstatuscard"
import TeamWorkloadCard from "./sprintcalendar.teamworkloadcard"
import CalendarControls from "./sprintcalendar.calendarcontrols"
import CalendarGrid from "./sprintcalendar.calendargrid"

interface CalendarPageProps {
    defaultViewMode?: "week" | "month"
    onBack: () => void
  }

const burndownData = [
    { day: "Day 0", Remaining: 100, Ideal: 100 },
    { day: "Day 1", Remaining: 95, Ideal: 90 },
    { day: "Day 2", Remaining: 90,  Ideal: 80 },
    { day: "Day 3", Remaining: 82,  Ideal: 70 },
    { day: "Day 4", Remaining: 76,  Ideal: 60 },
    { day: "Day 5", Remaining: 65,  Ideal: 50 },
    { day: "Day 6", Remaining: 58,  Ideal: 40 },
    { day: "Day 7", Remaining: 45,  Ideal: 30 },
    { day: "Day 8", Remaining: 35,  Ideal: 20 },
    { day: "Day 9", Remaining: 24,  Ideal: 10 },
    { day: "Day 10", Remaining: 15, Ideal: 0  },
  ]

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',  
    month: 'long',    
    day: 'numeric',   
  })

export default function CalendarPageView({defaultViewMode = "week", onBack
  }: CalendarPageProps) {
    const [viewMode, setViewMode] = useState<"week" | "month">(defaultViewMode)
    const initialHeight = burndownData[0].Remaining;
    const lastData = burndownData[burndownData.length - 1];

    const actualPercentage = Math.round(((initialHeight - lastData.Remaining) / initialHeight) * 100);
    const idealPercentage = Math.round(((initialHeight - lastData.Ideal) / initialHeight) * 100);
    
    useEffect(() => {
      if (!localStorage.getItem("currentProjectId")) {
        localStorage.setItem("currentProjectId", "calendar-view-project")
      }
    }, [])
  
    return (
      <div>          
         <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Sprint Calendar</h1>
          </div>
          <div className="mb-2">
            <p className=" text-lg font-semibold text-[#694969] mt-2 mb-2">Track and manage task throught your sprint</p>
            <button
                onClick={onBack}
                className="text-[#4A2B4A] text-sm font-medium hover:underline"
              > {"<- Go back "}
            </button>
          </div>

          {/* Sprint Overview Card */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Sprint 12 (March 3 - March 14, 2025)</h2>
              <div className="flex gap-2">
                <button className="px-2 py-1 border border-[#D3C7D3] rounded-md text-m">&lt;</button>
                <button className="px-2 py-1 border border-[#D3C7D3] rounded-md text-m font-semibold">{todayString}</button>
                <button className="px-2 py-1 border border-[#D3C7D3] rounded-md text-m">&gt;</button>
              </div>
            </div>

            {/* Cards inside */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <SprintProgressCard completedTasks={10} totalTasks={20}/>
              <BurndownChartCard actualPercentage={actualPercentage} idealPercentage={idealPercentage} burndownData={burndownData} />
              <TaskStatusCard />
              <TeamWorkloadCard />
            </div>
          </div>

          {/* Calendar Controls + Grid */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <CalendarControls viewMode={viewMode} setViewMode={setViewMode} day={todayString} />
            <CalendarGrid />
          </div>
        </div>
    )
}