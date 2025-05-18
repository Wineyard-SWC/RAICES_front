import { useEffect, useState } from "react";
import BacklogCard from "./productbacklog.backlogcard";
import MetricCard from "../sprintdetails/sprintdetails.metriccard";
import { Calendar, Clock, BarChart2, User } from "lucide-react";
import { TasksKanban } from "../dashboard/dashboard.taskskanban";
import { TaskColumns, TaskOrStory } from "@/types/taskkanban";
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useKanban } from "@/contexts/unifieddashboardcontext";

interface ProductBacklogViewProps {
  onBack: () => void;
}

const ProductBacklogPage: React.FC<ProductBacklogViewProps> = ({onBack}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [BacklogactiveView, setBacklogActiveView] = useState<"backlog" | "kanban">("kanban")
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const isAdmin = true
  const { tasks } = useKanban();
  
  // Filtrar elementos en revisión
  const reviewItems = tasks?.inreview ?? []
  const filteredItems = reviewItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )


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
    <main className="min-h-screen">
      <div className="px-25 max-w-full">
        {/* Top Section with View Selector */}
        <div className="flex items-center justify-between mb-2">
        {/* Left section for Back button and title */}
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Product Backlog</h1>
          </div>
          

        {/* View Selector Button (Aligns to the right) */}
        <div className="flex items-center gap-4">
            {BacklogactiveView === "kanban" ? (
              <button
                onClick={() => setBacklogActiveView("backlog")}
                className="p-2 rounded-md font-semibold bg-white text-[#4A2B4A] flex justify-center items-center border border-[#4A2B4A] hover:bg-[#e2d4e4]"
              >
                Show In Review Tasks
              </button>
            ) : (
              <button
                onClick={() => setBacklogActiveView("kanban")}
                className="p-2 rounded-md font-semibold bg-white text-[#4A2B4A] flex justify-center items-center border border-[#4A2B4A] hover:bg-[#e2d4e4]"
              >
                Show Full Backlog
              </button>
            )}
          </div>
        </div>

        <div className="mb-2">
          <p className=" text-lg font-semibold text-[#694969] mt-2 mb-2">Team wide view of all backlog items and their status</p>
          <button
            onClick={onBack}
            className="text-[#4A2B4A] text-sm font-medium hover:underline"
          > {"<- Go back "}
          </button>
        </div>
        
        {/* Metric Cards */}
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          ):(<p></p>
          )}
        

        {/* Search Bar */}
        <div className="relative w-full h-10 mb-4 mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-lg text-gray-400" />
          <Input
            placeholder={BacklogactiveView === "kanban" ? "Search sprint elements..." : "Search sprint under review elements..."}
            className="pl-8 h-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Conditional Rendering for Views */}
        {BacklogactiveView === "kanban" ? (
          <TasksKanban view="backlog" />
    ) : (
      // Backlog View Rendering
      <div className="mt-6">
        <div className="bg-white border border-[#D3C7D3] shadow rounded-lg px-6 py-6">
          
          {/* Header + Selector de Items por página */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-black">Items Under Review</h2>

            <div className="flex items-center gap-2">
              <span className="text-m text-black">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(0) 
                }}
                title="Items"
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Lista de Backlog Items */}
          <div className="mt-4">
            {reviewItems.length === 0 ? (
              <p className="text-black">No elements under review found for this project.</p>
              ) : (
                <>
                  {filteredItems
                    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                    .map((item) => (
                      <BacklogCard
                        key={item.id}
                        id={item.id}
                        type={item.title.includes("US") ? "STORY" : "TASK"}
                        priority={item.priority.toLowerCase()}
                        status="In Review"
                        title={item.title}
                        description={item.description}
                        author={""}
                        reviewer={"Not Assigned"}
                        progress={100}
                        comments={item.comments ?? []}
                      />
                    ))}

                  {/* Paginación */}
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 text-m rounded bg-[#4A2B4A] text-white disabled:bg-gray-300"
                    >
                      Previous
                    </button>

                    <span className="text-m text-black">
                    Page {currentPage + 1} of {Math.ceil(filteredItems.length / itemsPerPage)}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          (prev + 1) * itemsPerPage < filteredItems.length ? prev + 1 : prev
                        )
                      }
                      disabled={(currentPage + 1) * itemsPerPage >= filteredItems.length}
                      className="px-4 py-2 text-m rounded bg-[#4A2B4A] text-white disabled:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
  );
};

export default ProductBacklogPage;
