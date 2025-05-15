import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSprintContext } from "@/contexts/sprintcontext";
import { useTasks } from "@/contexts/taskcontext"
import { useUserStories  } from "@/contexts/saveduserstoriescontext";
import type { Sprint, SprintMember } from "@/types/sprint";
import { buildSprintPayload } from "@/utils/buildSprintPayload";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { getProjectTasks } from "@/utils/getProjectTasks";
import { Task } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Función para obtener el propietario del proyecto
async function fetchProjectOwner(projectId: string): Promise<SprintMember|null> {
  const res = await fetch(`${API_URL}/project_users/project/${projectId}`);
  if (!res.ok) return null;
  const list = await res.json();
  
  if (!Array.isArray(list) || list.length === 0) return null;

  // Busca un usuario con rol "owner" o toma el primero disponible
  const raw = list.find((u:any) => (u.role || "").toLowerCase()==="owner") || list[0];
  
  return {
    id: raw.id,
    name: raw.name || raw.email || "Owner",
    role: raw.role || "Owner",
    avatar: raw.avatar,
    capacity: 0,
    allocated: 0,
  };
}

export function useSprintPlanningLogic() {
  // Obtener parámetros de la URL
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("projectId") || "";
  const sprintId = params.get("sprintId") || "";

  // Context del sprint
  const { sprint, tasks, setSprint, setTasks } = useSprintContext();
  
  // Context de tareas (con cache)
  const taskContext = useTasks();
  
  // Context de user stories (con cache)
  const userStoryContext = useUserStories();

  // Estados del UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [openSB, setOpenSB] = useState(true);

  // Crear un sprint local vacío con el propietario del proyecto
  const makeLocalSprint = async (): Promise<Sprint> => {
    const now = new Date().toISOString();
    const in2w = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const owner = await fetchProjectOwner(projectId);
    
    return {
      id: `temp-${Date.now()}`,
      name: `Sprint ${new Date().getMonth() + 1}`,
      project_id: projectId,
      start_date: now,
      end_date: in2w,
      duration_weeks: 2,
      status: "planning",
      team_members: owner ? [owner] : [],
      user_stories: [],
      created_at: now,
      updated_at: now,
    };
  };

  // 1️⃣ Cargar sprint existente o crear uno local
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        setLoading(true);

        // Cargar sprint existente
        if (sprintId) {
          // Obtener sprint desde API
          const sprintRes = await fetch(`${API_URL}/projects/${projectId}/sprints/${sprintId}`);
          
          if (!sprintRes.ok) throw new Error("Sprint not found");
          const raw: Sprint = await sprintRes.json();

          // Obtener tareas usando el context (con cache)
          let projectTasks: Task[] = [];
          try {
            projectTasks = await taskContext.loadTasksIfNeeded(
              projectId,
              getProjectTasks, // función que hace la llamada a la API
              5 * 60 * 1000    // cache por 5 minutos
            );
          } catch (err) {
            console.error("Error loading tasks from context:", err);
            // Fallback: intentar cargar directamente
            projectTasks = await getProjectTasks(projectId);
          }

          // Agregar owner si no está presente
          const owner = await fetchProjectOwner(projectId);
          if (owner && !raw.team_members.some(m => m.id === owner.id)) {
            raw.team_members.push(owner);
          }

          // Hidratar las tasks (convertir IDs string a objetos Task completos)
          const hydratedStories = raw.user_stories.map(us => {
            const fullTasks = us.tasks
              .map(id => projectTasks.find(t => t.id === id))
              .filter(Boolean) as Task[];

            if (us.tasks.length && fullTasks.length === 0) {
              console.warn(
                `[SprintPlanning] No se encontraron las Tasks de la historia ${us.id}. ` +
                `Ids esperados: ${us.tasks.join(", ")}`
              );
            }

            return { ...us, tasks: fullTasks };
          });

          // Guardar en contexto global
          setTasks(projectTasks);
          setSprint({ ...raw, user_stories: hydratedStories });
        }
        // Crear sprint nuevo en memoria
        else if (!sprint) {
          setSprint(await makeLocalSprint());
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, sprintId]);

  // 2️⃣ Llenar backlog para sprint local
  useEffect(() => {
    if (!projectId || !sprint) return;
    if (sprintId) return; // Solo para sprints nuevos
    if (sprint.user_stories.length) return; // Ya tiene historias

    const fill = async () => {
      setLoading(true);
      try {
        // Cargar user stories usando el context (con cache)
        let stories: any[] = [];
        try {
          stories = await userStoryContext.loadUserStoriesIfNeeded(
            projectId,
            getProjectUserStories, // función que hace la llamada a la API
            10 * 60 * 1000          // cache por 10 minutos
          );
        } catch (err) {
          console.error("Error loading user stories from context:", err);
          // Fallback: intentar cargar directamente
          stories = await getProjectUserStories(projectId);
        }

        // Cargar tareas usando el context (con cache)
        let allTasks: Task[] = [];
        try {
          allTasks = await taskContext.loadTasksIfNeeded(
            projectId,
            getProjectTasks,
            5 * 60 * 1000   // cache por 5 minutos
          );
        } catch (err) {
          console.error("Error loading tasks from context:", err);
          // Fallback: intentar cargar directamente
          allTasks = await getProjectTasks(projectId);
        }
        
        setTasks(allTasks);
        setSprint({
          ...sprint,
          user_stories: stories.map(st => ({
            id: st.uuid,
            userStory: st,
            selected: false,
            tasks: allTasks.filter(t => t.user_story_id === st.uuid),
          })),
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fill();
  }, [projectId, sprint, taskContext, userStoryContext]);

  // Guardar sprint (crear o actualizar)
  const handleSaveSprint = async () => {
    if (!sprint) return;

    // Construir payload con solo las historias seleccionadas
    const payload = buildSprintPayload({
      ...sprint,
      user_stories: sprint.user_stories
        .filter((us) => us.selected)
        .map((us) => ({
          ...us,
          tasks: tasks.filter((t) => t.user_story_id === us.id),
        })),
    });

    setLoading(true);

    try {
      // 1) Guardar sprint (PUT si existe, POST si es nuevo)
      const url = sprintId
        ? `${API_URL}/projects/${projectId}/sprints/${sprintId}`
        : `${API_URL}/projects/${projectId}/sprints`;

      const res = await fetch(url, {
        method: sprintId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      const saved: Sprint = await res.json();
      setSprint(saved);

      // 2) Actualizar sprint_id en las tareas
      const updatedTasks = tasks.map(t =>
        t.sprint_id === sprint.id
          ? { ...t, sprint_id: saved.id }
          : t
      );
      
      setTasks(updatedTasks);

      // 3) Actualizar tareas en el context también
      taskContext.setTasksForProject(projectId, updatedTasks);

      // 4) Guardar tareas en lote
      const tasksToUpsert = updatedTasks
        .filter((t) => t.sprint_id === saved.id)
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          user_story_id: t.user_story_id,
          assignee: t.assignee,
          sprint_id: t.sprint_id,
          status_khanban: t.status_khanban,
          priority: t.priority,
          story_points: t.story_points,
          deadline: t.deadline,
          comments: t.comments,
        }));

      const taskRes = await fetch(
        `${API_URL}/projects/${projectId}/tasks/batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tasksToUpsert),
        }
      );
      if (!taskRes.ok) throw new Error("Tasks batch failed");

      // 5) Navegar de vuelta al dashboard
      router.push(`/dashboard?projectId=${projectId}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares para la UI
  const handleSprintUpdate = (updates: Partial<Sprint>) => {
    setSprint({ ...sprint!, ...updates });
  };

  const handleToggleUserStory = (id: string) => {
    setSprint({
      ...sprint!,
      user_stories: sprint!.user_stories.map(us =>
        us.id === id ? { ...us, selected: !us.selected } : us
      ),
    });
  };

  const handleTeamMemberAdd = (member: SprintMember) => {
    if (sprint!.team_members.some(mem => mem.id === member.id)) return;
    setSprint({
      ...sprint!,
      team_members: [...sprint!.team_members, member],
    });
  };

  const handleTeamMemberUpdate = (id: string, data: Partial<SprintMember>) => {
    setSprint({
      ...sprint!,
      team_members: sprint!.team_members.map(mem =>
        mem.id === id ? { ...mem, ...data } : mem
      ),
    });
  };

  const handleTeamMemberRemove = (id: string) => {
    // No permitir eliminar al owner (primer miembro)
    if (id === sprint!.team_members[0]?.id) return;
    setSprint({
      ...sprint!,
      team_members: sprint!.team_members.filter(mem => mem.id !== id),
    });
  };

  const toggleSidebar = () => setOpenSB(!openSB);

  return {
    // Estados
    loading,
    error,
    sprint,
    tasks,
    projectId,
    sprintId,
    openSB,
    
    // Datos computados
    ownerId: sprint?.team_members[0]?.id,
    
    // Funciones
    handleSaveSprint,
    handleSprintUpdate,
    handleToggleUserStory,
    handleTeamMemberAdd,
    handleTeamMemberUpdate,
    handleTeamMemberRemove,
    toggleSidebar,
  };
}