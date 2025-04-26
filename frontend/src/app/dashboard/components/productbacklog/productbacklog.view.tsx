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
  projectId: string;
  onBack: () => void;
}

const ProductBacklogPage: React.FC<ProductBacklogViewProps> = ({ projectId, onBack }) => {
  const [backlogItems, setBacklogItems] = useState<UserStory[]>([]);
  const [BacklogactiveView, setBacklogActiveView] = useState<"backlog" | "kanban">("backlog");
  const isAdmin = true; 

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
  };

  useEffect(() => {
    async function fetchUserStories() {
      try {
        const stories = await getProjectUserStories(projectId);
        setBacklogItems(stories);
      } catch (error) {
        console.error("Failed to fetch user stories:", error);
      }
    }

    if (projectId) {
      fetchUserStories();
    }
  }, [projectId]);

  return (
    <div>
      {/* Top Section with View Selector */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold text-[#1e1e1e]">Product Backlog</h1>
          <p className="text-[#694969] mt-2">Team wide view of all backlog items and their status</p>
        </div>
        
      {/* View Selector Button (Aligns to the right) */}
      <div className="flex items-center gap-4">
          {BacklogactiveView === "kanban" ? (
            <button
              onClick={() => setBacklogActiveView("backlog")}
              className="p-2 rounded-md font-semibold bg-white text-[#4A2B4A] w-[10vw] h-[5vh] border border-[#4A2B4A] hover:bg-[#e2d4e4]"
            >
              Show In Review Tasks
            </button>
          ) : (
            <button
              onClick={() => setBacklogActiveView("kanban")}
              className="p-2 rounded-md font-semibold bg-white text-[#4A2B4A] w-[10vw] h-[5vh] border border-[#4A2B4A] hover:bg-[#e2d4e4]"
            >
              Show Full Backlog
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
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

      {/* Search Bar */}
      <div>
        <div className="mt-8 mb-8 w-full h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
          SearchBar Placeholder
        </div>
      </div>

      {/* Conditional Rendering for Views */}
      {BacklogactiveView === "kanban" ? (
        <TasksKanban tasks={initialTasks} view={"backlogs"} />
      ) : (
        // Backlog View Rendering
        <div className="mt-6">
          <div className="bg-[#f5f0f1] shadow rounded-md px-6 py-6">
            <h2 className="text-2xl font-bold text-gray-800">Items Under Review</h2>
            <div className="mt-4">
              {backlogItems.length === 0 ? (
                <p className="text-gray-600">No user stories found for this project.</p>
              ) : (
                backlogItems.map((item) => (
                  <BacklogCard
                    key={item.id}
                    type="STORY"
                    priority={item.priority.toLowerCase()}
                    status="In Review"
                    title={item.title}
                    description={item.description}
                    author="Unknown"
                    reviewer="Unknown"
                    progress={0}
                    comments={0}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBacklogPage;
