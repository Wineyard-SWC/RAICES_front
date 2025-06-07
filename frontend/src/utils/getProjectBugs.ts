import { Bug} from "@/types/bug"
import { printError } from "./debugLogger";

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
    printError('Error loading bugs:', error);
    return []; 
}
}