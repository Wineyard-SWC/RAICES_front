export interface UserStory {
    epicId: string;
    id: string; 
    idTitle: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    points: number;
    acceptanceCriteria: string[];
}