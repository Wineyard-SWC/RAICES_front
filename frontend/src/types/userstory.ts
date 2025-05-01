export interface comments{
    id: string
    user_id: string
    user_name: string
    text: string
    timestamp: string
}

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
    comments?: comments[];
    status_khanban?: 'Backlog'|'In Progress'|'In Review'|'To Do'|'Done'
};


export type UserStoryResponse = {
    content: UserStory[];
};