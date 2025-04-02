export interface Requirement {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }