import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { EventModal } from '@/components/EventModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Event } from '@/types';
import { RecurrenceSettings } from '@/components/RecurrenceModal';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { addDays, addWeeks, addMonths, setDate, getDay, getDate, getMonth, getYear } from 'date-fns';
import { TaskModal } from '@/components/TaskModal';

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  const {
    events,
    isLoading: eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();
  const { tasks, isLoading: tasksLoading } = useTasks();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (loading || eventsLoading || tasksLoading) {
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

  // Map tasks to calendar event objects
  const taskEvents: Event[] = tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: `task-${task.id}`,
      title: `Task: ${task.title}`,
      start: new Date(task.dueDate!.getTime() - 60 * 60 * 1000), // 1 hour before due date/time
      end: task.dueDate!, // End is the due date/time
      type: 'PERSONAL',
      description: task.description,
      isAllDay: false,
      categoryId: undefined,
      courseId: task.courseId,
      extendedProps: {
        status: task.status,
        priority: task.priority,
      },
    }));

  const allEvents = [...events, ...taskEvents];

  const handleEventClick = (event: Event) => {
    if (event.id.startsWith('task-')) {
      const taskId = event.id.replace('task-', '');
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
      }
    } else {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventDrop = (event: Event, newStart: Date, newEnd: Date) => {
    updateEvent({
      ...event,
      start: newStart,
      end: newEnd
    });
  };

  const handleEventResize = (event: Event, newStart: Date, newEnd: Date) => {
    updateEvent({
      ...event,
      start: newStart,
      end: newEnd
    });
  };

  const getNthWeekdayOfMonth = (date: Date, nth: number, weekday: number) => {
    const year = getYear(date);
    const month = getMonth(date);
    let firstDay = new Date(year, month, 1);
    let firstWeekday = firstDay.getDay();
    let day = 1 + ((7 + weekday - firstWeekday) % 7) + (nth - 1) * 7;
    return new Date(year, month, day);
  };

  const getLastWeekdayOfMonth = (date: Date, weekday: number) => {
    const year = getYear(date);
    const month = getMonth(date);
    let lastDay = new Date(year, month + 1, 0);
    let lastWeekday = lastDay.getDay();
    let day = lastDay.getDate() - ((7 + lastWeekday - weekday) % 7);
    return new Date(year, month, day);
  };

  const generateRecurringEvents = (baseEvent: Omit<Event, 'id'>, recurrence: RecurrenceSettings) => {
    const events: Omit<Event, 'id'>[] = [baseEvent];
    let currentDate = new Date(baseEvent.start);
    const endDate = recurrence.endDate || addMonths(currentDate, 12); // Default to 1 year if no end date
    const maxOccurrences = recurrence.endAfterOccurrences || 100;
    let occurrences = 1;

    while (currentDate < endDate && occurrences < maxOccurrences) {
      let nextDate: Date | null = null;
      switch (recurrence.frequency) {
        case 'daily':
          nextDate = addDays(currentDate, recurrence.interval);
          break;
        case 'weekly':
          if (recurrence.daysOfWeek.length > 0) {
            // Find next occurrence based on selected days
            let tempDate = addDays(currentDate, 1);
            let count = 0;
            while (!recurrence.daysOfWeek.includes(tempDate.getDay())) {
              tempDate = addDays(tempDate, 1);
              count++;
              if (count > 7) break;
            }
            nextDate = tempDate;
          } else {
            nextDate = addWeeks(currentDate, recurrence.interval);
          }
          break;
        case 'monthly':
          if (recurrence.monthlyType === 'nthWeekday' && recurrence.nthWeek && recurrence.weekday !== undefined) {
            // e.g., 2nd Tuesday
            let nextMonth = addMonths(currentDate, recurrence.interval);
            nextDate = getNthWeekdayOfMonth(nextMonth, recurrence.nthWeek, recurrence.weekday);
          } else if (recurrence.monthlyType === 'lastWeekday' && recurrence.weekday !== undefined) {
            // e.g., last Friday
            let nextMonth = addMonths(currentDate, recurrence.interval);
            nextDate = getLastWeekdayOfMonth(nextMonth, recurrence.weekday);
          } else {
            // Default: same day of month
            let nextMonth = addMonths(currentDate, recurrence.interval);
            let day = getDate(baseEvent.start);
            nextDate = setDate(nextMonth, day);
          }
          break;
        default:
          return events;
      }
      if (!nextDate || nextDate >= endDate) break;
      const duration = baseEvent.end.getTime() - baseEvent.start.getTime();
      const newEvent = {
        ...baseEvent,
        start: nextDate,
        end: new Date(nextDate.getTime() + duration),
      };
      events.push(newEvent);
      currentDate = nextDate;
      occurrences++;
      if (events.length >= 100) break;
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
        events={allEvents}
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
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
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
};

const Index = () => {
  return <AuthenticatedApp />;
};

export default Index;
