import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, PauseCircle, Circle, Clock, Ban, Flame, HelpCircle, BookOpen, FileText, ClipboardList, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event, EventType, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format } from 'date-fns';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useCourses } from '@/hooks/useCourses';

interface CalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateSelect: (date: Date) => void;
  onEventDrop?: (event: Event, newStart: Date, newEnd: Date) => void;
  onEventResize?: (event: Event, newStart: Date, newEnd: Date) => void;
}

type ViewType = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';

// Status config for tasks
const STATUS_CONFIG = {
  notdone: { label: 'Not Done', color: '#9CA3AF', icon: Circle },
  pending: { label: 'Pending', color: '#FBBF24', icon: PauseCircle },
  done: { label: 'Done', color: '#22C55E', icon: CheckCircle2 },
  onhold: { label: 'On Hold', color: '#60A5FA', icon: Clock },
  cancelled: { label: 'Cancelled', color: '#6B7280', icon: Ban },
  urgent: { label: 'Urgent', color: '#EF4444', icon: Flame },
  ambiguous: { label: 'Ambiguous', color: '#A78BFA', icon: HelpCircle },
};

export const Calendar = ({
  events,
  onEventClick,
  onDateSelect,
  onEventDrop,
  onEventResize
}: CalendarProps) => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>(isMobile ? 'timeGridDay' : 'timeGridWeek');
  const calendarRef = useRef<any>(null);
  const { categories } = useCategories();
  const { courses } = useCourses();

  const getEventColor = (event: Event) => {
    if (event.id.startsWith('task-')) {
      return '#F472B6'; // pink for tasks
    }
    if (event.categoryId) {
      const category = categories.find(c => c.id === event.categoryId);
      return category?.colorHex || '#3B82F6';
    }
    // Fallback to legacy type-based colors
    const colors = {
      CLASS: '#3B82F6',
      STUDY: '#10B981',
      PERSONAL: '#8B5CF6',
      APPOINTMENT: '#F59E0B',
      QUIZ: '#EC4899', // pink-500
    };
    return colors[event.type as EventType] || '#3B82F6';
  };

  const handleEventDrop = (info: any) => {
    // Prevent drag/resize for tasks
    if (info.event.id.startsWith('task-')) {
      info.revert();
      return;
    }
    const event = events.find(e => e.id === info.event.id);
    if (event && onEventDrop) {
      onEventDrop(event, info.event.start, info.event.end);
    }
  };

  const handleEventResize = (info: any) => {
    // Prevent drag/resize for tasks
    if (info.event.id.startsWith('task-')) {
      info.revert();
      return;
    }
    const event = events.find(e => e.id === info.event.id);
    if (event && onEventResize) {
      onEventResize(event, info.event.start, info.event.end);
    }
  };

  const handleViewChange = (newView: ViewType) => {
    // Prevent switching to month view on mobile
    if (isMobile && newView === 'dayGridMonth') return;
    setView(newView);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
      setCurrentDate(new Date());
    }
  };

  const renderEventContent = (arg: any) => {
    const isTask = arg.event.id.startsWith('task-');
    const description = arg.event.extendedProps?.description;
    const { status, priority, courseId, categoryId, type, canvas_type } = arg.event.extendedProps || {};
    let courseColor, categoryColor;
    if (courseId && courses) {
      const course = courses.find((c) => c.id === courseId);
      courseColor = course?.colorHex;
    }
    if (categoryId && categories) {
      const category = categories.find((c) => c.id === categoryId);
      categoryColor = category?.colorHex;
    }
    // Status UI for tasks
    let statusDot = null;
    if (isTask && status && STATUS_CONFIG[status]) {
      const StatusIcon = STATUS_CONFIG[status].icon;
      statusDot = (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center mr-1">
              <StatusIcon className="w-3.5 h-3.5" style={{ color: STATUS_CONFIG[status].color }} />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{STATUS_CONFIG[status].label}</TooltipContent>
        </Tooltip>
      );
    }
    // Icon and badge for event type or canvas_type
    let typeIcon = null;
    let typeBadge = null;
    // Prefer canvas_type if present
    const canvasType = arg.event.extendedProps?.canvas_type;
    if (canvasType === 'assignment') {
      typeIcon = <FileText className="w-4 h-4 text-green-500 mr-1" />;
      typeBadge = <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">Assignment</span>;
    } else if (canvasType === 'quiz') {
      typeIcon = <ClipboardList className="w-4 h-4 text-pink-500 mr-1" />;
      typeBadge = <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">Quiz</span>;
    } else if (canvasType === 'discussion_topic') {
      typeIcon = <Megaphone className="w-4 h-4 text-purple-500 mr-1" />;
      typeBadge = <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">Discussion Topic</span>;
    } else if (canvasType === 'announcement') {
      typeIcon = <Megaphone className="w-4 h-4 text-orange-500 mr-1" />;
      typeBadge = <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">Announcement</span>;
    } else if (type === 'QUIZ') {
      typeIcon = <ClipboardList className="w-4 h-4 text-pink-500 mr-1" />;
      typeBadge = <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">Quiz</span>;
    } else if (type === 'CLASS') {
      typeIcon = <BookOpen className="w-4 h-4 text-blue-500 mr-1" />;
      typeBadge = <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">Class</span>;
    } else {
      typeIcon = <BookOpen className="w-4 h-4 text-blue-500 mr-1" />;
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col cursor-pointer">
            <div className="flex items-center gap-1 min-w-0 whitespace-nowrap overflow-hidden">
              {statusDot}
              {typeIcon && <span className="flex-shrink-0">{typeIcon}</span>}
              {courseColor && <span title="Course color" className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: courseColor }}></span>}
              {categoryColor && <span title="Category color" className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: categoryColor }}></span>}
              <span className="font-semibold truncate overflow-hidden text-ellipsis min-w-0" title={arg.event.title}>{arg.event.title}</span>
            </div>
            {isTask && (
              <div className="flex space-x-1 mt-1">
                {status && (
                  <span className={`text-xs rounded px-1 py-0.5 font-semibold`} style={{ background: STATUS_CONFIG[status]?.color + '22', color: STATUS_CONFIG[status]?.color }}>
                    {STATUS_CONFIG[status]?.label}
                  </span>
                )}
                {priority && (
                  <span className={`text-xs rounded px-1 py-0.5 ${priority === 'high' ? 'bg-red-200 text-red-800' : priority === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{priority}</span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs z-[9999] fixed">
          <div className="text-sm">
            <div className="font-semibold flex items-center gap-1">
              {typeIcon}
              {arg.event.title}
            </div>
            {description && <div className="mt-1">{description}</div>}
            {isTask && (
              <div className="mt-1 flex space-x-2">
                {status && <span>Status: {STATUS_CONFIG[status]?.label}</span>}
                {priority && <span>Priority: {priority}</span>}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        <span className="text-2xl mb-2">📅</span>
        <span>No events or tasks to display. Add one to get started!</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Next">
            <ChevronRight className="w-5 h-5" />
            </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Show Day and Week on mobile, Week and Month on desktop */}
          {isMobile ? (
            <>
              <Button
                variant={view === 'timeGridDay' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('timeGridDay')}
                className="flex-1 sm:flex-none"
              >
                Day
              </Button>
              <Button
                variant={view === 'timeGridWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('timeGridWeek')}
                className="flex-1 sm:flex-none"
              >
                Week
              </Button>
            </>
          ) : (
            <>
          <Button
                variant={view === 'timeGridWeek' ? 'default' : 'outline'}
            size="sm"
                onClick={() => handleViewChange('timeGridWeek')}
                className="flex-1 sm:flex-none"
          >
            Week
          </Button>
          <Button
                variant={view === 'dayGridMonth' ? 'default' : 'outline'}
            size="sm"
                onClick={() => handleViewChange('dayGridMonth')}
                className="flex-1 sm:flex-none"
          >
            Month
          </Button>
              {/* Subtle dropdown for all view types (desktop only, for testing) */}
              <select
                value={view}
                onChange={e => handleViewChange(e.target.value as ViewType)}
                style={{ opacity: 0.5, fontSize: '0.9em', padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: 'transparent', marginLeft: 8 }}
                className="hidden md:inline-block"
                aria-label="Test all calendar views"
              >
                <option value="dayGridMonth">Month (dayGridMonth)</option>
                <option value="timeGridWeek">Week (timeGridWeek)</option>
                <option value="timeGridDay">Day (timeGridDay)</option>
                <option value="listWeek">List Week (listWeek)</option>
                <option value="listDay">List Day (listDay)</option>
                <option value="dayGridWeek">Month-Week (dayGridWeek)</option>
                <option value="dayGridDay">Month-Day (dayGridDay)</option>
              </select>
            </>
          )}
          <Button 
            onClick={() => onDateSelect(new Date())} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="fc-theme-standard">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
              headerToolbar={false}
              height="auto"
              events={events.map(event => {
                const isTask = typeof event.id === 'string' && event.id.startsWith('task-');
                return {
                  id: event.id,
                  title: event.title,
                  start: event.start,
                  end: event.end,
                  allDay: event.isAllDay,
                  backgroundColor: getEventColor(event),
                  borderColor: getEventColor(event),
                  textColor: '#ffffff',
                  extendedProps: {
                    description: event.description,
                    categoryId: event.categoryId,
                    courseId: event.courseId,
                    status: isTask ? (event as any).extendedProps?.status ?? (event as any).status : undefined,
                    priority: isTask ? (event as any).extendedProps?.priority ?? (event as any).priority : undefined,
                    type: event.type,
                    canvas_type: event.canvas_type,
                    canvas_id: event.canvas_id,
                  }
                };
              })}
              editable={true}
              droppable={true}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              eventClick={(info) => {
                const event = events.find(e => e.id === info.event.id);
                if (event) onEventClick(event);
              }}
              dateClick={(info) => onDateSelect(info.date)}
              nowIndicator={true}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              slotDuration="00:30:00"
              allDaySlot={true}
              expandRows={true}
              stickyHeaderDates={true}
              dayMaxEvents={isMobile ? 2 : 3}
              eventMaxStack={2}
              views={{
                timeGridDay: {
                  titleFormat: { month: 'long', year: 'numeric', day: 'numeric' },
                  slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true }
                },
                timeGridWeek: {
                  titleFormat: { month: 'long', year: 'numeric' },
                  slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true }
                },
                dayGridMonth: {
                  titleFormat: { month: 'long', year: 'numeric' }
                }
              }}
              eventContent={renderEventContent}
            />
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
