// FullCalendarWrapper.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Event } from './CalendarContext';

interface FullCalendarWrapperProps {
  events: Event[];
  view: 'day' | 'week' | 'month';
  onEventClick: (eventId: string) => void;
  onDateSelect: (date: Date) => void;
}

export const FullCalendarWrapper: React.FC<FullCalendarWrapperProps> = ({
  events,
  view,
  onEventClick,
  onDateSelect
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  // Convert events to FullCalendar format
  const fullCalendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_date,
    end: event.end_date,
    backgroundColor: event.type === 'meeting' ? '#8b5cf6' : 
                    event.priority === 'high' ? '#ef4444' :
                    event.priority === 'medium' ? '#3b82f6' : '#10b981',
    borderColor: 'transparent',
    textColor: 'white',
    extendedProps: {
      priority: event.priority,
      type: event.type,
      is_recurring: event.is_recurring
    }
  }));

  const getCalendarView = () => {
    switch (view) {
      case 'day':
        return 'timeGridDay';
      case 'week':
        return 'timeGridWeek';
      case 'month':
        return 'dayGridMonth';
      default:
        return 'timeGridWeek';
    }
  };

  // Update calendar view when prop changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(getCalendarView());
    }
  }, [view]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={getCalendarView()}
        headerToolbar={false}
        events={fullCalendarEvents}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        eventClick={(info) => onEventClick(info.event.id)}
        select={(info) => onDateSelect(info.start)}
        height="auto"
        eventDisplay="block"
        eventContent={(eventInfo) => (
          <div className="p-1">
            <div className="font-medium text-xs flex items-center justify-between">
              {eventInfo.event.title}
              {eventInfo.event.extendedProps.is_recurring && (
                <span className="text-xs">🔄</span>
              )}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {eventInfo.timeText}
            </div>
          </div>
        )}
      />
    </div>
  );
};