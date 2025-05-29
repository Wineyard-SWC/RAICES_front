import { useState, useEffect } from "react";
import { X, Plus, Bug, BookOpen, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/usercontext";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import CreateTaskForm from "./createtaskform";
import CreateBugForm from "./createbugform";
import CreateUserStoryForm from "./createuserstory";
import { useTasks } from "@/contexts/taskcontext";
import { useBugs } from "@/contexts/bugscontext";
import { useUserStories } from "@/contexts/saveduserstoriescontext";
import { createTask as addTask} from "@/utils/postTasks";
import { createBug as addBug } from "@/hooks/useBug";
import { postUserStories as addStory } from "@/utils/postUserStories";
import { Task, TaskFormData } from "@/types/task";
import { UserStory } from "@/types/userstory";
import { Bug as BugType } from "@/types/bug";
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogPanel } from "@headlessui/react";
import { getProjectEpics } from "@/utils/getProjectEpics";
import { getProjectSprints } from "@/utils/getProjectSprints";
import { Sprint } from "@/types/sprint";

interface CreateItemSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type ItemType = "task" | "userstory" | "bug" | null;

// Project user interface
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

const CreateItemSidebar = ({ isOpen, onClose, projectId }: CreateItemSidebarProps) => {
  const [selectedType, setSelectedType] = useState<ItemType>(null);
  const { userId, userData } = useUser();
  const taskcontext = useTasks();
  const storiescontext = useUserStories();
  const { addBugToProject } = useBugs();
  const { getUserStoriesForProject } = useUserStories();
  const { getTasksForProject } = useTasks();
  
  // Add states for available data
  const [availableSprints, setAvailableSprints] = useState<Sprint[]>([]);
  const [availableEpics, setAvailableEpics] = useState<EpicOption[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ProjectUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onlystories = getUserStoriesForProject(projectId!);
  const onlytasks = getTasksForProject(projectId!);
  
  const getUserInfo = (): [string, string] => {
    return [userId, userData?.name!];
  };
  const userInfo = getUserInfo();

  // Fetch available data when component mounts or projectId changes
  useEffect(() => {
    if (!projectId || !isOpen) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available sprints
        const sprints = await getProjectSprints(projectId);
        setAvailableSprints(sprints);
        
        // Fetch available epics
        const epics = await getProjectEpics(projectId);
        const formattedEpics = epics.map(epic => ({
          id: epic.idTitle || epic.uuid,
          name: epic.title || epic.idTitle
        }));
        setAvailableEpics(formattedEpics);
        
        // Fetch available users (project members)
        const apiURL = process.env.NEXT_PUBLIC_API_URL;
        const usersResponse = await fetch(`${apiURL}/project_users/project/${projectId}`);
        
        if (!usersResponse.ok) {
          console.warn("Failed to fetch project users, using empty list");
          setAvailableUsers([]);
          return;
        }
        
        const users = await usersResponse.json();
        
        const formattedUsers = users.map((user: any) => ({
          id: user.id || user.user_id || user.userId,
          name: user.name || user.username || user.email || "User",
          role: user.role || "Team Member",
          email: user.email
        }));
        
        setAvailableUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays to prevent errors
        setAvailableSprints([]);
        setAvailableEpics([]);
        setAvailableUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, isOpen]);

  const handleCreate = async (itemData: any, type: ItemType) => {
    try 
    {
        let now = new Date().toISOString();

        if (type == 'task'){
            const NewTask: TaskFormData = {
                id: itemData.id || uuidv4(),
                title: itemData.title,
                description: itemData.description,
                user_story_id: itemData.user_story_id || '',
                assignee: itemData.assignee || [],
                status_khanban: itemData.status_khanban || "Backlog",
                priority: itemData.priority || "Medium",
                story_points: itemData.story_points || 0,
                deadline: itemData.deadline || '',
                comments: itemData.comments || [],
                created_by: itemData.created_by || userInfo,
                date_created: itemData.date_created || now,
                modified_by: itemData.modified_by || userInfo,
                date_modified: itemData.date_modified || now,
                finished_by: itemData.finished_by ||['', ''],
                date_completed: itemData.date_completed || ''
            }
            await addTask(projectId!, NewTask, taskcontext);
        }
        else if (type == 'userstory'){
            const NewUserStory:  Omit<UserStory, 'id' | 'selected'> = {
                uuid: itemData.uuid || uuidv4(),
                idTitle: itemData.idTitle || "HU-###",
                title: itemData.title,
                description: itemData.description,
                priority: itemData.priority || "Medium",
                points: itemData.points || 0,
                assigned_epic: itemData.assigned_epic || "",
                projectRef: projectId!,
                comments: itemData.comments || [],
                status_khanban: itemData.status_khanban || 'Backlog',
                total_tasks: itemData.total_tasks || 0,
                task_completed: itemData.task_completed || 0,
                completed_acceptanceCriteria: itemData.completed_acceptanceCriteria || "0",
                total_acceptanceCriteria: itemData.acceptanceCriteria?.length || 0,
                deadline: itemData.deadline || '',
                date_completed: itemData.date_completed || '',
                assigned_sprint: itemData.assigned_sprint || '',
                assignee: itemData.assignee || [],
                acceptanceCriteria: itemData.acceptanceCriteria || [],
                task_list: itemData.task_list || [],  
            }   
            const stories = storiescontext.getUserStoriesForProject(projectId!);
            const updatedStories = [...stories, NewUserStory];
            await addStory(updatedStories, 
                           projectId!, 
                           (updatedStories) => storiescontext.setUserStoriesForProject(projectId!, updatedStories));
        }
        else
        {
            const newBug: BugType = {
                id: itemData.bugId || uuidv4(),
                title: itemData.title,
                description: itemData.description,
                type: itemData.type || "Other" ,
                severity: itemData.severity || "Minor",
                priority: itemData.priority ||  "Medium",
                status_khanban: itemData.status_khanban || "Backlog",
                bug_status:itemData.bug_status || "New",
                projectId:projectId!,
                reportedBy:itemData.reportedBy || {"users": [userInfo[0],userInfo[1]]},
                assignee:itemData.assignee || [],
                createdAt: itemData.createdAt || now,
                modifiedAt: itemData.modifiedAt || now,
                stepsToReproduce:itemData.stepsToReproduce || [],
                visibleToCustomers:itemData.visibleToCustomers || false,
                affectedComponents: itemData.affectedComponents?.length > 0 ? itemData.affectedComponents : undefined,
                environment: Object.values(itemData.environment).some((val: any) => val?.trim() !== "")
                ? {
                    browser: itemData.environment?.browser || undefined,
                    os: itemData.environment?.os || undefined,
                    device: itemData.environment?.device || undefined,
                    version: itemData.environment?.version || undefined,
                    otherDetails: itemData.environment?.otherDetails || undefined,
                    }
                : undefined,
            }  

            await addBug(newBug);
            addBugToProject(projectId!, newBug);
        }

      onClose();
      setSelectedType(null);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const renderTypeSelector = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#4A2B4A] mb-4">What would you like to create?</h3>
      
      <div className="space-y-3">
        <button
          onClick={() => setSelectedType("task")}
          className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-purple-600" />
            <div>
              <h4 className="font-semibold text-[#4A2B4A]">Task</h4>
              <p className="text-lg text-gray-600">A specific piece of work to be completed</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedType("userstory")}
          className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-[#4A2B4A]">User Story</h4>
              <p className="text-lg text-gray-600">A feature or requirement from the user's perspective</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedType("bug")}
          className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Bug className="h-6 w-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-[#4A2B4A]">Bug Report</h4>
              <p className="text-lg text-gray-600">Report an issue or defect in the system</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (selectedType) {
      case "task":
        return (
          <CreateTaskForm 
            onSave={(data:Task) => handleCreate(data, "task")}
            onCancel={() => setSelectedType(null)}
            availableSprints={availableSprints.map(sprint => ({
              id: sprint.id,
              name: sprint.name
            }))}
            availableUsers={availableUsers}
            userstories={onlystories}
          />
        );
      case "userstory":
        return (
          <CreateUserStoryForm 
            onSave={(data:UserStory) => handleCreate(data, "userstory")}
            onCancel={() => setSelectedType(null)}
            availableEpics={availableEpics}
            availableSprints={availableSprints.map(sprint => ({
              id: sprint.id,
              name: sprint.name
            }))}
            availableUsers={availableUsers}
          />
        );
      case "bug":
        return (
          <CreateBugForm 
            onSave={(data:BugType) => handleCreate(data, "bug")}
            onCancel={() => setSelectedType(null)}
            projectId={projectId}
            availableTasks={onlytasks}
            availableUserStories={onlystories}
            //availableUsers={availableUsers}
          />
        );
      default:
        return renderTypeSelector();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Sidebar Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pointer-events-none">
        <DialogPanel
          className="pointer-events-auto w-[33vw] h-screen bg-[#F5F0F1] shadow-xl flex flex-col transition-transform duration-300"
          style={{ 
            height: '100vh'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 px-6 pt-6">
            <div className="flex items-center gap-2">
              <Plus className="h-6 w-6 text-[#4A2B4A]" />
              <h2 className="text-xl font-bold text-[#4A2B4A]">
                {selectedType
                  ? `Create ${selectedType === "userstory"
                    ? "User Story"
                    : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`
                  : "Create New Item"}
              </h2>
            </div>

            <div className="flex gap-2">
              {selectedType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType(null)}
                  className="bg-[#4A2B4A] text-white hover:bg-gray-700"
                >
                  Back
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="space-y-4 flex-grow overflow-y-auto px-6 py-4 pr-2">
            {isLoading && selectedType ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-lg text-gray-600">Loading project data...</p>
              </div>
            ) : (
              renderForm()
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog> 
  );
}

export default CreateItemSidebar;
