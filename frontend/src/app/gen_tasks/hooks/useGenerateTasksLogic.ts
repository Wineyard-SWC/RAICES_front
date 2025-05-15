// hooks/useGenerateTasksLogic.ts
"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Task, TaskFormData } from "@/types/task"
import type { UserStory } from "@/types/userstory"
import { postTasks } from "@/utils/postTasks"
import { parseTasksFromApi } from "@/utils/parseTasksFromApi"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { buildTasksPrompt }   from "@/utils/prompt";
import { buildTasksPayload }  from "@/utils/buildTasksPayload";
import { Sprint, SprintFormData } from "@/types/sprint"
import { useUserStories } from "@/contexts/saveduserstoriescontext";
import { useTasks } from "@/contexts/taskcontext"
import { useUser } from "@/contexts/usercontext"
import { useGeneratedTasks } from "@/contexts/generatedtaskscontext"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useGenerateTasksLogic = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId =
    searchParams.get("projectId") ||
    (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) ||
    ""

  const tasksContext = useTasks();
  const { tasks: generatedTasks, addTasks, clearTasks, updateTask, deleteTask, handleSelectAll, handleToggleSelectTask  } = useGeneratedTasks()
  
  const { 
    getUserStoriesForProject,
    setUserStoriesForProject,
    loadUserStoriesIfNeeded
  } = useUserStories();

  const savedUserStories = getUserStoriesForProject(projectId);

  const { userData } = useUser();
    
    const getUserInfo = (): [string, string] => {
      const userId = localStorage.getItem("userId") || "RAICES_IA";
      const userName = userData?.name || "RAICES_IA";
      return [userId, userName];
    };
    const userInfo = getUserInfo();

  // User Stories
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [isLoadingStories, setIsLoadingStories] = useState(false)
  const [storiesError, setStoriesError] = useState<string | null>(null)



  // Tasks
  const [selectedUserStories, setSelectedUserStories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false)
  const [isSavingTasks, setIsSavingTasks] = useState(false)



  const loadTasksIfNeeded = async () => {
    if (!projectId) return [];
    
    try {
      const fetchFunction = async (projId: string) => {
        const response = await fetch(`${API_URL}/projects/${projId}/tasks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      };
      
      return await tasksContext.loadTasksIfNeeded(projectId, fetchFunction);
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  };

  // Derived
  const groupedByUserStory = generatedTasks.reduce(
    (acc, t) => {
      acc[t.user_story_id] = acc[t.user_story_id] || []
      acc[t.user_story_id].push(t)
      return acc
    },
    {} as Record<string, Task[]>
  )
  const userStoryTitles = userStories.reduce(
    (acc, us) => ({ ...acc, [us.uuid]: us.title }),
    {} as Record<string, string>
  )

   useEffect(() => {
    if (!projectId) return

    setIsLoadingStories(true);

    // Usar el context con cache
    const loadUserStories = async () => {
      try {
        // Intentar cargar desde cache primero
        const stories = await loadUserStoriesIfNeeded(
          projectId,
          getProjectUserStories,
          10 * 60 * 1000 
        );
        
        setUserStories(stories);
      } catch (e) {
        // Fallback: si el context falla, cargar directamente
        try {
          const stories = await getProjectUserStories(projectId);
          setUserStories(stories);
          setUserStoriesForProject(projectId, stories);
        } catch (err) {
          setStoriesError("Failed to load user stories");
        }
      } finally {
        setIsLoadingStories(false);
      }
    };

    // Si ya hay stories en cache, usarlas
    if (savedUserStories && savedUserStories.length > 0) {
      setUserStories(savedUserStories);
      setIsLoadingStories(false);
    } else {
      loadUserStories();
    }
  }, [projectId]);


  const toggleSelectUserStory = (id: string) =>
    setSelectedUserStories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const handleGenerate = async () => {
    if (!selectedUserStories.length) {
      setError("Please select at least one user story");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const stories = userStories
        .filter(us => selectedUserStories.includes(us.uuid))
        .map(({ uuid, title, description, acceptanceCriteria }) => ({
          id: uuid,
          title,
          description,
          acceptanceCriteria: acceptanceCriteria.map(ac => ac.description)         
      }));
        
      const payload = buildTasksPayload(stories);   
      
      const res = await fetch(
      "https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/",{ 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) }
      );
      
      const { success, data, error: srvErr } = await res.json();
      if (!success) throw new Error(srvErr || "Generation failed");
      
      const parsedTasks = parseTasksFromApi(data)
      addTasks(parsedTasks)
      

      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Failed to generate tasks.");
      } finally {
        setIsLoading(false);
      }
    };

  const handleImportUnassignedTasks = async () => {
    setIsLoadingUnassigned(true);
    setError(null);
    
    try {
      const allTasks = await loadTasksIfNeeded();
      
      const unassignedTasks = allTasks.filter(task => 
        !task.sprint_id || task.sprint_id === '' || task.sprint_id === null
      );
      
      const transformedTasks: Task[] = unassignedTasks.map(task => ({
        ...task,
        selected: true,
        user_story_title: userStoryTitles[task.user_story_id] || 'Unassigned'
      }));
      
      addTasks(transformedTasks);
      
    } catch (e: any) {
      console.error('Error importing unassigned tasks:', e);
      setError(e.message ?? "Failed to import unassigned tasks.");
    } finally {
      setIsLoadingUnassigned(false);
    }
  };

  const handleSave = async () => {
     const selectedTasks = generatedTasks.filter(t => 
      t.selected && 
      t.user_story_title !== "Unassigned" && 
      t.user_story_id && 
      userStories.some(us => us.uuid === t.user_story_id) 
    );

    if (selectedTasks.length === 0) {
      setError("No valid tasks to save. Tasks without a valid user story cannot be saved.");
      return;
    }
    
    setIsSavingTasks(true);
    setError(null);

    try {
      const savedTasks = await postTasks(projectId, selectedTasks, tasksContext);
      const updatedStories = userStories.map(us => {
        const tasksOfStory = savedTasks.filter(t => t.user_story_id === us.uuid);
        const totalTasks = tasksOfStory.length;
        const sumPoints  = tasksOfStory.reduce((sum, t) => sum + (t.story_points || 0), 0);
        const completedCriteria = us.acceptanceCriteria?.filter(ac => ac.date_completed)?.length || 0;
        
        const task_list = tasksOfStory.map(t => t.id)

        return {
          uuid: us.uuid,  //1                 
          idTitle: us.idTitle, //1             
          title: us.title, //1
          description: us.description, //1
          acceptanceCriteria: us.acceptanceCriteria,
          priority: us.priority, //1
          comments: us.comments || [], //1
          status_khanban: us.status_khanban || "Backlog", //1
          projectRef: projectId, //1
          points: sumPoints, //1
          total_tasks: totalTasks, //1
          task_completed: 0, //1
          completed_acceptanceCriteria: completedCriteria,//1
          total_acceptanceCriteria: us.acceptanceCriteria?.length || 0, //1
          deadline: us.deadline || '', //1
          date_completed: us.date_completed || '',//1
          assigned_sprint: us.assigned_sprint || '',//1
          assignee: us.assignee || [],//1
          task_list: task_list.length > 0 ? task_list : (us.task_list || []),
          epicRef: us.assigned_epic
        };
      });


      const response = await fetch(`${API_URL}/projects/${projectId}/userstories/batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStories),
        }
      );

      const responseData = await response.json();

      const enrichedUserStories: UserStory[] = responseData.map((res: any, idx: number) => ({
        ...updatedStories[idx], 
        id: res.id,             
        selected: false          
      }));

      setUserStoriesForProject(projectId, enrichedUserStories);

      
      router.push(`/sprint_planning?projectId=${projectId}`);
    } catch (e: any) {
      console.error(e);
      setError("Failed to save tasks.");
    } finally {
      setIsSavingTasks(false);
    }
  };

  const handleUpdateTask = (id: string, data: Partial<Task>) =>
    updateTask(id, data)


  const handleDeleteTask = (id: string) =>
    deleteTask(id)

  
  const handleAddTask = (form: TaskFormData) => {
    const now = new Date().toISOString()
    const userStory = userStories.find(us => us.uuid === form.user_story_id)

    const nt: Task = {
      id: `temp-${Date.now()}`,
      title: form.title,
      description: form.description,
      date: now,
      user_story_id: form.user_story_id,
      user_story_title: userStory?.title,
      assignee: form.assignee,
      status_khanban: form.status_khanban,
      priority: form.priority,
      story_points: form.story_points,
      deadline: form.deadline,
      created_at: now,
      updated_at: now,
      comments: [],
      selected: true,
      created_by: userInfo,
      date_created:  now,
      modified_by: userInfo,
      date_modified: now,
      finished_by: ['', ''],
      date_completed: '',
    }
    addTasks([nt])
  }
  const handleSelectAlltasks = () =>
    handleSelectAll()
  
  const allSelected = generatedTasks.every(t => t.selected)
  const toggleSelectAllTasks = () => {
    if (allSelected) {
      generatedTasks.forEach(t => updateTask(t.id, { selected: false }))
    } else {
      handleSelectAll()
    }
  }

  const handleClear = () => {
    clearTasks()
    setSelectedUserStories([])
  }

  return {
    userStories,
    isLoadingStories,
    storiesError,
    selectedUserStories,
    toggleSelectUserStory,
    generatedTasks,
    groupedByUserStory,
    userStoryTitles,
    error,
    isLoading,
    handleGenerate,
    handleSave,
    handleUpdateTask,
    handleDeleteTask,
    handleAddTask,
    handleSelectAlltasks,
    handleClear,
    handleToggleSelectTask,
    toggleSelectAllTasks,
    isSavingTasks,
    allSelected,
    handleImportUnassignedTasks,
    isLoadingUnassigned
  }
}
