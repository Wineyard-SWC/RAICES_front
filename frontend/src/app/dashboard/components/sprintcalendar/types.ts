// types.ts
export type EventType = 'meeting' | 'task' | 'deadline';
export type EventPriority = 'high' | 'medium' | 'low';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Event {
  id: string;
  projectId: string;
  sprintId: string;
  createdBy: string;
  title: string;
  description: string;
  type: EventType;
  priority: EventPriority;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location?: string;
  participants: string[];
  relatedTasks?: string[];
  isRecurring: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    endDate?: string;
    excludedDates?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
  priority: EventPriority;
}

export interface RecurringMeeting {
  id: string;
  title: string;
  schedule: string;
  frequency: RecurrenceFrequency;
}