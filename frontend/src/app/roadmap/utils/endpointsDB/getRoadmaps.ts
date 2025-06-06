import { SavedRoadmap } from "@/types/roadmap";
import { DatabaseRoadmap } from "@/types/roadmap";
import { databaseToRoadmap } from "../roadmapConverters";
import { RoadmapItem } from "@/types/roadmap";

const apiURL = process.env.NEXT_PUBLIC_API_URL!;

export async function getRoadmaps(
    projectId: string, 
    availableData: RoadmapItem[]
): Promise<SavedRoadmap[]> {
    try {
        const res = await fetch(`${apiURL}/projects/${projectId}/roadmaps`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch roadmaps");
        
        const dbRoadmaps: DatabaseRoadmap[] = await res.json();
        
        const getRoadmapById = async (id: string): Promise<DatabaseRoadmap | null> => {
            return dbRoadmaps.find(r => r.id === id) || null;
        };
        
        const savedRoadmaps: SavedRoadmap[] = [];
        for (const dbRoadmap of dbRoadmaps) {
            const savedRoadmap = await databaseToRoadmap(dbRoadmap, availableData, getRoadmapById);
            savedRoadmaps.push(savedRoadmap);
        }
        
        return savedRoadmaps;
        
    } catch (err) {
        console.error("Error fetching roadmaps:", err);
        throw err;
    }
}