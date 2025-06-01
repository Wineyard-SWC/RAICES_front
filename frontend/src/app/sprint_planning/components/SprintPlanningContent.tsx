"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import SprintConfiguration from "./SprintConfiguration";
import TeamMembersSection from "./TeamMembersSection";
import ProductBacklog from "./ProductBacklog";
import SprintSidebar from "./SprintSidebar";
import DefaultLoading from "@/components/animations/DefaultLoading";
import { useSprintPlanningLogic } from "../hooks/useSprintPlanningLogic";
import { useTasks } from "@/contexts/taskcontext";

export default function SprintPlanningContent() {
  const router = useRouter();
  
  const {
    loading,
    error,
    sprint,
    projectId,
    openSB,
    ownerId,
    handleSaveSprint,
    handleSprintUpdate,
    handleToggleUserStory,
    handleTeamMemberAdd,
    handleTeamMemberUpdate,
    handleTeamMemberRemove,
    toggleSidebar,
  } = useSprintPlanningLogic();

  const { getTasksForProject } = useTasks();

  const currenttasks = getTasksForProject(projectId!);

  console.log("Sprint actual:", sprint);
  console.log("Tareas actuales:", currenttasks);

  if (loading) return <DefaultLoading text="sprint" />;
  
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
        <main className="flex-1 container px-25 mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold">Sprint Planning</h1>
          <p className="text-[#694969] mt-2">
            Plan for <strong>{sprint.name}</strong>
          </p>
          <button
            onClick={() => router.push(`/gen_tasks?projectId=${projectId}`)}
            className="text-[#4A2B4A] text-sm font-medium hover:underline mt-2 mb-6"
          >
            {"<- Go back "}
          </button>

          {/* Configuración del Sprint */}
          <SprintConfiguration
            sprint={sprint}
            onUpdate={handleSprintUpdate}
          />

          {/* Sección de miembros del equipo */}
          <TeamMembersSection
            members={sprint.team_members || []}
            ownerId={ownerId}
            projectId={projectId}
            onAdd={handleTeamMemberAdd}
            onUpdate={handleTeamMemberUpdate}
            onRemove={handleTeamMemberRemove}
          />
          {/* Backlog del producto */}
          <div className="mt-6">
            <ProductBacklog
              tasks={currenttasks!}
              userStories={sprint.user_stories || []}
              onToggleUserStory={handleToggleUserStory}
            />
          </div>
        </main>

        {/* Sidebar del sprint */}
        <SprintSidebar
          tasks={currenttasks!}
          sprint={sprint}
          isOpen={openSB}
          onToggle={toggleSidebar}
          onSave={handleSaveSprint}
        />
      </div>
    </div>
  );
}