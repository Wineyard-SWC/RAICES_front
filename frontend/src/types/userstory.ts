export interface UserStory {
    id: string; 
    idTitle: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    points: number;
    acceptanceCriteria: string[];
  }