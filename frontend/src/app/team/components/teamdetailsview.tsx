"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTeams } from "@/contexts/teamscontext";
import { useProjectUsers } from "@/contexts/ProjectusersContext";
import TeamAvatarsDisplay from "./TeamAvatarDisplay";

type TeamDetailsViewProps = {
  teamId: string;
};

const TeamDetailsView = ({ teamId }: TeamDetailsViewProps) => {
  const router = useRouter();
  const { currentTeam, fetchTeam, teamMetrics, getTeamMetrics } = useTeams();
  const projectId = localStorage.getItem("currentProjectId");
  const { loadUsersIfNeeded } = useProjectUsers();
  
  // Estados para controlar la carga de datos
  const [dataLoaded, setDataLoaded] = useState({
    team: false,
    metrics: false,
    users: false
  });

  // Memoizar la función de carga para evitar recreaciones
  const loadData = useCallback(async () => {
    if (!teamId || !projectId) return;
    
    try {
      // Comprobamos si necesitamos cargar cada tipo de dato
      if (!dataLoaded.team) {
        await fetchTeam(teamId, projectId);
        setDataLoaded(prev => ({ ...prev, team: true }));
      }
      
      if (!dataLoaded.metrics) {
        await getTeamMetrics(teamId, projectId);
        setDataLoaded(prev => ({ ...prev, metrics: true }));
      }
      
      if (!dataLoaded.users) {
        await loadUsersIfNeeded(projectId);
        setDataLoaded(prev => ({ ...prev, users: true }));
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  }, [teamId, projectId, fetchTeam, getTeamMetrics, loadUsersIfNeeded, dataLoaded]);

  // Un solo useEffect que controla toda la carga de datos
  useEffect(() => {
    loadData();
  }, [teamId, projectId]);

  const handleGoBack = () => {
    router.push(`/team?projectId=${projectId}`);
  };

  if (!currentTeam) {
    return (
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
            <p className="ml-3 text-lg text-[#4a2b4a]">Loading team details...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#1e1e1e]">Team - {currentTeam.name}</h1>
        <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
          {currentTeam.description}
        </p>
        <button
          onClick={handleGoBack}
          className="text-[#4A2B4A] text-sm font-medium hover:underline mt-1 mb-6 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go back to teams
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Display con el mismo estilo de contenedor que las métricas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md h-full"> {/* Mismo estilo de contenedor, altura completa */}
              {dataLoaded.users ? (
                <TeamAvatarsDisplay
                  teamId={teamId}
                  teamMembers={currentTeam.members}
                  projectId={projectId || ""}
                  preloadedUsers={true}
                />
              ) : (
                <div className="flex flex-col justify-center items-center h-full py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
                  <p className="mt-4 text-lg text-[#4a2b4a]">Loading team members...</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Team Metrics Section - Mejorado visualmente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              {/* Header con título más prominente */}
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 rounded-full bg-[#4a2b4a]/10 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0H3v-6a6 6 0 0112 0v6zm0 0h6v-6a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#4a2b4a]">Team Metrics</h2>
              </div>
              
              {/* Team Velocity - Barra más alta y números más grandes */}
              <div className="mb-7">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Team Velocity</span>
                  <span className="text-lg font-bold text-[#4a2b4a]">{teamMetrics?.velocity} SP/Sprint</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#4a2b4a] h-3 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(100, (teamMetrics?.velocity || 0) * 2)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Team Mood - Emoji más grande y destacado */}
              <div className="mb-7">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Team Mood</span>
                  <span className="text-2xl">
                    {teamMetrics?.mood && teamMetrics.mood > 70 ? '😊' : teamMetrics?.mood && teamMetrics.mood > 40 ? '😐' : '😞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#4a2b4a] h-3 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${teamMetrics?.mood || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Tasks Overview - Más espacio y números destacados */}
              <div className="bg-[#4a2b4a] text-white rounded-lg p-5 mb-7">
                <h3 className="text-base font-bold mb-4">Tasks Overview</h3>
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Completed</div>
                    <div className="text-2xl font-bold">{teamMetrics?.tasksCompleted}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90 mb-1">In Progress</div>
                    <div className="text-2xl font-bold">{teamMetrics?.tasksInProgress}%</div>
                  </div>
                </div>
              </div>
              
              {/* Avg Story Time - Iconos más grandes y datos destacados */}
              <div className="flex justify-between items-center mb-7">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBE5EB] flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Avg. Story Time</span>
                </div>
                <span className="text-lg font-bold text-[#4a2b4a]">{teamMetrics?.avgStoryTime} days</span>
              </div>
              
              {/* Sprint Progress - Estilo coherente con el ítem anterior */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBE5EB] flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Sprint Progress</span>
                </div>
                <span className="text-lg font-bold text-[#4a2b4a]">{teamMetrics?.sprintProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TeamDetailsView;