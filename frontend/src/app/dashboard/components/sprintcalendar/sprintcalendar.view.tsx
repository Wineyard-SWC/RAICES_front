// SprintCalendarView.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarTabs } from './CalendarTabs';
import { FullCalendarWrapper, CalendarRef } from './FullCalendarWrapper';
import { AddEventDialog } from './AddEventDialog';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { RecurringMeetings } from './RecurringMeetings';
import { EventCard } from './EventCard';
import { useCalendar } from "@/contexts/CalendarContext"
import { MeetingDetailsModal } from './testCalendar/MeetingDetailsModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SprintCalendarView({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Event | null>(null);
  const [isMeetingDetailsOpen, setIsMeetingDetailsOpen] = useState(false);
  const calendarRef = useRef<CalendarRef>(null);

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

  const formatCurrentPeriod = (date: Date) => {
    if (activeTab === 'week') {
      // For week view, show the week range
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // End of week (Saturday)
      
      // Format: "May 1 - May 7, 2025"
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
      const startDay = start.getDate();
      const endDay = end.getDate();
      const year = end.getFullYear();
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}, ${year}`;
      } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else {
      // For month view, show the month and year
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Update current period when view changes
  useEffect(() => {
    if (calendarRef.current) {
      const date = calendarRef.current.getDate();
      setCurrentPeriod(formatCurrentPeriod(date));
    }
  }, [activeTab]);

  const handlePrevious = () => {
    if (calendarRef.current) {
      const date = calendarRef.current.prev();
      if (date) {
        setCurrentPeriod(formatCurrentPeriod(date));
      }
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      const date = calendarRef.current.next();
      if (date) {
        setCurrentPeriod(formatCurrentPeriod(date));
      }
    }
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

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }
      
      await deleteEvent(eventId);
      
      // Close modal if we're deleting the currently viewed meeting
      if (selectedMeeting && selectedMeeting.id === eventId) {
        setIsMeetingDetailsOpen(false);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleViewMeetingDetails = (eventId: string) => {
    const meeting = events.find(e => e.id === eventId);
    if (meeting) {
      setSelectedMeeting(meeting);
      setIsMeetingDetailsOpen(true);
    }
  };

  if (!projectId) {
    return <div className="min-h-screen py-10 bg-[#EBE5EB]/40">Loading project...</div>;
  }

  return (
    <div className="min-h-screen py-10 bg-[#EBE5EB]/0">
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
          ref={calendarRef}
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
            onDeleteMeeting={handleDeleteEvent}
            onViewMeetingDetails={handleViewMeetingDetails}
          />
        </div>

        <AddEventDialog
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          onSubmit={handleAddEvent}
        />

        <MeetingDetailsModal
          isOpen={isMeetingDetailsOpen}
          onClose={() => setIsMeetingDetailsOpen(false)}
          meeting={selectedMeeting}
          onDelete={() => {
            if (selectedMeeting) {
              handleDeleteEvent(selectedMeeting.id);
            }
          }}
        />
    </div>
  );
}