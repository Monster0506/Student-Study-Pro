import React from 'react';
import { Event } from '@/types';
import { format } from 'date-fns';

interface UpcomingEventsCardProps {
  upcomingEvents: Event[];
}

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ upcomingEvents }) => (
  <div className="bg-card border rounded-lg shadow p-4 flex flex-col">
    <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Upcoming Events</div>
    {upcomingEvents.length > 0 ? (
      <ul className="space-y-1">
        {upcomingEvents.map(ev => (
          <li key={ev.id} className="truncate">
            <span className="font-medium">{ev.title}</span>
            <span className="text-xs text-gray-500 ml-2">{format(ev.start, 'MMM d, h:mm a')}</span>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-xs text-gray-400">No upcoming events</span>
    )}
  </div>
); 