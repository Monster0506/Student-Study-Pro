
import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { Header } from '@/components/Header';
import { EventModal } from '@/components/EventModal';
import { Sidebar } from '@/components/Sidebar';
import { Event, EventType } from '@/types/event';

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Physics Lecture',
    start: new Date(2025, 5, 2, 9, 0),
    end: new Date(2025, 5, 2, 10, 30),
    type: 'CLASS' as EventType,
    description: 'Quantum mechanics introduction'
  },
  {
    id: '2',
    title: 'Study Session - Math',
    start: new Date(2025, 5, 2, 14, 0),
    end: new Date(2025, 5, 2, 16, 0),
    type: 'STUDY' as EventType,
    description: 'Calculus problem sets'
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    start: new Date(2025, 5, 3, 11, 0),
    end: new Date(2025, 5, 3, 12, 0),
    type: 'APPOINTMENT' as EventType
  },
  {
    id: '4',
    title: 'Coffee with Friends',
    start: new Date(2025, 5, 4, 15, 30),
    end: new Date(2025, 5, 4, 17, 0),
    type: 'PERSONAL' as EventType
  }
];

const Index = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...eventData, id: selectedEvent.id }
          : event
      ));
    } else {
      // Create new event
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString()
      };
      setEvents([...events, newEvent]);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onAddEvent={() => {
            setSelectedEvent(null);
            setSelectedDate(new Date());
            setIsModalOpen(true);
          }}
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Calendar 
              events={events}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
            />
          </div>
        </main>
      </div>

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

export default Index;
