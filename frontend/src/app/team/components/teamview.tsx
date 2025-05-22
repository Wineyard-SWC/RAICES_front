"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTeams } from "@/contexts/teamscontext";
import { CreateTeamModal } from "./CreateTeamModal";
import { EditTeamModal } from "./EditTeamModal";
import { DeleteTeamModal } from "./DeleteTeamModal";
// Importar el hook de permisos
import { useUserPermissions } from "@/contexts/UserPermissions";
import { useUser } from "@/contexts/usercontext";

type TabState = {
  [key: string]: string;
};

// Definir constantes de permisos
const PERMISSIONS = {
  TEAM_MANAGE: 1 << 8, // Bit 8 para Team Management
};

const TeamsView = () => {
  const router = useRouter();
  const { teams, loading, error, fetchTeams, deleteTeam } = useTeams();
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeams, setFilteredTeams] = useState(teams);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null); 
  const projectId = localStorage.getItem("currentProjectId");
  
  // Añadir contexto de usuario y permisos
  const { userId } = useUser();
  const { hasPermission, loadUserPermissionsIfNeeded } = useUserPermissions();
  
  // Verificar si el usuario tiene permiso para gestionar equipos
  const canManageTeams = hasPermission(PERMISSIONS.TEAM_MANAGE);
  
  // Cargar permisos al iniciar
  useEffect(() => {
    if (userId) {
      loadUserPermissionsIfNeeded(userId);
    }
  }, [userId, loadUserPermissionsIfNeeded]);

  // Initialize tabs
  useEffect(() => {
    const initialTabs: TabState = {};
    teams.forEach(team => {
      initialTabs[team.id] = "overview";
    });
    setActiveTab(initialTabs);
  }, [teams]);

  // Fetch teams on mount
  useEffect(() => {
    if (projectId) {
      fetchTeams(projectId);
    }
  }, [projectId]);

  // Filter teams based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  const navigateToTeamDetails = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };

  const toggleTab = (teamId: string, tab: string) => {
    setActiveTab(prev => ({
      ...prev,
      [teamId]: tab
    }));
  };

  // Modificar la función para abrir el modal considerando permisos
  const handleCreateTeam = () => {
    if (canManageTeams) {
      setIsCreateModalOpen(true);
    } else {
      // Opcional: mostrar un mensaje de que no tiene permiso
      console.log("No tienes permiso para gestionar equipos");
    }
  };

  // Modificar las funciones de editar y eliminar considerando permisos
  const handleEditTeam = (team: any) => {
    if (canManageTeams) {
      setSelectedTeam(team);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteTeam = (team: any) => {
    if (canManageTeams) {
      setSelectedTeam(team);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedTeam && projectId) {
      await deleteTeam(selectedTeam.id, projectId);
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
    }
  };

  if (loading && teams.length === 0) {
    return (
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          <p>Loading teams...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </main>
    );
  }

  if (!loading && filteredTeams.length === 0) {
    return (
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text[1e1e1e]">Teams</h1>
          <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
            Manage your teams and track their current contribution
          </p>
          
          {/* Mensaje de no hay equipos */}
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-lg shadow-md mt-8">
            <div className="text-center max-w-md">
              <svg 
                className="mx-auto h-20 w-20 text-[#C7A0B8] mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <h3 className="text-2xl font-bold text-[#4A2B4A] mb-2">No teams found</h3>
              <p className="text-gray-600 mb-6">
                You don't have any teams in this project yet. Create a new team to start collaborating with your colleagues.
              </p>
              <button 
                className="px-6 py-3 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] transition-colors"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create First Team
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mantenemos el modal de creación disponible */}
        <CreateTeamModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          projectId={projectId || ""} 
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text[1e1e1e]">Teams</h1>
        <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
          {canManageTeams 
            ? "Manage your teams and track their current contribution"
            : "View teams and track their current contribution"
          }
        </p>

        {/* Search and Create Team Section - Botón condicional */}
        <div className="flex justify-between items-center mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] focus:border-transparent"
              placeholder="Search team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botón Create Team - Solo visible con permisos */}
          {canManageTeams && (
            <button 
              className="flex items-center px-4 py-2 bg-[#4a2b4a] text-white rounded-md"
              onClick={handleCreateTeam}
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Team
            </button>
          )}
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {filteredTeams.map((team) => (
            <div 
              key={team.id}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigateToTeamDetails(team.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team - {team.name}</h2>
                
                {/* Botones de editar/borrar - Solo visibles con permisos */}
                {canManageTeams && (
                  <div className="flex space-x-2">
                    <button 
                      className="text-gray-500 hover:text-[#4a2b4a]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTeam(team);
                      }}
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      className="text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team);
                      }}
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Tabs */}
              <div className="flex border-b mb-4">
                <button 
                  className={`py-2 px-4 ${activeTab[team.id] === 'overview' ? 'border-b-2 border-[#4a2b4a] font-medium' : 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTab(team.id, 'overview');
                  }}
                >
                  Overview
                </button>
                <button 
                  className={`py-2 px-4 ${activeTab[team.id] === 'members' ? 'border-b-2 border-[#4a2b4a] font-medium' : 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTab(team.id, 'members');
                  }}
                >
                  Members
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab[team.id] === 'overview' && (
                <>
                  <p className="text-sm text-gray-600 mb-6">{team.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                        <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold">{team.members.length}</span>
                      <span className="text-xs text-gray-500">Members</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                        <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold">
                        {team.members.reduce((sum, member) => sum + member.tasksCompleted, 0)}
                      </span>
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                        <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold">
                        {team.members.reduce((sum, member) => sum + member.currentTasks, 0)}
                      </span>
                      <span className="text-xs text-gray-500">Upcoming</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab[team.id] === 'members' && (
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="bg-gray-50 rounded-md p-4">
                      <div className="flex items-center">
                        <div className="relative w-10 h-10 mr-3">
                          <div className="w-10 h-10 bg-[#ebe5eb] rounded-full flex items-center justify-center text-[#4a2b4a] font-bold">
                            {member.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{member.tasksCompleted} tasks completed</span>
                            <span className="mx-2">•</span>
                            <span>{member.currentTasks} current tasks</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-block px-2 py-1 rounded-full text-xs font-medium" 
                            style={{ 
                              backgroundColor: member.availability >= 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                              color: member.availability >= 80 ? 'rgb(22, 163, 74)' : 'rgb(202, 138, 4)'
                            }}>
                            {member.availability}% available
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals - No cambiar, solo ajustar su apertura condicional como ya hicimos */}
      <CreateTeamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId || ""} 
      />
      
      {selectedTeam && (
        <>
          <EditTeamModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTeam(null);
            }}
            team={{
              ...selectedTeam,
              projectId: projectId || ""
            }}
          />
          
          <DeleteTeamModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedTeam(null);
            }}
            onConfirm={confirmDelete}
            teamName={selectedTeam.name}
          />
        </>
      )}
    </main>
  );
};

export default TeamsView;