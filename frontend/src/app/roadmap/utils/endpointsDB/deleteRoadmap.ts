const apiURL = process.env.NEXT_PUBLIC_API_URL!;

export async function deleteRoadmap(id: string) {
    try {
        const res = await fetch(`${apiURL}/projects/roadmaps/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete roadmap");
        return true;
    } catch (err) {
        console.error("Error deleting roadmap:", err);
        throw err;
    }
}