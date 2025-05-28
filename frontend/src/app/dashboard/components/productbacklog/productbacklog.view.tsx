import { useState, Suspense } from "react";
import { TasksKanban } from "../dashboard/dashboard.taskskanban";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { ItemsUnderReview } from "./productbacklog.itemsunderreview";
import { Plus } from "lucide-react";
import CreateItemSidebar from "../detailedcardviews/createItem"; 
import { TaskOrStory } from "@/types/taskkanban";
import TaskSidebar from "./productbacklog.sidebar";
import { useSearchParams } from "next/navigation";
import { useUserPermissions } from "@/contexts/UserPermissions";

// Loading component
function LoadingProductBacklog() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A2B4A]"></div>
    </div>
  );
}

// Client component that uses search params
function ProductBacklogContent({ onBack }) {
  const searchParams = useSearchParams()
  const [BacklogactiveView, setBacklogActiveView] = useState<"backlog" | "kanban">("kanban")
  const [showBugReportForm, setShowBugReportForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOrStory | null>(null);
  const isAdmin = true
  const { tasks } = useKanban();
  
  // Obtener la función hasPermission del contexto
  const { hasPermission } = useUserPermissions();
  
  // Verificar si el usuario tiene los permisos necesarios
  const canReviewItems = hasPermission(PERMISSION_ITEM_REVIEW);
  const canManageItems = hasPermission(PERMISSION_REQ_MANAGE);  // Verificar permiso para gestionar items
  
  const currentProjectId = searchParams.get("projectId") ||
    (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) ||
    ""
  
  const handleOpenCreateItem = () => {
    setShowCreateSidebar(true);
  };

  const handleCloseCreateItem = () => {
    setShowCreateSidebar(false);
  };

   const handleOpenTaskDetails = (task: TaskOrStory) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setSidebarOpen(false);
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };
  const reviewItems = tasks?.inreview ?? []

   return (
    <div className="flex flex-col min-h-[calc(100vh-77px)] ">
      <main className="flex-grow relative">
        <div
          className={`w-[90vw] mx-auto px-4 py-4 transition-all duration-300 ${
            sidebarOpen ? "pr-[33vw]" : ""
          } ${
            showCreateSidebar ? "pr-[33vw]" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-[#1e1e1e]">Product Backlog</h1>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-4">
              {/* Botón para crear nuevo item - visible solo si tiene permiso REQ_MANAGE */}
              {canManageItems && (
                <button
                  onClick={handleOpenCreateItem}
                  className="p-2 rounded-md font-semibold bg-[#4A2B4A] text-white flex justify-center items-center hover:bg-[#3a2248]"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Item
                </button>
              )}

              {/* Mostrar botón de Review Tasks solo si tiene permiso ITEM_REVIEW */}
              {canReviewItems && (
                BacklogactiveView === "kanban" ? (
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
                )
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
              Team wide view of all backlog items and their status
            </p>
            <button onClick={onBack} className="text-[#4A2B4A] text-sm font-medium hover:underline">
              {"<- Go back "}
            </button>
          </div>

          {/* Layout Flexível - Kanban */}
          <div className="w-full pb-8">
            {/* Si no tiene permiso, siempre mostrar la vista kanban */}
            {BacklogactiveView === "kanban" || !canReviewItems ? (
              <TasksKanban view="backlog" onTaskSelect={handleOpenTaskDetails} />
            ) : (
              <ItemsUnderReview reviewItems={reviewItems} />
            )}
          </div>
        </div>
      </main>
      
      {/* Solo mostrar el sidebar de creación si tiene el permiso correspondiente */}
      {currentProjectId && canManageItems && (
        <CreateItemSidebar
          isOpen={showCreateSidebar}
          onClose={handleCloseCreateItem}
          projectId={currentProjectId}
        />
      )}

      {/* Sidebar - Full height fixed */}
      <TaskSidebar isOpen={sidebarOpen} onClose={handleCloseTaskDetails} task={selectedTask} />
    </div>
  )
}

const PERMISSION_ITEM_REVIEW = 1 << 5;
const PERMISSION_REQ_MANAGE = 1 << 2;  // Nuevo permiso para gestionar items

const ProductBacklogPage = ({ onBack }) => {
  return (
    <Suspense fallback={<LoadingProductBacklog />}>
      <ProductBacklogContent onBack={onBack} />
    </Suspense>
  );
};

export default ProductBacklogPage;
