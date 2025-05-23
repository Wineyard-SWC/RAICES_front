"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

export type EventType = 'meeting' | 'task' | 'deadline';
export type EventPriority = 'high' | 'medium' | 'low';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Event {
  id: string;
  project_id: string;
  sprint_id: string;
  created_by: string;
  title: string;
  description: string;
  type: EventType;
  priority: EventPriority;
  start_date: string;
  end_date: string;
  is_all_day: boolean;
  location?: string;
  participants: string[];
  related_tasks: string[];
  is_recurring: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    end_date?: string;
    excluded_dates?: string[];
  };
  created_at: string;
  updated_at: string;
  // Add these new properties for recurring instances
  isRecurringInstance?: boolean;
  originalEventId?: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  team_members: string[];
}

interface CalendarContextType {
  events: Event[];
  sprints: Sprint[];
  selectedSprint: string;
  setSelectedSprint: (sprintId: string) => void;
  createEvent: (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchSprints: () => Promise<void>;
  loading: boolean;
  error: string | null;
  projectId: string | null;
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    setProjectId(storedProjectId);
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchSprints = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/sprints`);
      if (!response.ok) throw new Error('Failed to fetch sprints');
      const data = await response.json();
      setSprints(data);
      if (data.length > 0 && !selectedSprint) {
        setSelectedSprint(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sprints');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!projectId || !selectedSprint) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/sprints/${selectedSprint}/events`
      );
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId || !selectedSprint) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/sprints/${selectedSprint}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );
      if (!response.ok) throw new Error('Failed to create event');
      const newEvent = await response.json();
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    if (!projectId || !selectedSprint) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/sprints/${selectedSprint}/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );
      if (!response.ok) throw new Error('Failed to update event');
      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => event.id === eventId ? updatedEvent : event));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!projectId || !selectedSprint) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/sprints/${selectedSprint}/events/${eventId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // Function to expand recurring events into multiple instances
  const expandRecurringEvents = (events: Event[]): Event[] => {
    const expandedEvents: Event[] = [];

    events.forEach(event => {
      // Add the original event
      expandedEvents.push(event);
      
      // If not recurring, skip to next event
      if (!event.is_recurring || !event.recurrence) return;
      
      const frequency = event.recurrence.frequency;
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      const eventDuration = endDate.getTime() - startDate.getTime();
      
      // Calculate end date for recurrence
      let recurrenceEndDate: Date;
      if (event.recurrence.end_date) {
        recurrenceEndDate = new Date(event.recurrence.end_date);
      } else {
        // If no end date specified, default to 3 months from start
        recurrenceEndDate = new Date(startDate);
        recurrenceEndDate.setMonth(recurrenceEndDate.getMonth() + 3);
      }
      
      // Check if excluded dates exist
      const excludedDates = event.recurrence.excluded_dates?.map(date => new Date(date).getTime()) || [];
      
      // Generate recurring instances based on frequency
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 1); // Start from next day
      
      while (currentDate < recurrenceEndDate) {
        const isExcluded = excludedDates.includes(currentDate.getTime());
        
        if (!isExcluded) {
          // Determine if this date should have an event based on the frequency
          let shouldAddEvent = false;
          
          switch (frequency) {
            case 'daily':
              shouldAddEvent = true;
              break;
              
            case 'weekly':
              shouldAddEvent = currentDate.getDay() === startDate.getDay();
              break;
              
            case 'biweekly':
              const dayDiff = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              shouldAddEvent = currentDate.getDay() === startDate.getDay() && dayDiff % 14 === 0;
              break;
              
            case 'monthly':
              shouldAddEvent = currentDate.getDate() === startDate.getDate();
              break;
          }
          
          if (shouldAddEvent) {
            // Create a new instance of the event
            const newEventStart = new Date(currentDate);
            newEventStart.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
            
            const newEventEnd = new Date(newEventStart.getTime() + eventDuration);
            
            expandedEvents.push({
              ...event,
              id: `${event.id}-instance-${currentDate.getTime()}`,
              start_date: newEventStart.toISOString(),
              end_date: newEventEnd.toISOString(),
              // Mark as an instance of a recurring event
              isRecurringInstance: true,
              originalEventId: event.id
            });
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return expandedEvents;
  };

  useEffect(() => {
    if (projectId) {
      fetchSprints();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && selectedSprint) {
      fetchEvents();
    }
  }, [projectId, selectedSprint]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        sprints,
        selectedSprint,
        setSelectedSprint,
        createEvent,
        updateEvent,
        deleteEvent,
        fetchEvents,
        fetchSprints,
        loading,
        error,
        projectId,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};