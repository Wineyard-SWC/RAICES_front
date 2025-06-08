import { Clock, Calendar, User, Users, BookOpen, Hash, GitBranch } from "lucide-react";
import { Task } from "@/types/task";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { getUserStoryTitleByTaskId2 } from "@/utils/kanbanUtils";
import { getAssigneeName,getAssigneeId } from "../../utils/secureAssigneeFormat";

interface TaskViewFormProps {
  task: Task;
}

const TaskViewForm = ({ task }: TaskViewFormProps) => {
  const { tasks: kanbanTasks } = useKanban();

  return (
    <>
      {/* Title */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Title:</p>
        <p className="text-black text-lg">{task.title}</p>
      </div>

      {/* Description */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Description:</p>
        <p className="text-black text-lg">{task.description}</p>
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <p className="text-black text-lg">{task.priority}</p>
      </div>

      {/* Story Points */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Story Points:</p>
        <p className="text-black text-lg">{task.story_points || 0}</p>
      </div>

      {/* Status */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Status:</p>
        <p className="text-black text-lg">{task.status_khanban || "Backlog"}</p>
      </div>

      {/* Date */}
      {"date" in task && task.date && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Date:</p>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.date}</p>
          </div>
        </div>
      )}

      {/* Deadline */}
      {"deadline" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Deadline:</p>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">
              {task.deadline ? new Date(task.deadline).toLocaleDateString() : "None"}
            </p>
          </div>
        </div>
      )}

      {/* User Story */}
      {task.user_story_id && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Related User Story:</p>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">
              {getUserStoryTitleByTaskId2(task.id, kanbanTasks) || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Sprint */}
      {task.sprint_id && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Sprint:</p>
          <div className="flex items-center">
            <GitBranch className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.sprint_id}</p>
          </div>
        </div>
      )}

       {/* Assignees */}
      {task.assignee && task.assignee.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Assignees:</p>
          <div className="space-y-1">
            {task.assignee.map((assignee, index) => (
              <div key={index} className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <p className="text-black text-lg">{getAssigneeName(assignee)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creation Info */}
      {task.created_by && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Created By:</p>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.created_by[1]}</p>
          </div>
          {task.date_created && (
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-black text-lg">
                {new Date(task.date_created).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completion Info */}
      {task.finished_by && task.finished_by[0] && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Completed By:</p>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.finished_by[1]}</p>
          </div>
          {task.date_completed && (
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-black text-lg">
                {new Date(task.date_completed).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Last Modified */}
      {task.modified_by && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Last Modified:</p>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.modified_by[1]}</p>
          </div>
          {task.date_modified && (
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-black text-lg">
                {new Date(task.date_modified).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TaskViewForm;