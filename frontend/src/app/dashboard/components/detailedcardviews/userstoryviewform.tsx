import { CheckCircle, Calendar, Clock, User, Users, Hash, GitBranch, Target } from "lucide-react";
import { UserStory } from "@/types/userstory";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { TaskOrStory } from "@/types/taskkanban";
import { getAssigneeName,getAssigneeId } from "../../utils/secureAssigneeFormat";

interface UserStoryViewFormProps {
  task: UserStory;
}


const UserStoryViewForm = ({ task }: UserStoryViewFormProps) => {
  const { tasks } = useKanban();

   return (
    <>
      {/* ID Title */}
      {task.idTitle && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">ID:</p>
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.idTitle}</p>
          </div>
        </div>
      )}

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

      {/* Status */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Status:</p>
        <p className="text-black text-lg">{task.status_khanban || "Backlog"}</p>
      </div>

      {/* Story Points */}
      {task.points !== undefined && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Story Points:</p>
          <p className="text-black text-lg">{task.points}</p>
        </div>
      )}

      {/* Epic Assignment */}
      {task.assigned_epic && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Epic:</p>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.assigned_epic}</p>
          </div>
        </div>
      )}

      {/* Sprint Assignment */}
      {task.assigned_sprint && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Sprint:</p>
          <div className="flex items-center">
            <GitBranch className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.assigned_sprint}</p>
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

      {/* Deadline */}
      {task.deadline && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Deadline:</p>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">
              {new Date(task.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Completion Date */}
      {task.date_completed && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Completed:</p>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">
              {new Date(task.date_completed).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Task Progress */}
      {(task.total_tasks !== undefined || task.task_completed !== undefined) && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Task Progress:</p>
          <p className="text-black text-lg">
            {task.task_completed || 0} / {task.total_tasks || 0} tasks completed
          </p>
        </div>
      )}

      {/* Acceptance Criteria Progress */}
      {(task.total_acceptanceCriteria !== undefined || task.completed_acceptanceCriteria !== undefined) && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Acceptance Criteria Progress:</p>
          <p className="text-black text-lg">
            {task.completed_acceptanceCriteria || 0} / {task.total_acceptanceCriteria || 0} criteria completed
          </p>
        </div>
      )}

      {/* Acceptance Criteria */}
      {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Acceptance Criteria:</p>
          <ul className="list-disc pl-4 space-y-1">
            {task.acceptanceCriteria.map((criteria, index) => (
              <li key={index} className="text-lg flex items-start gap-2">
                {typeof criteria === "string" ? (
                  <span>{criteria}</span>
                ) : (
                  <div className="flex-1">
                    <span className={criteria.date_completed ? "line-through text-gray-500" : ""}>
                      {criteria.description}
                    </span>
                    {criteria.date_completed && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(criteria.date_completed).toLocaleDateString()}
                        {criteria.finished_by[1] && ` by ${criteria.finished_by[1]}`}
                      </div>
                    )}
                  </div>
                )}
                {typeof criteria !== "string" && criteria.date_completed && (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Tasks */}
      {task.task_list && task.task_list.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Linked Tasks:</p>
          <ul className="space-y-1">
            {task.task_list.map((taskId) => {
              let taskDetails = null;
              for (const column of Object.values(tasks)) {
                const found = column.find((t: TaskOrStory) => t.id === taskId);
                if (found) {
                  taskDetails = found;
                  break;
                }
              }
              
              return (
                <li key={taskId} className="flex items-center gap-2">
                  {taskDetails ? (
                    <>
                      <span className={`text-xs ${taskDetails.status_khanban === "Done" ? "line-through text-gray-500" : ""}`}>
                        {taskDetails.title}
                      </span>
                      {taskDetails.status_khanban === "Done" && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">Task not found</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default UserStoryViewForm;