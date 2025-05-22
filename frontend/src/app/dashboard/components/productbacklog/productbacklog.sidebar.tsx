import { useState, useEffect } from "react";
import { X, Edit, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBug, TaskOrStory, isUserStory } from "@/types/taskkanban";
import { useUser } from "@/contexts/usercontext";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { useMemo } from "react";
import { Dialog,DialogPanel } from "@headlessui/react";

import TaskViewForm from "../detailedcardviews/taskviewform";
import TaskEditForm from "../detailedcardviews/taskvieweditform";
import UserStoryViewForm from "../detailedcardviews/userstoryviewform";
import UserStoryEditForm from "../detailedcardviews/usersotoryvieweditform";
import BugViewForm from "../detailedcardviews/bugviewform";
import BugEditForm from "../detailedcardviews/bugvieweditform";
import CommentsSection from "../detailedcardviews/commentssection";
import { useUserStories } from "@/contexts/saveduserstoriescontext";
import { useTasks } from "@/contexts/taskcontext";

interface TaskSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskOrStory | null;
}

const TaskSidebar = ({ isOpen, onClose, task }: TaskSidebarProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { userId, userData } = useUser();
  const { currentProjectId,tasks, updateTask, updateStory, updateBug } = useKanban();
  const {getUserStoriesForProject} = useUserStories()
  const {getTasksForProject} = useTasks()

  const onlystories = getUserStoriesForProject(currentProjectId!)
  const onlytasks = getTasksForProject(currentProjectId!)
  
  // Get latest task data from tasks state
  const currentTask = useMemo(() => {
    if (!task) return null;
    
    for (const column of Object.values(tasks)) {
      const foundTask = column.find((t: TaskOrStory) => t.id === task.id);
      if (foundTask) return foundTask;
    }
    return task;
  }, [tasks, task]);

  useEffect(() => {
    setIsEditMode(false);
  }, [task]);

  if (!isOpen || !currentTask) return null;

  const handleSave = async (updatedFields: any) => {
    try {
      if (isUserStory(currentTask)) {
        await updateStory(currentTask.id, updatedFields);
      } else if (isBug(currentTask)) {
        await updateBug(currentTask.id, updatedFields);
      } else {
        await updateTask(currentTask.id, updatedFields);
      }
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getTaskType = () => {
    if (isUserStory(currentTask)) return "User Story";
    if (isBug(currentTask)) return "Bug";
    return "Task";
  };

  const renderForm = () => {
    if (isEditMode) {
      if (isUserStory(currentTask)) {
        return <UserStoryEditForm 
          task={currentTask} 
          onSave={handleSave}
          onCancel={()=>{}} 
          availableEpics={[]}
          availableSprints={[]}
          availableUsers={[]}
          
        />;
      } else if (isBug(currentTask)) {
        return <BugEditForm 
          task={currentTask} 
          onSave={handleSave}
          onCancel={()=>{}}
          availableSprints={[]}
          availableTasks={onlytasks}
          availableUserStories={onlystories}
          availableUsers={[]}
         />;
      } else {
        return <TaskEditForm 
          task={currentTask} 
          onSave={handleSave}  
          onCancel={()=>{}}
          availableSprints={[]}
          availableUsers={[]}
          userstories={onlystories}
        />;
      }
    } else {
      if (isUserStory(currentTask)) {
        return <UserStoryViewForm task={currentTask} />;
      } else if (isBug(currentTask)) {
        return <BugViewForm task={currentTask} />;
      } else {
        return <TaskViewForm task={currentTask} />;
      }
    }
  };


  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Sidebar Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pointer-events-none">
        <DialogPanel
          className="pointer-events-auto w-[33vw] h-full bg-[#F5F0F1] shadow-xl flex flex-col transition-transform duration-300"
          style={{ marginTop: '77px', height: 'calc(100vh - 77px)' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#F5F0F1] z-10 px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#4A2B4A]">
                {isEditMode ? "Edit " : "Details "}
                {getTaskType()}
              </h2>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="bg-[#4A2B4A] text-white border-none hover:bg-white hover:text-[#4A2B4A] hover:border-[#4A2B4A] transition-all duration-200"
                >
                  {isEditMode ? (
                    <>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto px-6 py-4">
            <div className="space-y-4 pr-2">
              {renderForm()}

              {/* Comments Section */}
              <CommentsSection
                task={currentTask}
                userId={userId}
                userData={userData}
                onUpdateComments={async (comments) => {
                  if (isUserStory(currentTask)) {
                    await updateStory(currentTask.id, { comments })
                  } else if (isBug(currentTask)) {
                    await updateBug(currentTask.id, { comments })
                  } else {
                    await updateTask(currentTask.id, { comments })
                  }
                }}
              />
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
export default TaskSidebar;