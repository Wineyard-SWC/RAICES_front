"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTeams } from "@/contexts/teamscontext";
import { CreateTeamModal } from "./CreateTeamModal";
import { EditTeamModal } from "./EditTeamModal";
import { DeleteTeamModal } from "./DeleteTeamModal";
import { useUserPermissions } from "@/contexts/UserPermissions";
import { useUser } from "@/contexts/usercontext";
import { useProjectUsers, ProjectUser } from "@/contexts/ProjectusersContext";
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay";
import { printError } from "@/utils/debugLogger";

type TabState = {
  [key: string]: string;
};

// Definir constantes de permisos
const PERMISSIONS = {
  TEAM_MANAGE: 1 << 8, // Bit 8 para Team Management
};

const TeamsView = () => {
  const router = useRouter();
  const { teams, loading, error, fetchTeams, deleteTeam, createTeam } = useTeams();
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeams, setFilteredTeams] = useState(teams);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const projectId = localStorage.getItem("currentProjectId");

  const isTabsInitialized = useRef(false);

  const { userId } = useUser();
  const { hasPermission, loadUserPermissionsIfNeeded } = useUserPermissions();
  const { loadUsersIfNeeded, getUsersForProject, isLoading: isLoadingUsers } = useProjectUsers();
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const canManageTeams = hasPermission(PERMISSIONS.TEAM_MANAGE);

  const [initialTeamCreated, setInitialTeamCreated] = useState(false);

  // Cargar permisos al iniciar
  useEffect(() => {
    if (userId) {
      loadUserPermissionsIfNeeded(userId);
    }
  }, [userId, loadUserPermissionsIfNeeded]);

  // Cargar usuarios del proyecto
  useEffect(() => {
    if (projectId) {
      loadUsersIfNeeded(projectId)
        .then((users) => {
          setProjectUsers(users);
        })
        .catch((err) => printError("Error cargando usuarios del proyecto:", err));
    }
  }, [projectId, loadUsersIfNeeded]);

  // Initialize tabs
  useEffect(() => {
    if (!isTabsInitialized.current && teams.length > 0) {
      const initialTabs: TabState = {};
      teams.forEach((team) => {
        initialTabs[team.id] = "overview";
      });
      // console.log("[TEAM VIEW] Initializing tabs:", initialTabs);
      setActiveTab(initialTabs);
      isTabsInitialized.current = true;
    }
  }, [teams]);

  // Fetch teams on mount
  useEffect(() => {
    if (projectId) {
      fetchTeams(projectId).then((fetchedTeams) => {
        const sortedTeams = [...fetchedTeams].sort((a, b) => {
          if (a.isInitial) return -1; // El equipo inicial siempre primero
          if (b.isInitial) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setFilteredTeams(sortedTeams);
      });
    }
  }, [projectId, initialTeamCreated, fetchTeams]);

  // Filter teams based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      const sortedTeams = [...teams].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setFilteredTeams(sortedTeams);
    } else {
      const filtered = teams.filter((team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  // Función para obtener la información completa de un usuario por su ID
  const getEnrichedMemberData = (member) => {
    const projectUser = projectUsers.find(
      (u) =>
        u.userRef === member.id || u.name.toLowerCase() === member.name.toLowerCase()
    );

    if (projectUser) {
      return {
        ...member,
        avatarUrl: projectUser.avatarUrl,
        gender: projectUser.gender,
      };
    }

    return member;
  };

  const navigateToTeamDetails = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };

  const toggleTab = (teamId: string, tab: string) => {
    // console.log(`[TEAM VIEW] Toggling tab for team ${teamId}: ${tab}`);
    setActiveTab((prev) => ({
      ...prev,
      [teamId]: tab,
    }));
  };

  const handleCreateTeam = () => {
    if (canManageTeams) {
      setIsCreateModalOpen(true);
    } else {
      console.log("No tienes permiso para gestionar equipos");
    }
  };

  const handleEditTeam = (team: any) => {
    if (team.isInitial) {
      // console.log("The initial team cannot be edited.");
      return;
    }

    if (canManageTeams) {
      setSelectedTeam(team);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteTeam = (team: any) => {
    if (team.isInitial) {
      // console.log("The initial team cannot be deleted.");
      return;
    }

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

  useEffect(() => {
    const sortedTeams = [...teams].sort((a, b) => {
      if (a.isInitial) return -1; // El equipo inicial siempre primero
      if (b.isInitial) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredTeams(sortedTeams);
  }, [teams]);

  useEffect(() => {
    const checkAndCreateInitialTeam = async () => {
      if (projectId && projectUsers.length > 0 && !initialTeamCreated) {
        // Consultar al backend si ya existe un equipo inicial
        const fetchedTeams = await fetchTeams(projectId);
        const initialTeamExists = fetchedTeams.some((team) => team.isInitial === true);
        // console.log("[TEAM VIEW] Initial team exists:", initialTeamExists);

        if (!initialTeamExists) {
          const initialTeam = {
            name: "Project Team",
            description: "This is the main team for the project, containing all members.",
            projectId,
            isInitial: true,
          };

          const members = projectUsers.map((user) => user.userRef);

          try {
            // console.log("[TEAM VIEW] Creating initial team...");
            await createTeam(initialTeam, members);
            // console.log("[TEAM VIEW] Initial team created successfully");
            setInitialTeamCreated(true);
          } catch (err) {
            printError("Error creating initial team:", err);
          }
        } else {
          // console.log("[TEAM VIEW] Initial team already exists");
          setInitialTeamCreated(true);
        }
      }
    };

    checkAndCreateInitialTeam();
  }, [projectId, projectUsers, initialTeamCreated, fetchTeams, createTeam]);

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
                  <svg
                    className="w-5 h-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create First Team
                </div>
              </button>
            </div>
          </div>
        </div>
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
            : "View teams and track their current contribution"}
        </p>
        <div className="flex justify-between items-center mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
          {canManageTeams && (
            <button
              className="flex items-center px-4 py-2 bg-[#4a2b4a] text-white rounded-md"
              onClick={handleCreateTeam}
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Team
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                team.isInitial ? "border-2 border-[#4a2b4a]" : ""
              }`}
              onClick={() => navigateToTeamDetails(team.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Team - {team.name}
                </h2>
                {canManageTeams && !team.isInitial && (
                  <div className="flex space-x-2">
                    <button
                      className="text-gray-500 hover:text-[#4a2b4a]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTeam(team);
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team);
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex border-b mb-4">
                <button
                  className={`py-2 px-4 ${
                    activeTab[team.id] === "overview"
                      ? "border-b-2 border-[#4a2b4a] font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTab(team.id, "overview");
                  }}
                >
                  Overview
                </button>
                <button
                  className={`py-2 px-4 ${
                    activeTab[team.id] === "members"
                      ? "border-b-2 border-[#4a2b4a] font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTab(team.id, "members");
                  }}
                >
                  Members
                </button>
              </div>
              {(activeTab[team.id] === "overview" || !activeTab[team.id]) && (
                <>
                  <p className="text-sm text-gray-600 mb-6">{team.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                        <svg
                          className="w-6 h-6 text-[#4a2b4a]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold">{team.members.length}</span>
                      <span className="text-xs text-gray-500">Members</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                        <svg
                          className="w-6 h-6 text-[#4a2b4a]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold">
                        {team.members.reduce(
                          (sum, member) => sum + member.tasksCompleted,
                          0
                        )}
                      </span>
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                        <svg
                          className="w-6 h-6 text-[#4a2b4a]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold">
                        {team.members.reduce(
                          (sum, member) => sum + member.currentTasks,
                          0
                        )}
                      </span>
                      <span className="text-xs text-gray-500">Upcoming</span>
                    </div>
                  </div>
                </>
              )}
              {activeTab[team.id] === "members" && (
                <div className="space-y-4">
                  {team.members.map((member) => {
                    const enrichedMember = getEnrichedMemberData(member);
                    return (
                      <div key={member.id} className="bg-gray-50 rounded-md p-4">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 mr-3">
                            {enrichedMember.avatarUrl ? (
                              <AvatarProfileIcon
                                avatarUrl={enrichedMember.avatarUrl}
                                size={40}
                                borderWidth={2}
                                borderColor="#C7A0B8"
                                backgroundColor="#ebe5eb"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#ebe5eb] rounded-full flex items-center justify-center text-[#4a2b4a] font-bold">
                                {member.name.charAt(0)}
                              </div>
                            )}
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
                            <div
                              className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  member.availability >= 80
                                    ? "rgba(34, 197, 94, 0.1)"
                                    : "rgba(234, 179, 8, 0.1)",
                                color:
                                  member.availability >= 80
                                    ? "rgb(22, 163, 74)"
                                    : "rgb(202, 138, 4)",
                              }}
                            >
                              {member.availability}% available
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
              projectId: projectId || "",
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