import MetricCard from "./sprintdetails.metriccard"
import SprintChartsSection from "./sprintdetails.sprintchartssection"
import { SprintTaskCard } from "./sprintdetails.taskcard"
import { Calendar, Clock, BarChart2, User } from "lucide-react"
import { ArrowLeft } from "lucide-react"
import { useState,useEffect } from "react"


type Props = {
    onBack: () => void;
}

const SprintDetailsPage = ({ onBack }: Props) => {
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [teamSize, setTeamSize] = useState<number>(0)
  
    useEffect(() => {
      const teamMembersRaw = localStorage.getItem("sprint_team_members")
      const teamMembers = teamMembersRaw ? JSON.parse(teamMembersRaw) : []
  
      const startDateStr = localStorage.getItem("sprint_start_date")
      const durationDays = parseInt(localStorage.getItem("sprint_duration_days") || "0")
  
      if (startDateStr) {
        const start = new Date(startDateStr)
        const end = new Date(start)
        end.setDate(start.getDate() + durationDays)
  
        setStartDate(start)
        setEndDate(end)
      }
  
      setTeamSize(teamMembers.length)
    }, [])
  
    const formatDate = (date: Date | null) =>
      date?.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }) || "N/A"

    const Taskdata = localStorage.getItem("taskStadistics")
    const completiotioninfo = JSON.parse(Taskdata!)
    

  return (
    <div className="">
        {/* Header + Search Placeholder */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-[#1e1e1e]">Sprint Details</h1>
            </div>  
        </div>
        <div className="mb-2">
            <p className=" text-lg font-semibold text-[#694969] mt-2 mb-2">Track sprint progress and manage tasks</p>
            <button
            onClick={onBack}
            className="text-[#4A2B4A] text-sm font-medium hover:underline"
            > {"<- Go back "}
            </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <MetricCard
            icon={<Calendar className="text-[#4A2B4A]" />}
            title="Start Date"
            mainValue={formatDate(startDate)}
            />
            <MetricCard
            icon={<Clock className="text-[#4A2B4A]" />}
            title="End Date"
            mainValue={formatDate(endDate)}
            />
            <MetricCard
            icon={<BarChart2 className="text-[#4A2B4A]" />}
            title="Sprint Progress"
            mainValue={`${completiotioninfo?.completionPercentage || 0}%`}
            progress={completiotioninfo?.completionPercentage || 0}
            />
            <MetricCard
            icon={<User className="text-[#4A2B4A]" />}
            title="Team Size"
            mainValue={`${teamSize} Members`}
            />
        </div>

        <div className="bg-white border border-[#D3C7D3] shadow-md rounded-xl px-4 py-4">
            {/* Chart Section */}
            <SprintChartsSection />
            
            {/* Task List */}
            <div className="space-y-4 mt-10">
                <div className="flex justify-end items-center gap-3">
                    <button className="bg-[#4A2B4A] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3a2248] transition">
                    Sprint Planning
                    </button>
                    <button className="bg-[#4A2B4A] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3a2248] transition">
                    See all sprints
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SprintDetailsPage