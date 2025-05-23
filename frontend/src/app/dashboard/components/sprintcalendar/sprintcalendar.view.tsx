// SprintCalendarView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarTabs } from './CalendarTabs';
import { FullCalendarWrapper } from './FullCalendarWrapper';
import { AddEventDialog } from './AddEventDialog';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { RecurringMeetings } from './RecurringMeetings';
import { EventCard } from './EventCard';
import { useCalendar } from "@/contexts/CalendarContext"

export default function SprintCalendarView({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  
  const {
    events,
    sprints,
    selectedSprint,
    setSelectedSprint,
    createEvent,
    deleteEvent,
    loading,
    error,
    projectId,
  } = useCalendar();

  useEffect(() => {
    if (selectedSprint && sprints.length > 0) {
      const sprint = sprints.find(s => s.id === selectedSprint);
      if (sprint) {
        const startDate = new Date(sprint.start_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        const endDate = new Date(sprint.end_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        setCurrentPeriod(`${startDate} - ${endDate}`);
      }
    }
  }, [selectedSprint, sprints]);

  const handlePrevious = () => {
    // Implement navigation to previous period
    console.log('Navigate to previous period');
  };

  const handleNext = () => {
    // Implement navigation to next period
    console.log('Navigate to next period');
  };

  const handleAddEvent = async (formData: any) => {
    try {
      const eventData = {
        project_id: projectId,
        sprint_id: selectedSprint,
        created_by: 'current-user-id', // Replace with actual user ID from auth
        title: formData.title,
        description: formData.description,
        type: formData.eventType,
        priority: 'medium', // Default or from form
        start_date: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
        end_date: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
        is_all_day: false,
        participants: formData.participants ? [formData.participants] : [],
        related_tasks: formData.relatedItems || [],
        is_recurring: formData.recurring,
        recurrence: formData.recurring ? {
          frequency: formData.frequency,
          end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          excluded_dates: []
        } : undefined
      };

      await createEvent(eventData);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleEventClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      // Show event details in a modal or side panel
      console.log('Event details:', event);
    }
  };

  const handleDateSelect = (date: Date) => {
    setIsAddEventOpen(true);
    // You can pre-fill the date in the form if needed
  };

  const handleAddRecurringMeeting = () => {
    setIsAddEventOpen(true);
  };

  const getUpcomingDeadlines = () => {
    return events
      .filter(event => event.type === 'deadline')
      .map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.start_date).toLocaleDateString(),
        daysLeft: Math.floor((new Date(event.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        priority: event.priority
      }));
  };

  const getRecurringMeetings = () => {
    return events
      .filter(event => event.type === 'meeting' && event.is_recurring)
      .map(event => ({
        id: event.id,
        title: event.title,
        schedule: `${new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        frequency: event.recurrence?.frequency || 'weekly'
      }));
  };

  if (!projectId) {
    return <div className="min-h-screen py-10 bg-[#EBE5EB]/40">Loading project...</div>;
  }

  return (
    <div className="min-h-screen py-10 bg-[#EBE5EB]/40">
      <main className="flex-1 p-6">
        <CalendarHeader
          currentPeriod={currentPeriod}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onAddEvent={() => setIsAddEventOpen(true)}
          selectedSprint={selectedSprint}
          onSprintChange={setSelectedSprint}
          onBack={onBack}
          sprints={sprints}
        />

        <CalendarTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentPeriod={currentPeriod}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        {loading && <div className="text-center py-4">Loading events...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        <FullCalendarWrapper
          events={events}
          view={activeTab}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
        />

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <UpcomingDeadlines deadlines={getUpcomingDeadlines()} />
          <RecurringMeetings 
            meetings={getRecurringMeetings()} 
            onAddMeeting={handleAddRecurringMeeting}
          />
        </div>

        <AddEventDialog
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          onSubmit={handleAddEvent}
        />
      </main>
    </div>
  );
}