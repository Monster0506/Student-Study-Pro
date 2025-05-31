
import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { EventModal } from '@/components/EventModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Event } from '@/types';
import { RecurrenceSettings } from '@/components/RecurrenceModal';
import { useEvents } from '@/hooks/useEvents';
import { addDays, addWeeks, addMonths } from 'date-fns';

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  const {
    events,
    isLoading: eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm 
        onToggleMode={() => setIsSignUp(!isSignUp)}
        isSignUp={isSignUp}
      />
    );
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const generateRecurringEvents = (baseEvent: Omit<Event, 'id'>, recurrence: RecurrenceSettings) => {
    const events: Omit<Event, 'id'>[] = [baseEvent];
    let currentDate = new Date(baseEvent.start);
    const endDate = recurrence.endDate || addMonths(currentDate, 12); // Default to 1 year if no end date
    
    while (currentDate < endDate) {
      let nextDate: Date;
      
      switch (recurrence.frequency) {
        case 'daily':
          nextDate = addDays(currentDate, recurrence.interval);
          break;
        case 'weekly':
          if (recurrence.daysOfWeek.length > 0) {
            // Find next occurrence based on selected days
            nextDate = addDays(currentDate, 1);
            while (!recurrence.daysOfWeek.includes(nextDate.getDay())) {
              nextDate = addDays(nextDate, 1);
            }
          } else {
            nextDate = addWeeks(currentDate, recurrence.interval);
          }
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, recurrence.interval);
          break;
        default:
          return events;
      }
      
      if (nextDate >= endDate) break;
      
      const duration = baseEvent.end.getTime() - baseEvent.start.getTime();
      const newEvent = {
        ...baseEvent,
        start: nextDate,
        end: new Date(nextDate.getTime() + duration),
      };
      
      events.push(newEvent);
      currentDate = nextDate;
      
      // Prevent infinite loops
      if (events.length > 100) break;
    }
    
    return events;
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>, recurrence?: RecurrenceSettings) => {
    if (selectedEvent) {
      updateEvent({ ...eventData, id: selectedEvent.id });
    } else {
      if (recurrence && recurrence.frequency !== 'none') {
        // Create recurring events
        const recurringEvents = generateRecurringEvents(eventData, recurrence);
        recurringEvents.forEach(event => createEvent(event));
      } else {
        // Create single event
        createEvent(eventData);
      }
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      <Calendar 
        events={events}
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent.id) : undefined}
      />
    </div>
  );
};

const Index = () => {
  return <AuthenticatedApp />;
};

export default Index;
