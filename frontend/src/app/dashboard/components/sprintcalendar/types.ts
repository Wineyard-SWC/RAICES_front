export interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    assignee: string;
    type: 'task' | 'meeting';
    recurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    description?: string;
    participants?: string[];
    relatedItems?: string[];
  }
  
  export interface SprintItem {
    id: string;
    title: string;
    type: 'user-story' | 'task' | 'bug';
  }
  
  export interface Deadline {
    id: string;
    title: string;
    date: string;
    daysLeft: number;
    priority: 'high' | 'medium' | 'low';
  }
  
  export interface RecurringMeeting {
    id: string;
    title: string;
    schedule: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  }