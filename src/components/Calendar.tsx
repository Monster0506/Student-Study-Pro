
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event, EVENT_TYPE_COLORS } from '@/types/event';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isSameMonth } from 'date-fns';

interface CalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateSelect: (date: Date) => void;
}

type ViewType = 'week' | 'month';

export const Calendar = ({ events, onEventClick, onDateSelect }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');

  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const weekDays = getWeekDays();
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {view === 'week' 
              ? format(currentDate, 'MMMM yyyy')
              : format(currentDate, 'MMMM yyyy')
            }
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {view === 'week' ? (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Week Header */}
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                  <div className="p-4 text-sm font-medium text-gray-700"></div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="p-4 text-center border-l border-gray-200">
                      <div className="text-sm font-medium text-gray-700">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${
                        isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {timeSlots.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]">
                      <div className="p-2 text-sm text-gray-500 text-right border-r border-gray-200">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="border-l border-gray-200 p-1 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => onDateSelect(new Date(day.getTime() + hour * 60 * 60 * 1000))}
                        >
                          {getEventsForDate(day)
                            .filter(event => event.start.getHours() === hour)
                            .map((event) => (
                              <div
                                key={event.id}
                                className={`${EVENT_TYPE_COLORS[event.type]} text-white text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-90 transition-opacity`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(event);
                                }}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="opacity-90">
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center text-gray-500">
                Month view coming soon...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
