export interface UserStory {
    uuid: string;
    assigned_epic: string;
    id: string; 
    idTitle: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    points: number;
    acceptance_criteria: string[];
    selected?: boolean
};


export type UserStoryResponse = {
    content: UserStory[];
};