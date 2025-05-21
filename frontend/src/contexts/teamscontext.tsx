"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  tasksCompleted: number;
  currentTasks: number;
  availability: number;
};

type Team = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
};

type TeamMetrics = {
  velocity: number;
  mood: number;
  tasksCompleted: number;
  tasksInProgress: number;
  avgStoryTime: number;
  sprintProgress: number;
};

type TeamsContextType = {
  teams: Team[];
  currentTeam: Team | null;
  teamMetrics: TeamMetrics | null;
  loading: boolean;
  error: string | null;
  fetchTeams: (projectId: string) => Promise<void>;
  fetchTeam: (teamId: string, projectId: string) => Promise<void>;
  getTeamMetrics: (teamId: string, projectId: string) => Promise<void>;
  createTeam: (team: { name: string; description: string; projectId: string }, members: string[]) => Promise<void>;
  updateTeam: (teamId: string, team: { name?: string; description?: string; members?: string[] }, projectId: string) => Promise<void>;
  deleteTeam: (teamId: string, projectId: string) => Promise<void>;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider = ({ children }: { children: React.ReactNode }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const apiURL = process.env.NEXT_PUBLIC_API_URL || ""

    const fetchTeams = async (projectId: string) => {
        setLoading(true);
        setError(null);
        try {
        const response = await fetch(`${apiURL}/projects/${projectId}/teams`);
        if (!response.ok) {
            throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        setTeams(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
        setLoading(false);
        }
    };

    const fetchTeam = async (teamId: string, projectId: string) => {
        setLoading(true);
        setError(null);
        try {
        const response = await fetch(`${apiURL}/projects/${projectId}/teams/${teamId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch team");
        }
        const data = await response.json();
        setCurrentTeam(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
        setLoading(false);
        }
    };

    const getTeamMetrics = async (teamId: string, projectId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/projects/${projectId}/teams/${teamId}/metrics`);
            if (!response.ok) {
                throw new Error("Failed to fetch team metrics");
            }
            const metrics = await response.json();
            console.log('Métricas recibidas:', {
                rawResponse: metrics,
                parsedMetrics: {
                    velocity: metrics.velocity,
                    mood: metrics.mood,
                    tasksCompleted: metrics.tasks_completed, // Nota el snake_case
                    tasksInProgress: metrics.tasks_in_progress,
                    avgStoryTime: metrics.avg_story_time,
                    sprintProgress: metrics.sprint_progress
                }
            });
            
            setTeamMetrics({
                velocity: metrics.velocity,
                mood: metrics.mood,
                tasksCompleted: metrics.tasks_completed,
                tasksInProgress: metrics.tasks_in_progress,
                avgStoryTime: metrics.avg_story_time,
                sprintProgress: metrics.sprint_progress
            });
        } catch (err) {
          console.error("Error fetching team metrics:", err);
        } finally {
          setLoading(false);
        }
      };

    const createTeam = async (
        team: { name: string; description: string; projectId: string },
        members: string[]
    ) => {
        setLoading(true);
        setError(null);

        try {
        const response = await fetch(`${apiURL}/projects/${team.projectId}/teams`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            ...team,
            members,
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to create team");
        }
        const newTeam = await response.json();
        setTeams((prev) => [...prev, newTeam]);
        return newTeam;
        } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        throw err;
        } finally {
        setLoading(false);
        }
    };

    const updateTeam = async (
        teamId: string,
        team: { name?: string; description?: string; members?: string[] },
        projectId: string
    ) => {
        setLoading(true);
        setError(null);
        try {
        const response = await fetch(`${apiURL}/projects/${projectId}/teams/${teamId}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(team),
        });
        if (!response.ok) {
            throw new Error("Failed to update team");
        }
        const updatedTeam = await response.json();
        setTeams((prev) =>
            prev.map((t) => (t.id === teamId ? updatedTeam : t))
        );
        if (currentTeam?.id === teamId) {
            setCurrentTeam(updatedTeam);
        }
        } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        throw err;
        } finally {
        setLoading(false);
        }
    };

    const deleteTeam = async (teamId: string, projectId: string) => {
        setLoading(true);
        setError(null);
        try {
        const response = await fetch(`${apiURL}/projects/${projectId}/teams/${teamId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to delete team");
        }
        setTeams((prev) => prev.filter((team) => team.id !== teamId));
        if (currentTeam?.id === teamId) {
            setCurrentTeam(null);
        }
        } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        throw err;
        } finally {
        setLoading(false);
        }
    };

    return (
        <TeamsContext.Provider
        value={{
            teams,
            currentTeam,
            teamMetrics,
            loading,
            error,
            fetchTeams,
            fetchTeam,
            getTeamMetrics,
            createTeam,
            updateTeam,
            deleteTeam,
        }}
        >
        {children}
        </TeamsContext.Provider>
    );
    };

    export const useTeams = () => {
    const context = useContext(TeamsContext);
    if (context === undefined) {
        throw new Error("useTeams must be used within a TeamsProvider");
    }
    return context;
};