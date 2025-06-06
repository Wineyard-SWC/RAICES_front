"use client"

import React, { createContext, useContext, useState, useCallback } from "react";
import type { RoadmapItem, SavedRoadmap } from "@/types/roadmap";
import { deleteRoadmap as deleteRoadmapFromDB } from "@/app/roadmap/utils/endpointsDB/deleteRoadmap";
import { getRoadmaps } from "@/app/roadmap/utils/endpointsDB/getRoadmaps";

type RoadmapsByProjectId = Record<string, {
  roadmaps: SavedRoadmap[],
  lastFetched: number
}>

export type RoadmapContextType = {
  getRoadmapsForProject: (projectId: string) => SavedRoadmap[]
  isLoading: (projectId: string) => boolean
  hasError: (projectId: string) => string | null
  loadRoadmapsIfNeeded: (
    projectId: string,
    availableData:RoadmapItem[],
    fetchFunction?: (projectId: string,availableData:RoadmapItem[]) => Promise<SavedRoadmap[]>,
    maxAgeMs?: number
  ) => Promise<SavedRoadmap[]>
  refreshRoadmaps: (
    projectId: string,
    availableData:RoadmapItem[],
    fetchFunction?: (projectId: string,availableData:RoadmapItem[]) => Promise<SavedRoadmap[]>
  ) => Promise<SavedRoadmap[]>
  deleteRoadmap: (projectId: string, roadmapId: string) => Promise<void>
  clearProjectCache: (projectId: string) => void
  clearAllCache: () => void
}

const DEFAULT_CACHE_MAX_AGE = 30 * 60 * 1000

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roadmapsByProject, setRoadmapsByProject] = useState<RoadmapsByProjectId>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [errorState, setErrorState] = useState<Record<string, string | null>>({});

  const getRoadmapsForProject = useCallback((projectId: string): SavedRoadmap[] => {
    return roadmapsByProject[projectId]?.roadmaps || [];
  }, [roadmapsByProject]);

  const isLoading = useCallback((projectId: string): boolean => {
    return !!loadingState[projectId];
  }, [loadingState]);

  const hasError = useCallback((projectId: string): string | null => {
    return errorState[projectId] || null;
  }, [errorState]);

  const loadRoadmapsIfNeeded = useCallback(async (
    projectId: string,
    availableData:RoadmapItem[],
    fetchFunction: (projectId: string, availableData:RoadmapItem[]) => Promise<SavedRoadmap[]> = getRoadmaps,
    maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
  ): Promise<SavedRoadmap[]> => {
    if (!projectId) return [];
    const cachedData = roadmapsByProject[projectId];
    const now = Date.now();

    if (cachedData?.roadmaps.length > 0 && (now - cachedData.lastFetched) < maxAgeMs) {
      return cachedData.roadmaps;
    }

    setLoadingState(prev => ({ ...prev, [projectId]: true }));
    setErrorState(prev => ({ ...prev, [projectId]: null }));

    try {
      const fetchedRoadmaps = await fetchFunction(projectId,availableData);
      setRoadmapsByProject(prev => ({
        ...prev,
        [projectId]: {
          roadmaps: fetchedRoadmaps,
          lastFetched: now
        }
      }));
      return fetchedRoadmaps;
    } catch (err) {
      console.error(`Error fetching roadmaps for project ${projectId}:`, err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load roadmaps";
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }));
      return cachedData?.roadmaps || [];
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }));
    }
  }, [roadmapsByProject]);

  const refreshRoadmaps = useCallback(async (
    projectId: string,
    availableData:RoadmapItem[],
    fetchFunction: (projectId: string,availableData:RoadmapItem[]) => Promise<SavedRoadmap[]> = getRoadmaps
  ): Promise<SavedRoadmap[]> => {
    if (!projectId) return [];
    setLoadingState(prev => ({ ...prev, [projectId]: true }));
    setErrorState(prev => ({ ...prev, [projectId]: null }));

    try {
      const fetchedRoadmaps = await fetchFunction(projectId,availableData);
      setRoadmapsByProject(prev => ({
        ...prev,
        [projectId]: {
          roadmaps: fetchedRoadmaps,
          lastFetched: Date.now()
        }
      }));
      return fetchedRoadmaps;
    } catch (err) {
      console.error(`Error refreshing roadmaps for current project`);
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh roadmaps";
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }));
      return roadmapsByProject[projectId]?.roadmaps || [];
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }));
    }
  }, [roadmapsByProject]);

  const deleteRoadmap = useCallback(async (projectId: string, roadmapId: string) => {
    try {
      await deleteRoadmapFromDB(roadmapId);
      setRoadmapsByProject(prev => {
        const currentRoadmaps = prev[projectId]?.roadmaps || [];
        const filtered = currentRoadmaps.filter(r => r.id !== roadmapId);
        return {
          ...prev,
          [projectId]: {
            roadmaps: filtered,
            lastFetched: Date.now()
          }
        };
      });
    } catch (err) {
      console.error(`Error deleting roadmap`);
    }
  }, []);

  const clearProjectCache = useCallback((projectId: string) => {
    setRoadmapsByProject(prev => {
      const newState = { ...prev };
      delete newState[projectId];
      return newState;
    });
    setErrorState(prev => {
      const newState = { ...prev };
      delete newState[projectId];
      return newState;
    });
    setLoadingState(prev => {
      const newState = { ...prev };
      delete newState[projectId];
      return newState;
    });
  }, []);

  const clearAllCache = useCallback(() => {
    setRoadmapsByProject({});
    setLoadingState({});
    setErrorState({});
  }, []);

  return (
    <RoadmapContext.Provider value={{
      getRoadmapsForProject,
      isLoading,
      hasError,
      loadRoadmapsIfNeeded,
      refreshRoadmaps,
      deleteRoadmap,
      clearProjectCache,
      clearAllCache
    }}>
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmaps = () => {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error("useRoadmaps must be used within a RoadmapProvider");
  }
  return context;
};