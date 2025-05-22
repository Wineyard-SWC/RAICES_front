"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarTabs } from './CalendarTabs';
import { FullCalendarWrapper } from './FullCalendarWrapper';
import { AddEventDialog } from './AddEventDialog';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { RecurringMeetings } from './RecurringMeetings';
import { Event, SprintItem, Deadline, RecurringMeeting } from './types';

interface SprintCalendarViewProps {
  onBack?: () => void;
}

export default function SprintCalendarView({ onBack }: SprintCalendarViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState('current');
  const [currentPeriod, setCurrentPeriod] = useState('May 12 - May 18, 2025');

  // TODO: Replace with actual data from your API/state management
  const [events, setEvents] = useState<Event[]>([
    // Mock data - replace with actual data
  ]);

  const [sprintItems, setSprintItems] = useState<SprintItem[]>([
    // Mock data - replace with actual data
  ]);

  const [deadlines, setDeadlines] = useState<Deadline[]>([
    // Mock data - replace with actual data
  ]);

  const [recurringMeetings, setRecurringMeetings] = useState<RecurringMeeting[]>([
    // Mock data - replace with actual data
  ]);

  const handlePrevious = () => {
    // TODO: Implement navigation logic
    console.log('Navigate to previous period');
  };

  const handleNext = () => {
    // TODO: Implement navigation logic
    console.log('Navigate to next period');
  };

  const handleAddEvent = (eventData: any) => {
    // TODO: Implement add event logic
    console.log('Add event:', eventData);
  };

  const handleEventClick = (eventId: string) => {
    // TODO: Implement event click logic
    console.log('Event clicked:', eventId);
  };

  const handleDateSelect = (date: Date) => {
    // TODO: Implement date selection logic
    console.log('Date selected:', date);
  };

  const handleAddRecurringMeeting = () => {
    // TODO: Implement add recurring meeting logic
    setIsAddEventOpen(true);
  };

  const handleBack = () => {
    // Use the onBack prop if provided
    if (onBack) {
      onBack();
    }
  };

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
          onBack={handleBack}
        />

        <CalendarTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentPeriod={currentPeriod}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <FullCalendarWrapper
          events={events}
          view={activeTab}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
        />

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <UpcomingDeadlines deadlines={deadlines} />
          <RecurringMeetings 
            meetings={recurringMeetings} 
            onAddMeeting={handleAddRecurringMeeting}
          />
        </div>

        <AddEventDialog
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          onSubmit={handleAddEvent}
          sprintItems={sprintItems}
        />
      </main>
    </div>
  );
}