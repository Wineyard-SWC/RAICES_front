import { useState, useEffect } from "react";
import { X, Edit, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBug, TaskOrStory, isUserStory } from "@/types/taskkanban";
import { useUser } from "@/contexts/usercontext";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { useMemo } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useUserPermissions } from "@/contexts/UserPermissions";
import { getProjectEpics } from "@/utils/getProjectEpics";
import { getProjectSprints } from "@/utils/getProjectSprints";
import TaskViewForm from "../detailedcardviews/taskviewform";
import TaskEditForm from "../detailedcardviews/taskvieweditform";
import UserStoryViewForm from "../detailedcardviews/userstoryviewform";
import UserStoryEditForm from "../detailedcardviews/usersotoryvieweditform";
import BugViewForm from "../detailedcardviews/bugviewform";
import BugEditForm from "../detailedcardviews/bugvieweditform";
import CommentsSection from "../detailedcardviews/commentssection";
import { useUserStories } from "@/contexts/saveduserstoriescontext";
import { useTasks } from "@/contexts/taskcontext";
import { Sprint } from "@/types/sprint";
import { printError } from "@/utils/debugLogger";

// Definir constante para el permiso REQ_MANAGE
const PERMISSION_REQ_MANAGE = 1 << 2;

interface TaskSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskOrStory | null;
}

interface ProjectUser {
  id: string;
  name: string;
  role?: string;
  email?: string;
}

// Epic interface (simplified for the form)
interface EpicOption {
  id: string;
  name: string;
}

const TaskSidebar = ({ isOpen, onClose, task }: TaskSidebarProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const {userId, userData } = useUser();
  const {currentProjectId, tasks, updateTask, updateStory, updateBug } = useKanban();
  const {getUserStoriesForProject } = useUserStories();
  const {getTasksForProject } = useTasks();
  const [availableSprints, setAvailableSprints] = useState<Sprint[]>([]);
  const [availableEpics, setAvailableEpics] = useState<EpicOption[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ProjectUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener la función hasPermission del contexto
  const { hasPermission } = useUserPermissions();
  
  // Verificar si el usuario tiene el permiso para editar items
  const canManageItems = hasPermission(PERMISSION_REQ_MANAGE);

  const onlystories = getUserStoriesForProject(currentProjectId!);
  const onlytasks = getTasksForProject(currentProjectId!);
  
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
    setValidationErrors({}); // Clear validation errors when task changes
  }, [task]);

  useEffect(() => {
    // Si el usuario no tiene permiso para editar, asegurar que siempre esté en modo vista
    if (!canManageItems) {
      setIsEditMode(false);
    }
  }, [canManageItems, task]);


  useEffect(() => {
      if (!currentProjectId || !isOpen) return;
      
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const sprints = await getProjectSprints(currentProjectId);
          setAvailableSprints(sprints);
          
          const epics = await getProjectEpics(currentProjectId);
          const formattedEpics = epics.map(epic => ({
            id: epic.idTitle || epic.uuid,
            name: epic.title || epic.idTitle
          }));
          setAvailableEpics(formattedEpics);
          
          const apiURL = process.env.NEXT_PUBLIC_API_URL;
          const usersResponse = await fetch(`${apiURL}/project_users/project/${currentProjectId}`);
          
          if (!usersResponse.ok) {
            console.warn("Failed to fetch project users, using empty list");
            setAvailableUsers([]);
            return;
          }
          
          const users = await usersResponse.json();
          const formattedUsers = users.map((user: any) => ({
            id: user.userRef,
            name: user.name || user.username || user.email || "User",
            role: user.role || "Team Member",
            email: user.email
          }));
          
          setAvailableUsers(formattedUsers);
        } catch (error) {
          printError("Error fetching data:", error);
          setAvailableSprints([]);
          setAvailableEpics([]);
          setAvailableUsers([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }, [currentProjectId, isOpen]);

  if (!isOpen || !currentTask) return null;

  const validateForm = (formData: any) => {
    const errors: Record<string, string> = {};
    
    // Common validations for all item types
    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }
    
    // Type-specific validations
    if (isUserStory(currentTask)) {
      // Add user story specific validations
      if (!formData.acceptanceCriteria || formData.acceptanceCriteria.length === 0) {
        errors.acceptanceCriteria = "At least one acceptance criteria is required";
      }
    } else if (isBug(currentTask)) {
      // Add bug specific validations
      if (!formData.severity) {
        errors.severity = "Severity is required";
      }
      if (!formData.bug_status) {
        errors.bugStatus = "Bug status is required";
      }
    }
    
    return errors;
  };

  const handleSave = async (updatedFields: any) => {
    try {
      // Validate form data before saving
      const errors = validateForm(updatedFields);
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return; // Don't proceed with save if there are validation errors
      }
      
      if (isUserStory(currentTask)) {
        await updateStory(currentTask.id, updatedFields);
      } else if (isBug(currentTask)) {
        await updateBug(currentTask.id, updatedFields);
      } else {
        await updateTask(currentTask.id, updatedFields);
      }
      setIsEditMode(false);
      setValidationErrors({}); // Clear any previous errors on successful save
    } catch (error) {
      printError('Error updating task:', error);
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
          onCancel={() => setIsEditMode(false)} 
          availableEpics={availableEpics}
          availableSprints={availableSprints}
          availableUsers={availableUsers}
          validationErrors={validationErrors}
        />;
      } else if (isBug(currentTask)) {
        return <BugEditForm 
          task={currentTask} 
          onSave={handleSave}
          onCancel={() => setIsEditMode(false)}
          availableSprints={availableSprints}
          availableTasks={onlytasks}
          availableUserStories={onlystories}
          availableUsers={availableUsers}
          validationErrors={validationErrors}
        />;
      } else {
        return <TaskEditForm 
          task={currentTask} 
          onSave={handleSave}  
          onCancel={() => setIsEditMode(false)}
          availableSprints={availableSprints}
          availableUsers={availableUsers}
          userstories={onlystories}
          validationErrors={validationErrors}
        />;
      }
    } else {
      // View modes remain unchanged
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
          className="pointer-events-auto w-[33vw] h-screen bg-[#F5F0F1] shadow-xl flex flex-col transition-transform duration-300"
          style={{ 
            height: '100vh' // Cambiado a 100vh para cubrir toda la altura de la ventana
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#F5F0F1] z-10 px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#4A2B4A]">
                {isEditMode ? "Edit " : "Details "}
                {getTaskType()}
              </h2>

              <div className="flex gap-2">
                {/* Mostrar botón de edición SOLO si tiene el permiso REQ_MANAGE */}
                {canManageItems && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      if (!isEditMode) setValidationErrors({});
                    }}
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
                )}
                
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto px-6 py-4">
            <div className="space-y-4 pr-2">
              {/* Siempre renderizar el formulario correcto según el modo */}
              {renderForm()}

              {/* Comments Section */}
              <CommentsSection
                task={currentTask}
                userId={userId}
                userData={userData}
                onUpdateComments={async (comments) => {
                  if (isUserStory(currentTask)) {
                    await updateStory(currentTask.id, { comments });
                  } else if (isBug(currentTask)) {
                    await updateBug(currentTask.id, { comments });
                  } else {
                    await updateTask(currentTask.id, { comments });
                  }
                }}
              />
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TaskSidebar;