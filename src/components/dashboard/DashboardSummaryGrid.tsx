import React from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { UpcomingEventsCard } from './UpcomingEventsCard';
import { TasksDueSoonCard } from './TasksDueSoonCard';
import { PomodoroStatsCard } from './PomodoroStatsCard';
import { Event } from '@/types';

interface Task {
  id: string;
  title: string;
  dueDate?: Date;
}

interface DashboardSummaryGridProps {
  userName: string;
  today: Date;
  upcomingEvents: Event[];
  tasksDueSoon: Task[];
  pomodoroStats: { completed: number; today: number };
}

export const DashboardSummaryGrid: React.FC<DashboardSummaryGridProps> = ({ userName, today, upcomingEvents, tasksDueSoon, pomodoroStats }) => (
  <div className="space-y-2 mb-4">
    <WelcomeHeader userName={userName} today={today} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      <UpcomingEventsCard upcomingEvents={upcomingEvents} />
      <TasksDueSoonCard tasksDueSoon={tasksDueSoon} />
      <PomodoroStatsCard completed={pomodoroStats.completed} today={pomodoroStats.today} />
    </div>
  </div>
); 