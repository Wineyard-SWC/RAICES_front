export interface Requirement {
    id: string;
    idTitle: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    category?: 'Funcional' | 'No Funcional';
  }