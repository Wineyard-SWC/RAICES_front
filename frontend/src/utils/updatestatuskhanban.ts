const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const updateTaskStatus = async (projectId:string, taskId: string, newStatus: string) => {
    if (!projectId) return;
    try {
      await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_khanban: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };