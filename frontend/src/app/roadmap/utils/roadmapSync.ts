import { SavedRoadmap, RoadmapItem } from "@/types/roadmap";
import { RoadmapContextType } from "@/contexts/roadmapContext";
import { deleteRoadmap as callDeleteRoadmapAPI } from "./endpointsDB/deleteRoadmap";

export class RoadmapSyncManager {
  constructor(
    private projectId: string,
    private availableData: RoadmapItem[],
    private context: RoadmapContextType,
    private setSavedRoadmaps: (roadmaps: SavedRoadmap[] | ((prev: SavedRoadmap[]) => SavedRoadmap[])) => void,
    private setCurrentRoadmap: (roadmap: SavedRoadmap | null) => void
  ) {}

 
  async refreshAndSync(): Promise<SavedRoadmap[]> {
    try {
      const refreshedRoadmaps = await this.context.refreshRoadmaps(
        this.projectId, 
        this.availableData
      );
      
      this.setSavedRoadmaps(refreshedRoadmaps);
      return refreshedRoadmaps;
    } catch (error) {
      console.error("Error refreshing roadmaps:", error);

      const cachedRoadmaps = this.context.getRoadmapsForProject(this.projectId);
      this.setSavedRoadmaps(cachedRoadmaps);
      return cachedRoadmaps;
    }
  }

 
  async syncCurrentRoadmap(
    targetName?: string, 
    targetId?: string
  ): Promise<SavedRoadmap | null> {
    const refreshedRoadmaps = await this.refreshAndSync();
    
    let targetRoadmap: SavedRoadmap | undefined;
    
    if (targetId) {
      targetRoadmap = refreshedRoadmaps.find(r => r.id === targetId);
    } else if (targetName) {
      targetRoadmap = refreshedRoadmaps.find(r => r.name === targetName);
    }
    
    if (targetRoadmap) {
      this.setCurrentRoadmap(targetRoadmap);
      return targetRoadmap;
    }
    
    return null;
  }

  async deleteRoadmap(current:SavedRoadmap,roadmapId: string): Promise<boolean> {
    
    try {
        await callDeleteRoadmapAPI(roadmapId);
        
        this.setSavedRoadmaps(prev => {
            const filtered = prev.filter(r => r.id !== roadmapId);
            return filtered;
        });
        
        this.setCurrentRoadmap(current && current.id === roadmapId ? null : current);

      
        return true;
    } catch (error) {
      console.error("❌ RoadmapSyncManager: Error deleting roadmap");
      
      throw error;
    }
  }

  handleSyncError(
    error: any, 
    fallbackRoadmap: SavedRoadmap,
    operation: string
  ): void {
    console.error(`Error in ${operation}:`, error);
    
    this.setSavedRoadmaps((prev: SavedRoadmap[]) => {
      const exists = prev.find(r => r.id === fallbackRoadmap.id);
      if (exists) {
        return prev.map(r => r.id === fallbackRoadmap.id ? fallbackRoadmap : r);
      } else {
        return [...prev, fallbackRoadmap];
      }
    });
    
    this.setCurrentRoadmap(fallbackRoadmap);
  }
}

export function useRoadmapSync(
  projectId: string,
  availableData: RoadmapItem[],
  context: RoadmapContextType,
  setSavedRoadmaps: (roadmaps: SavedRoadmap[] | ((prev: SavedRoadmap[]) => SavedRoadmap[])) => void,
  setCurrentRoadmap: (roadmap: SavedRoadmap | null) => void
) {
  if (!projectId) {
    throw new Error("Project ID is required for roadmap sync");
  }

  return new RoadmapSyncManager(
    projectId,
    availableData,
    context,
    setSavedRoadmaps,
    setCurrentRoadmap
  );
}