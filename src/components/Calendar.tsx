
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event, EVENT_TYPE_COLORS } from '@/types/event';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';

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
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = addDays(startOfWeek(monthEnd), 41); // 6 weeks * 7 days
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).slice(0, 42);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
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
              {/* Month Header */}
              <div className="grid grid-cols-7 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => onDateSelect(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`${EVENT_TYPE_COLORS[event.type]} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-90`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
