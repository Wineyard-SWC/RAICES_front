export interface Requirement {
    id: string;
    uuid: string;
    idTitle: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    category?: 'Funcional' | 'No Funcional';
    selected?: boolean;
    epicRef?: string;
  }