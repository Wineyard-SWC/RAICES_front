import { SavedRoadmap, DatabaseRoadmap } from "@/types/roadmap";
import { roadmapToDatabaseFormat } from "../roadmapConverters";

const apiURL = process.env.NEXT_PUBLIC_API_URL!;


export async function saveOrUpdateRoadmap(
    projectId: string,
    roadmap: SavedRoadmap, 
    isNew: boolean,
    isDuplicate: boolean = false,
    sourceRoadmapId?: string
): Promise<DatabaseRoadmap> {
    const dbRoadmap = roadmapToDatabaseFormat(roadmap, isDuplicate, sourceRoadmapId);
    
    if (dbRoadmap.isDuplicate && !dbRoadmap.isModified && dbRoadmap.phases.length > 0) {
        dbRoadmap.isModified = true;
    }

    const url = isNew
        ? `${apiURL}/projects/roadmaps`
        : `${apiURL}/projects/roadmaps/${dbRoadmap.id}`;

    const method = isNew ? "POST" : "PUT";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dbRoadmap), 
        });

        if (!res.ok) throw new Error(isNew ? "Failed to create roadmap" : "Failed to update roadmap");
        return res.json();
    } catch (error) {
        console.error("Error in saveOrUpdateRoadmap");
        throw error;
    }
}
