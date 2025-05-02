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

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useGenerateTasksLogic = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId =
    searchParams.get("projectId") ||
    (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) ||
    ""

  // User Stories
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [isLoadingStories, setIsLoadingStories] = useState(false)
  const [storiesError, setStoriesError] = useState<string | null>(null)

  // Tasks
  const [selectedUserStories, setSelectedUserStories] = useState<string[]>([])
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)

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

  // Fetch user stories
  useEffect(() => {
    if (!projectId) return
    setIsLoadingStories(true)
    getProjectUserStories(projectId)
      .then(setUserStories)
      .catch((e) => {
        console.error(e)
        setStoriesError("Failed to load user stories")
      })
      .finally(() => setIsLoadingStories(false))
  }, [projectId])

  // console.log(userStories);

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
        // hooks/useGenerateTasksLogic.ts  (fragmento)
        const stories = userStories
          .filter(us => selectedUserStories.includes(us.uuid))
          .map(({ uuid, title, description, acceptanceCriteria }) => ({
            id: uuid,
            title,
            description,
            acceptanceCriteria          // ← ¡nuevo!
          }));
        
        //console.log("this is stories:");
        //console.log(stories);

        const payload = buildTasksPayload(stories);   // ya enviará el campo


        console.log(payload);
      
        const res = await fetch(
        "https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/",
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) }
      );
      
      const { success, data, error: srvErr } = await res.json();
      //console.log(data);
      if (!success) throw new Error(srvErr || "Generation failed");
      
      console.log("this is data:");
      console.log(data);
      setGeneratedTasks(parseTasksFromApi(data));
      
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Failed to generate tasks.");
        setGeneratedTasks([]);
      } finally {
        setIsLoading(false);
      }
    };



  
  // ←––––––––––––––––––––––––––––––

  // Save tasks
  // en GenerateTasksPage (hooks/useGenerateTasksLogic.ts) → handleSave:
  // hooks/useGenerateTasksLogic.ts
  const handleSave = async () => {
    if (generatedTasks.length === 0) {
      setError("No tasks to save");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // 1️⃣ Guarda SOLO las tareas (aún sin sprint)
      await postTasks(projectId, generatedTasks);

      // 2️⃣ Ahora calculamos los totales por historia
      //    - total_tasks = número de tasks asociadas
      //    - points      = suma de story_points de esas tasks
      const updatedStories = userStories.map(us => {
        const tasksOfStory = generatedTasks.filter(t => t.user_story_id === us.uuid);
        const totalTasks = tasksOfStory.length;
        const sumPoints  = tasksOfStory.reduce((sum, t) => sum + (t.story_points || 0), 0);
        return {
          // campos mínimos que el endpoint espera:
          uuid: us.uuid,                   // id interno
          idTitle: us.idTitle,             // p.e. "US-123"
          title: us.title,
          description: us.description,
          acceptanceCriteria: us.acceptanceCriteria,
          priority: us.priority,
          comments: us.comments || [],
          status_khanban: us.status_khanban || "Backlog",
          projectRef: projectId,
          points: sumPoints,
          total_tasks: totalTasks,
          task_completed: 0,               // o si llevas cuenta, el filtrado de completadas
        };
      });
+
      // 3️⃣ Envío batch para actualizar las historias
      await fetch(
        `${API_URL}/projects/${projectId}/userstories/batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStories),
        }
      );

      // 4️⃣ Navega a Sprint Planning; allí se creará el sprint
      router.push(`/sprint_planning?projectId=${projectId}`);
    } catch (e: any) {
      console.error(e);
      setError("Failed to save tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = (id: string, data: Partial<Task>) =>
    setGeneratedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    )
  const handleDeleteTask = (id: string) =>
    setGeneratedTasks((prev) => prev.filter((t) => t.id !== id))
  const handleAddTask = (form: TaskFormData) => {
    const nt: Task = {
      id: `temp-${Date.now()}`,
      ...form,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments: [],
      selected: true,
    }
    setGeneratedTasks((prev) => [...prev, nt])
  }
  const handleSelectAll = () =>
    setGeneratedTasks((prev) => prev.map((t) => ({ ...t, selected: true })))
  const handleClear = () => {
    setGeneratedTasks([])
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
    handleSelectAll,
    handleClear,
  }
}
