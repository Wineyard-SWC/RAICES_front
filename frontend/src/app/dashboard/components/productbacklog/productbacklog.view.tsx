import { useEffect, useState } from "react";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { UserStory } from "@/types/userstory";
import BacklogCard from "./productbacklog.backlogcard";
import MetricCard from "../sprintdetails/sprintdetails.metriccard";
import { Calendar, Clock, BarChart2, User } from "lucide-react";
import { TasksKanban } from "../dashboard/dashboard.taskskanban";
import { TaskColumns } from "@/types/taskkanban";
import { ArrowLeft } from "lucide-react";

interface ProductBacklogViewProps {
  onBack: () => void;
  stories: UserStory[];
  tasks: TaskColumns;
  refreshTasks: () => void;
  onDeleteStory: (id: string) => void;
}

const ProductBacklogPage: React.FC<ProductBacklogViewProps> = ({tasks, stories, onBack, refreshTasks, onDeleteStory }) => {
  const [backlogItems, setBacklogItems] = useState<UserStory[]>(stories);
  const [BacklogactiveView, setBacklogActiveView] = useState<"backlog" | "kanban">("kanban");
  const isAdmin = true; 
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
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
              mainValue="Apr 1, 2025"
            />
            <MetricCard
              icon={<Clock className="text-[#4A2B4A]" />}
              title="End Date"
              mainValue="Apr 15, 2025"
            />
            <MetricCard
              icon={<BarChart2 className="text-[#4A2B4A]" />}
              title="Sprint Progress"
              mainValue="72%"
              progress={72}
            />
            <MetricCard
              icon={<User className="text-[#4A2B4A]" />}
              title="Team Size"
              mainValue="6 Members"
            />
          </div>
          ):(<p></p>
          )}
        

        {/* Search Bar */}
        <div>
          <div className="mt-8 mb-8 w-full h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
            SearchBar Placeholder
          </div>
        </div>

        {/* Conditional Rendering for Views */}
        {BacklogactiveView === "kanban" ? (
          <TasksKanban tasks={tasks} view={"backlogs"} refreshTasks={refreshTasks} />
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
            {backlogItems.length === 0 ? (
              <p className="text-black">No user stories found for this project.</p>
              ) : (
                <>
                  {backlogItems
                    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                    .map((item) => (
                      <BacklogCard
                        key={item.id}
                        type="STORY"
                        priority={item.priority.toLowerCase()}
                        status="In Review"
                        title={item.title}
                        description={item.description}
                        author="Unknown"
                        reviewer="Unknown"
                        progress={10}
                        comments={0}
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
                      Page {currentPage + 1} of {Math.ceil(backlogItems.length / itemsPerPage)}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          (prev + 1) * itemsPerPage < backlogItems.length ? prev + 1 : prev
                        )
                      }
                      disabled={(currentPage + 1) * itemsPerPage >= backlogItems.length}
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
