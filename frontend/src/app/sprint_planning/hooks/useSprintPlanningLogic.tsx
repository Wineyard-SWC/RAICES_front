import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSprintContext } from "@/contexts/sprintcontext";
import { useTasks } from "@/contexts/taskcontext"
import { useUserStories  } from "@/contexts/saveduserstoriescontext";
import type { Sprint, SprintMember, SprintUserStory } from "@/types/sprint";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { getProjectTasks } from "@/utils/getProjectTasks";
import { Task } from "@/types/task";
import { BasicTask } from "@/types/task";
import { useAvatar } from "@/contexts/AvatarContext";
import { UserRolesProvider } from "@/contexts/userRolesContext";
import { getProjectSprints } from "@/utils/getProjectSprints";
import { validateSprintDates } from "@/utils/validateSprintDates";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const AVATAR_API = process.env.NEXT_PUBLIC_AVATAR_API!;

async function fetchAvatar(userId: string): Promise<string | null> {
  if (!userId) return null;

  try {
    console.log(`🔍 Fetching avatar for user: ${userId}`);
    const response = await fetch(`${AVATAR_API}/users/${userId}`);

    if (response.status === 404) {
      console.log(`❌ Avatar not found for user: ${userId}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Error fetching avatar: ${response.statusText}`);
    }

    const userData = await response.json();
    const avatarUrl = userData.avatar_url || userData.avatarUrl || null;

    console.log(`✅ Avatar fetched for user: ${userId}`, avatarUrl);
    return avatarUrl;
  } catch (err) {
    console.error(`❌ Error fetching avatar for user: ${userId}`, err);
    return null;
  }
}

async function enrichMemberWithAvatar(member: SprintMember): Promise<SprintMember> {
  try {
    const avatarUrl = await fetchAvatar(member.id);
    return {
      ...member,
      avatar: avatarUrl || member.avatar || null,
    };
  } catch (error) {
    console.error(`Error enriching member ${member.id}:`, error);
    return member;
  }
}

async function enrichMembersWithAvatars(members: SprintMember[]): Promise<SprintMember[]> {
  const enrichedMembers = await Promise.all(
    members.map((member) => enrichMemberWithAvatar(member))
  );
  return enrichedMembers;
}

async function fetchProjectOwner(projectId: string): Promise<SprintMember | null> {
  try {
    const res = await fetch(`${API_URL}/project_users/project/${projectId}`);
    if (!res.ok) {
      console.error("Error fetching project users:", res.status);
      return null;
    }

    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return null;

    const raw = list.find((u: any) => (u.role || "").toLowerCase() === "owner") || list[0];
    const avatarUrl = await fetchAvatar(raw.userRef || raw.id || raw.user_id || raw.userId);

    const baseMember: SprintMember = {
      id: String(raw.userRef || raw.id || raw.user_id || raw.userId || ""),
      name: raw.name || raw.username || raw.email || "Owner",
      role: raw.role || "Owner",
      avatar: avatarUrl || raw.photoURL || raw.avatar || raw.profile_picture,
      capacity: 40,
      allocated: 0,
    };

    return baseMember;
  } catch (error) {
    console.error("Error in fetchProjectOwner:", error);
    return null;
  }
}

function toTaskFormData(task: BasicTask) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    user_story_id: task.user_story_id,
    assignee: task.assignee || undefined,  
    assignee_id: task.assignee_id || undefined,  
    sprint_id: task.sprint_id,
    status_khanban: task.status_khanban,
    priority: task.priority,
    story_points: task.story_points,
    deadline: task.deadline,
    comments: task.comments,
    created_by: task.created_by,
    modified_by: task.modified_by,
    finished_by: task.finished_by,
    date_created: task.date_created,
    date_modified: task.date_modified,
    date_completed: task.date_completed,
  }
}


