"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  fetchTeams: (projectId?: string) => Promise<void>;
  fetchTeam: (teamId: string) => Promise<void>;
  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>, members: string[]) => Promise<void>;
  updateTeam: (teamId: string, teamData: Partial<Team>, members?: string[]) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  searchTeams: (query: string, projectId?: string) => Promise<Team[]>;
  getTeamMetrics: (teamId: string) => Promise<TeamMetrics>;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiURL = process.env.NEXT_PUBLIC_API_URL || ""

  const fetchTeams = async (projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = `${apiURL}/teams/`;
      if (projectId) {
        url += `?project_id=${projectId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${apiURL}/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }

      const data = await response.json();
      setCurrentTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>, members: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      console.log("Final payload being sent to API:", {
        ...team,
        members,
      });

      const response = await fetch(`${apiURL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...team,
          members,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const data = await response.json();
      setTeams(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, teamData: Partial<Team>, members?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${apiURL}/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...teamData,
          members,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update team');
      }

      const data = await response.json();
      setTeams(prev => prev.map(t => t.id === teamId ? data : t));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${apiURL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      setTeams(prev => prev.filter(t => t.id !== teamId));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchTeams = async (query: string, projectId?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return [];
      }

      let url = `${apiURL}/teams/search?query=${encodeURIComponent(query)}`;
      if (projectId) {
        url += `&project_id=${projectId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search teams');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return [];
    }
  };

  const getTeamMetrics = async (teamId: string): Promise<TeamMetrics> => {
    // In a real implementation, this would fetch metrics from your backend
    // For now, we'll return mock data
    return {
      velocity: Math.floor(Math.random() * 50) + 10,
      mood: Math.floor(Math.random() * 50) + 50,
      tasksCompleted: Math.floor(Math.random() * 100),
      tasksInProgress: Math.floor(Math.random() * 100),
      avgStoryTime: Math.random() * 3 + 1,
      sprintProgress: Math.floor(Math.random() * 100),
    };
  };

  return (
    <TeamsContext.Provider value={{
      teams,
      currentTeam,
      teamMetrics,
      loading,
      error,
      fetchTeams,
      fetchTeam,
      createTeam,
      updateTeam,
      deleteTeam,
      searchTeams,
      getTeamMetrics,
    }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};