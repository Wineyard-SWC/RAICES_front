import { useState } from "react";
import { TasksKanban } from "../dashboard/dashboard.taskskanban";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import {ItemsUnderReview} from "./productbacklog.itemsunderreview";
import { Bug } from "lucide-react";
import BugReportForm from "./productbacklog.bugreportform";

interface ProductBacklogViewProps {
  onBack: () => void;
}

const ProductBacklogPage: React.FC<ProductBacklogViewProps> = ({onBack}) => {
  const [BacklogactiveView, setBacklogActiveView] = useState<"backlog" | "kanban">("kanban")
  const [showBugReportForm, setShowBugReportForm] = useState(false);
  const isAdmin = true
  const { tasks } = useKanban();
  const currentProjectId = localStorage.getItem("currentProjectId")

  const handleOpenBugReport = () => {
    setShowBugReportForm(true);
  };

  const handleCloseBugReport = () => {
    setShowBugReportForm(false);
  };
  const reviewItems = tasks?.inreview ?? []

  return (
    <main className="min-h-screen">
      <div className="px-25 max-w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Product Backlog</h1>
          </div>
          

        {/* View Selector Button (Aligns to the right) */}
        <div className="flex items-center gap-4">
            <button
              onClick={handleOpenBugReport}
              className="p-2 rounded-md font-semibold bg-[#4A2B4A] text-white flex justify-center items-center hover:bg-[#3a2248]"
            >
              <Bug className="mr-2 h-4 w-4" /> Report a Bug
            </button>

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

        <div className="mb-6">
          <p className=" text-lg font-semibold text-[#694969] mt-2 mb-2">Team wide view of all backlog items and their status</p>
          <button
            onClick={onBack}
            className="text-[#4A2B4A] text-sm font-medium hover:underline"
          > {"<- Go back "}
          </button>
        </div>

        {/* Conditional Rendering for Views */}
        {BacklogactiveView === "kanban" ? (
          <TasksKanban view="backlog" />
    ) : (
          <ItemsUnderReview reviewItems={reviewItems}/>

        )}

        {/* Modal de reporte de bugs */}
        {currentProjectId && (
          <BugReportForm 
            isOpen={showBugReportForm} 
            onClose={handleCloseBugReport} 
            projectId={currentProjectId}
          />
        )}
      </div>
    </main>
  );
};

export default ProductBacklogPage;
