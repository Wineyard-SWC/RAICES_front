"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar              from "@/components/NavBar";

import SprintConfiguration from "./components/SprintConfiguration";
import TeamMembersSection  from "./components/TeamMembersSection";
import ProductBacklog      from "./components/ProductBacklog";
import SprintSidebar       from "./components/SprintSidebar";

import { useSprintContext }   from "@/contexts/sprintcontext";
import type { Sprint, SprintMember } from "@/types/sprint";
import { buildSprintPayload } from "@/utils/buildSprintPayload";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { getProjectTasks       } from "@/utils/getProjectTasks";
import { Task } from "@/types/task";

import DefaultLoading from "@/components/animations/DefaultLoading";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* helper: dueño/primer usuario del proyecto */
async function fetchProjectOwner(projectId: string): Promise<SprintMember|null> {
  const res = await fetch(`${API_URL}/project_users/project/${projectId}`);
  if (!res.ok) return null;
  const list = await res.json();      // [{ id,name,email,role,avatar }]
  if (!Array.isArray(list) || list.length === 0) return null;

  const raw = list.find((u:any) => (u.role || "").toLowerCase()==="owner") || list[0];
  return {
    id:        raw.id,
    name:      raw.name  || raw.email || "Owner",
    role:      raw.role  || "Owner",
    avatar:    raw.avatar,
    capacity:  0,
    allocated: 0,
  };
}

export default function SprintPlanningPage() {
  /* routing */
  const router    = useRouter();
  const params    = useSearchParams();
  const projectId = params.get("projectId") || "";
  const sprintId  = params.get("sprintId")  || "";

  /* sprint context */
  const { sprint, tasks, setSprint, setTasks } = useSprintContext();

  /* ui */
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string|null>(null);
  const [openSB,  setOpenSB]    = useState(true);

  /* ---- crea sprint local vacío + owner ---- */
  const makeLocalSprint = async (): Promise<Sprint> => {
    const now   = new Date().toISOString();
    const in2w  = new Date(Date.now()+14*24*60*60*1000).toISOString();
    const owner = await fetchProjectOwner(projectId);
    return {
      id:            `temp-${Date.now()}`,
      name:          `Sprint ${new Date().getMonth()+1}`,
      project_id:    projectId,
      start_date:    now,
      end_date:      in2w,
      duration_weeks: 2,
      status:        "planning",
      team_members:  owner ? [owner] : [],
      user_stories:  [],
      created_at:    now,
      updated_at:    now,
    };
  };

  /* 1️⃣  carga sprint existente o crea uno local */
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        setLoading(true);
    
        /* ----- 1. Trae sprint REAL + todas las tasks del proyecto ----- */
        if (sprintId) {
          /* se pueden pedir en paralelo */
          const [sprintRes, projectTasks] = await Promise.all([
            fetch(`${API_URL}/projects/${projectId}/sprints/${sprintId}`),
            getProjectTasks(projectId),                          //  util que ya tienes
          ]);
    
          if (!sprintRes.ok) throw new Error("Sprint not found");
          const raw: Sprint = await sprintRes.json();            // ← stories.tasks = string[]
    
          /* ----- 2. mete al owner si aún no viene ----- */
          const owner = await fetchProjectOwner(projectId);
          if (owner && !raw.team_members.some(m => m.id === owner.id)) {
            raw.team_members.push(owner);
          }
    
          /* ----- 3. re-hidrata cada id → objeto Task ----- */
          const hydratedStories = raw.user_stories.map(us => {
            const fullTasks = us.tasks                      // string[]
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

    
          /* ----- 4. guarda en contexto global ----- */
          setTasks(projectTasks);                          // todas las tasks del proyecto
          setSprint({ ...raw, user_stories: hydratedStories });
        }
    
        /* ----- sprint NUEVO en memoria ----- */
        else if (!sprint) {
          setSprint(await makeLocalSprint());
        }
    
      } catch (e:any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, sprintId]);

  /* 2️⃣  backlog para sprint local */
  useEffect(() => {
    if (!projectId || !sprint) return;
    if (sprintId) return;
    if (sprint.user_stories.length) return;

    const fill = async () => {
      setLoading(true);
      try {
        const stories = await getProjectUserStories(projectId);
        const allTasks = await getProjectTasks(projectId);
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
      } catch (e:any) { setError(e.message); }
      finally { setLoading(false); }
    };
    fill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, sprint]);

  /* ------------ save sprint ------------- */
  // SprintPlanningPage.tsx → handleSaveSprint
  const handleSaveSprint = async () => {
    if (!sprint) return;
  
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
      // 1) Construye la URL correctamente
      const url = sprintId
        ? `${API_URL}/projects/${projectId}/sprints/${sprintId}`
        : `${API_URL}/projects/${projectId}/sprints`;
  
      const res = await fetch(url, {
        method: sprintId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      console.log("this is payload", payload);
      console.log("res", res);
  
      if (!res.ok) throw new Error("Save failed");
      const saved: Sprint = await res.json();
      setSprint(saved);
  
      // 2) Prepara tareas para batch‐upsert
      // Ojo: aquí también debes incluir `status_khanban`
      const tasksToUpsert = tasks
        .filter((t) => t.sprint_id === saved.id)
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          user_story_id: t.user_story_id,
          assignee: t.assignee,
          sprint_id: t.sprint_id,
          status_khanban: t.status,   // ← necesario para que Pydantic lo reciba
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
  
      // 3) Finalmente navega con backticks
      router.push(`/dashboard?projectId=${projectId}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  /* ui */
  if (loading) return <DefaultLoading text="sprint" />
  if (error || !sprint) return (
    <>
      <Navbar projectSelected />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected />
      <div className="flex gap-4">
        <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Sprint Planning</h1>
        <p className="text-[#694969] mt-2 mb-6">
            Plan for <strong>{sprint.name}</strong>
          </p>

          <SprintConfiguration
            sprint={sprint}
            onUpdate={u => setSprint({ ...sprint, ...u })}
          />

          <TeamMembersSection
            members={sprint.team_members}
            ownerId={sprint.team_members[0]?.id}  
            projectId={projectId}
            onAdd={m => {
              if (sprint.team_members.some(mem => mem.id === m.id)) return;
              setSprint({ ...sprint, team_members:[...sprint.team_members, m]});
            }}
            onUpdate={(id,d)=>
              setSprint({
                ...sprint,
                team_members: sprint.team_members.map(mem =>
                  mem.id===id ? { ...mem, ...d } : mem),
              })}
            onRemove={id => {
              if (id === sprint.team_members[0]?.id) return; // lock owner
              setSprint({
                ...sprint,
                team_members: sprint.team_members.filter(mem=>mem.id!==id),
              });
            }}
          />

          <div className="mt-6">
            <ProductBacklog
              userStories={sprint.user_stories}
              onToggleUserStory={id =>
                setSprint({
                  ...sprint,
                  user_stories: sprint.user_stories.map(us =>
                    us.id===id ? { ...us, selected:!us.selected } : us),
                })}
            />
          </div>
        </main>

        <SprintSidebar
          sprint={sprint}
          isOpen={openSB}
          onToggle={() => setOpenSB(!openSB)}
          onSave={handleSaveSprint}
        />
      </div>
    </div>
  );

}
