import { Bug} from "@/types/bug"

const apiURL = process.env.NEXT_PUBLIC_API_URL!

export const getProjectBugs = async (projectId: string): Promise<Bug[]> => {
  try {
        const response = await fetch(`${apiURL}/bugs/project/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      }
      
    catch (error) {
    console.error('Error loading bugs:', error);
    return []; 
}
}