import { Bug } from "@/types/bug";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const getProjectBugs = async (projectId: string): Promise<Bug[]> => {
  try {
    const response = await fetch(`${API_URL}/bugs/project/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching project bugs:", error);
    throw error;
  }
};

export const getBugById = async (bugId: string): Promise<Bug> => {
  try {
    const response = await fetch(`${API_URL}/bugs/${bugId}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching bug ${bugId}:`, error);
    throw error;
  }
};


export const createBug = async (bugData: Bug): Promise<Bug> => {
  try {
    const response = await fetch(`${API_URL}/bugs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bugData),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating bug:", error);
    throw error;
  }
};


export const updateBug = async (bugId: string, bugData: Partial<Bug>): Promise<Bug> => {
  try {
    const response = await fetch(`${API_URL}/bugs/${bugId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bugData),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating bug ${bugId}:`, error);
    throw error;
  }
};


export const updateBugKanbanStatus = async (
  projectId: string,
  bugId: string,
  newStatus: "Backlog" | "To Do" | "In Progress" | "In Review" | "Done"
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/bugs/${bugId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_khanban: newStatus }),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating bug status ${bugId}:`, error);
    throw error;
  }
};


export const deleteBug = async (bugId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/bugs/${bugId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting bug ${bugId}:`, error);
    throw error;
  }
};