export function useSprintPlanningLogic() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("projectId") || "";
  const sprintId = params.get("sprintId") || "";
  const [user_stories,setUserStories]= useState<SprintUserStory[]>([]);
  const { sprint, tasks, setSprint, setTasks } = useSprintContext();
  const taskContext = useTasks();
  const userStoryContext = useUserStories();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [openSB, setOpenSB] = useState(true);
  
  const makeLocalSprint = async (): Promise<Sprint> => {
    const now = new Date().toISOString();
    const in2w = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const owner = await fetchProjectOwner(projectId);
    
    return {
      id: `temp-${Date.now()}`,
      name: `New Sprint`,
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

  function normalizeAcceptanceCriteria(userStory: any): any[] {
    let criteria = null;
    
    // Primero intenta desde el objeto directo
    if (Array.isArray(userStory?.acceptance_criteria)) {
      criteria = userStory.acceptance_criteria;
    } else if (Array.isArray(userStory?.acceptanceCriteria)) {
      criteria = userStory.acceptanceCriteria;
    }
    
    return criteria || [];
  }

  function ensureAcceptanceCriteriaStructure(criteria : any[]) {
    return criteria.map(criterion => {
      if (typeof criterion === 'object' && criterion.id && criterion.description) {
        return {
          id: criterion.id,
          description: criterion.description,
          date_completed: criterion.date_completed || "",
          date_created: criterion.date_created || new Date().toISOString(),
          date_modified: criterion.date_modified || new Date().toISOString(),
          finished_by: criterion.finished_by || ["", ""],
          created_by: criterion.created_by || ["RAICES_IA", "RAICES_IA"],
          modified_by: criterion.modified_by || ["RAICES_IA", "RAICES_IA"]
        };
      }
      
      if (typeof criterion === 'string') {
        return {
          id: `temp-${Date.now()}-${Math.random()}`,
          description: criterion,
          date_completed: "",
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
          finished_by: ["", ""],
          created_by: ["RAICES_IA", "RAICES_IA"],
          modified_by: ["RAICES_IA", "RAICES_IA"]
        };
      }
      
      return {
        id: `temp-${Date.now()}-${Math.random()}`,
        description: criterion?.description || "Sin descripción",
        date_completed: "",
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString(),
        finished_by: ["", ""],
        created_by: ["RAICES_IA", "RAICES_IA"],
        modified_by: ["RAICES_IA", "RAICES_IA"]
      };
    });
  }

  useEffect(() => {
    if (!projectId) return;
    
    const load = async () => {
      try {
        setLoading(true);
        
        console.log("🔍 [DEBUG] Starting load process");
        console.log("🔍 [DEBUG] projectId:", projectId);
        console.log("🔍 [DEBUG] sprintId:", sprintId);
        console.log("🔍 [DEBUG] Current sprint in context:", sprint);
        
        let projectTasks: Task[] = [];
        try {
          projectTasks = await taskContext.loadTasksIfNeeded(
            projectId,
            getProjectTasks,
            30 * 60 * 1000  
          );            
        } catch (err) {
          console.error("Error loading tasks from context:", err);
          projectTasks = await getProjectTasks(projectId);
        }
        
        setTasks(projectTasks);
        console.log("🔍 [DEBUG] Tasks loaded:", projectTasks.length);

        if (sprint && 
            sprint.id === sprintId && 
            sprint.project_id === projectId) {
          console.log("🔍 [DEBUG] Using existing sprint from context:", sprint.id);
          console.log("🔍 [DEBUG] Sprint user stories:", sprint.user_stories?.length);
          
          if (!sprint.user_stories || sprint.user_stories.length === 0) {
            console.log("🔍 [DEBUG] Sprint exists but no user stories, loading them...");
            
            let stories: any[] = [];
            try {
              stories = await userStoryContext.loadUserStoriesIfNeeded(
                projectId,
                getProjectUserStories,
                30 * 60 * 1000        
              );
            } catch (err) {
              stories = await getProjectUserStories(projectId);
            }
            
            const mappedUserStories = stories.map(st => {
              const acceptance_criteria = normalizeAcceptanceCriteria(st);
              const structuredCriteria = ensureAcceptanceCriteriaStructure(acceptance_criteria);
              
              const relatedTaskIds = projectTasks
                .filter(t => t.user_story_id === st.uuid)
                .map(t => t.id);
                      
              return {
                id: st.uuid,
                userStory: { 
                  ...st, 
                  acceptance_criteria: structuredCriteria
                },
                selected: false,
                tasks: relatedTaskIds,
              };
            });
            
            // 🔥 ACTUALIZAR solo las user stories, manteniendo el resto del sprint
            setSprint({
              ...sprint,
              user_stories: mappedUserStories,
            });
            
            console.log("🔍 [DEBUG] User stories added to existing sprint");
          }
          
          setLoading(false);
          return;
        }

        console.log("🔍 [DEBUG] Sprint condition check:");
        console.log("🔍 [DEBUG] - sprintId exists?", !!sprintId);
        console.log("🔍 [DEBUG] - sprintId starts with temp?", sprintId.startsWith("temp-"));
        console.log("🔍 [DEBUG] - Context sprint matches?", sprint?.id === sprintId);

        if (sprintId && !sprintId.startsWith("temp-")) {
          console.log("🔍 [DEBUG] Loading existing sprint from API");
          const sprintRes = await fetch(`${API_URL}/projects/${projectId}/sprints/${sprintId}`);
          
          if (!sprintRes.ok) throw new Error("Sprint not found");
          const raw: Sprint = await sprintRes.json();

          const owner = await fetchProjectOwner(projectId); 
          console.log("🔍 [DEBUG] Owner found:", owner);
          console.log("🔍 [DEBUG] [SPRINT TEAM MEMBERS]", raw.team_members);

          if (!Array.isArray(raw.team_members)) {
            raw.team_members = [];
          }

          const enrichedMembers = await enrichMembersWithAvatars(raw.team_members);

          if (owner) {
            const existingMember = enrichedMembers.find(m => m.id === owner.id);
            if (!existingMember) {
              enrichedMembers.push(owner);
            }
          }

          let allProjectStories: any[] = [];
          try {
            allProjectStories = await userStoryContext.loadUserStoriesIfNeeded(
              projectId,
              getProjectUserStories,
              30 * 60 * 1000        
            );
          } catch (err) {
            allProjectStories = await getProjectUserStories(projectId);
          }
          
          console.log("🔍 [DEBUG] All project stories loaded for existing sprint:", allProjectStories.length);

          const sprintStoryMap = new Map();
          raw.user_stories.forEach(us => {
            sprintStoryMap.set(us.id, us);
          });

          const hydratedStories: SprintUserStory[] = allProjectStories.map((st) => {
            const existingSprintStory = sprintStoryMap.get(st.uuid);
            
            const acceptance_criteria = normalizeAcceptanceCriteria(st);
            const structuredCriteria = ensureAcceptanceCriteriaStructure(acceptance_criteria);
            
            const relatedTaskIds = projectTasks
              .filter(t => t.user_story_id === st.uuid)
              .map(t => t.id);

            return {
              id: st.uuid,
              userStory: { 
                ...st, 
                acceptance_criteria: structuredCriteria
              },
              selected: existingSprintStory ? !!existingSprintStory.selected : false,
              tasks: relatedTaskIds,
            } as SprintUserStory;
          });

          console.log("🔍 [DEBUG] Hydrated stories for existing sprint:", hydratedStories.length);

          setSprint({ 
            ...raw,  
            team_members: enrichedMembers,
            user_stories: hydratedStories
          });

        } else {
          // 🔥 FIX: Siempre crear un nuevo sprint cuando no hay sprintId o es temporal
          console.log("🔍 [DEBUG] Creating new sprint or loading user stories");
          const newSprint = await makeLocalSprint();
          console.log("🔍 [DEBUG] New sprint created:", newSprint.id);

          let stories: any[] = [];
          try {
            stories = await userStoryContext.loadUserStoriesIfNeeded(
              projectId,
              getProjectUserStories,
              30 * 60 * 1000        
            );
          } catch (err) {
            stories = await getProjectUserStories(projectId);
          }
          
          console.log("🔍 [DEBUG] User stories loaded:", stories.length);
          
          const mappedUserStories = stories.map(st => {
            const acceptance_criteria = normalizeAcceptanceCriteria(st);
            const structuredCriteria = ensureAcceptanceCriteriaStructure(acceptance_criteria);
            
            const relatedTaskIds = projectTasks
              .filter(t => t.user_story_id === st.uuid)
              .map(t => t.id);
                  
            return {
              id: st.uuid,
              userStory: { 
                ...st, 
                acceptance_criteria: structuredCriteria
              },
              selected: false,
              tasks: relatedTaskIds,
            };
          });
          
          console.log("🔍 [DEBUG] Mapped user stories:", mappedUserStories.length);
          
          // 🔥 FIX: Siempre establecer el nuevo sprint con user stories
          const finalSprint = {
            ...newSprint,
            user_stories: mappedUserStories,
          };
          
          console.log("🔍 [DEBUG] Setting new sprint:", finalSprint.id);
          setSprint(finalSprint);
          console.log("🔍 [DEBUG] Sprint updated with user stories");
        }

      } catch (e: any) {
        console.error("❌ [DEBUG] Error in load process:", e);
        setError(e.message);
      } finally {
        setLoading(false);
        console.log("🔍 [DEBUG] Load process finished");
      }
    };

    load();
  }, [projectId, sprintId]); // 🔥 FIX: Remover fetchAvatar de las dependencias


  const handleSaveSprint = async () => {
    if (!sprint) return

    // 1️⃣ Validar fechas antes de guardar (validación más estricta)
    const validation = await validateSprintDates(
      sprint.start_date,
      sprint.end_date,
      projectId,
      sprint.id
    )
    
    if (!validation.isValid) {
      setError(`Cannot save sprint: ${validation.message}`)
      return null
    }

    // Validación adicional para sprints temporales
    if (sprint.id.startsWith("temp-")) {
      const startDate = new Date(sprint.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        setError("Cannot create sprint with past start date. Please select today or a future date.");
        return null;
      }
    }

    // 2️⃣ Continuar con el resto de la lógica de guardado
    // 2️⃣ Actualizar tareas y luego guardar sprint
    try {
      const tasksToUpdate = tasks
        .filter(t =>
          sprint.user_stories.some(us => us.selected && us.tasks.includes(t.id))
        )
        .map(t => {
          // Extraer el assigneeId correctamente
          const assigneeId = Array.isArray(t.assignee_id) 
            ? t.assignee_id[0]?.[0] || t.assignee_id[0] // Si es [["id", "name"]] toma "id", si es ["id"] toma "id"
            : t.assignee_id;
            
          // Buscar el miembro usando el assigneeId extraído
          const member = sprint.team_members.find(m => m.id === assigneeId);
          
          console.log("Procesando tarea:", t.id, "assignee_id original:", t.assignee_id, "assigneeId extraído:", assigneeId, "member encontrado:", member);
          
          return {
            id: t.id,
            title: t.title || "",
            description: t.description || "",
            user_story_id: t.user_story_id || "",
            priority: t.priority || "Medium",
            status_khanban: t.status_khanban || "To Do",
            story_points: t.story_points ?? 0,
            // Incluir assignee si hay assigneeId y member
            ...(assigneeId && member
              ? { assignee: [[assigneeId, member.name]] }
              : {})
          };
        });

      console.log("[SPRINT PLANNING] Tareas a actualizar (payload):", tasksToUpdate);

      if (tasksToUpdate.length > 0) {
        const taskRes = await fetch(`${API_URL}/projects/${projectId}/tasks/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tasksToUpdate)
        });
        if (!taskRes.ok) {
          const taskErrorText = await taskRes.text();
          console.error("Error updating tasks:", taskErrorText);
          throw new Error(`Tasks update failed: ${taskRes.status} - ${taskErrorText}`);
        }
        const updatedFromServer: Task[] = await taskRes.json();
        updatedFromServer.forEach(u => {
          taskContext.updateTaskInProject(projectId, u.id, u);
        });
        console.log("[SPRINT PLANNING] Respuesta del backend (tareas actualizadas):", updatedFromServer);
        // console.log("Tasks updated before saving sprint");
      }
    } catch (err) {
      console.error("Error updating tasks before saving sprint:", err);
      // Puedes decidir si quieres continuar o abortar el guardado del sprint
    }

    // 2️⃣ Guardar el sprint como antes
    // Primero, calcular los assignees únicos por user story
    const userStoriesWithAssignees = sprint.user_stories
      .filter((us) => us.selected)
      .map((us) => {
        const rawCriteria = normalizeAcceptanceCriteria(us.userStory);
        const structuredCriteria = ensureAcceptanceCriteriaStructure(rawCriteria);

        // Obtener todas las tareas de esta user story
        const storyTasks = tasks.filter(t => 
          us.tasks.includes(t.id) && t.assignee && t.assignee.length > 0
        );

        // Extraer assignees únicos de las tareas
        const uniqueAssignees = new Map<string, [string, string]>();
        storyTasks.forEach(task => {
          if (task.assignee && Array.isArray(task.assignee)) {
            task.assignee.forEach(assignee => {
              if (assignee.users && assignee.users[0]) {
                uniqueAssignees.set(assignee.users[0], assignee.users);
              }
            });
          }
        });

        // Convertir a formato del backend para user stories
        const assigneeList = Array.from(uniqueAssignees.values()).map(users => ({
          users: users
        }));

        return {
          id: us.id,
          title: us.userStory?.title || "Sin título",
          description: us.userStory?.description || "Sin descripción",
          acceptance_criteria: structuredCriteria,
          tasks: us.tasks || [],
          selected: us.selected,
          assignee: assigneeList.length > 0 ? assigneeList : undefined
        };
      });

    const payload = {
      name: sprint.name,
      start_date: new Date(sprint.start_date),
      end_date: new Date(sprint.end_date),
      duration_weeks: sprint.duration_weeks,
      status: sprint.status,
      team_members: (sprint.team_members || []).map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar || null,
        capacity: member.capacity,
        allocated: member.allocated
      })),
      user_stories: userStoriesWithAssignees
    };

    setLoading(true);

    try {
      const isTempSprint = sprintId.startsWith("temp-");

      const url = isTempSprint
        ? `${API_URL}/projects/${projectId}/sprints`
        : `${API_URL}/projects/${projectId}/sprints/${sprintId}`;

      const method = isTempSprint ? "POST" : "PATCH";

      // console.log("Guardando sprint con assignees:", sprintId, payload);
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response:", errorText);
        throw new Error(`Save failed: ${res.status} - ${errorText}`);
      }

      const saved: Sprint = await res.json();

      setSprint(saved);
      
      router.push(`/dashboard?projectId=${projectId}`);
      return saved;

    } catch (e: any) {
      console.error("Error saving sprint:", e);
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };


  // Funciones auxiliares para la UI
  const handleSprintUpdate = (updates: Partial<Sprint>) => {
    if (!sprint) return;
    setSprint({ ...sprint, ...updates });
  };

  const handleToggleUserStory = (id: string) => {
    if (!sprint) return;
    setSprint({
      ...sprint,
      user_stories: sprint.user_stories.map(us =>
        us.id === id ? { ...us, selected: !us.selected } : us
      ),
    });
  };

  const handleTeamMemberAdd = async (member: SprintMember) => {
    if (!sprint) return;
    
    // FIX: Asegurar que team_members existe antes de usar some
    const currentMembers = sprint.team_members || [];
    if (currentMembers.some(mem => mem.id === member.id)) return;

    console.log("Adding team member:", member);
    const enrichedMember = await enrichMemberWithAvatar(member, fetchAvatar);
    
    setSprint({
      ...sprint,
      team_members: [...currentMembers, enrichedMember],
    });
  };

  const handleTeamMemberUpdate = (id: string, data: Partial<SprintMember>) => {
    if (!sprint) return;
    
    // FIX: Asegurar que team_members existe
    const currentMembers = sprint.team_members || [];
    setSprint({
      ...sprint,
      team_members: currentMembers.map(mem =>
        mem.id === id ? { ...mem, ...data } : mem
      ),
    });
  };

  const handleTeamMemberRemove = (id: string) => {
    if (!sprint) return;
    
    // FIX: Asegurar que team_members existe y es un array
    const currentMembers = sprint.team_members || [];
    if (currentMembers.length === 0) return;
    
    // No permitir eliminar al owner (primer miembro)
    if (id === currentMembers[0]?.id) return;
    
    setSprint({
      ...sprint,
      team_members: currentMembers.filter(mem => mem.id !== id),
    });
  };

  const toggleSidebar = () => setOpenSB(!openSB);

  return {
    // Estados
    loading,
    error,
    sprint,
    projectId,
    sprintId,
    openSB,
    user_stories,
    ownerId: sprint?.team_members && sprint.team_members.length > 0 ? sprint.team_members[0]?.id : undefined,
    
    handleSaveSprint,
    handleSprintUpdate,
    handleToggleUserStory,
    handleTeamMemberAdd,
    handleTeamMemberUpdate,
    handleTeamMemberRemove,
    toggleSidebar,
  };
}