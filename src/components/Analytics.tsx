import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useTimeUsageAnalytics, useStudyGoalProgress } from '@/hooks/useAnalytics';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRangeSelector } from './analytics/DateRangeSelector';
import { TimeUsagePieChart } from './analytics/TimeUsagePieChart';
import { TimeUsageBarChart } from './analytics/TimeUsageBarChart';
import { StudyGoalsProgress } from './analytics/StudyGoalsProgress';

export const Analytics = () => {
  const [dateRange, setDateRange] = useState('thisWeek');
  const isMobile = useIsMobile();
  
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'thisWeek':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'lastWeek':
        return { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case 'allTime':
        return { start: new Date(0), end: now }; // From epoch to now
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  const { start, end } = getDateRange();
  const { data: timeUsage = [], isLoading: timeUsageLoading } = useTimeUsageAnalytics(start, end);
  const { data: studyGoals = [], isLoading: studyGoalsLoading } = useStudyGoalProgress(start, end);

  const totalHours = timeUsage.reduce((sum, item) => sum + item.hours, 0);

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  const dateRangeOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'allTime', label: 'All Time' },
  ];
  const dateRangeLabel = dateRange === 'allTime' ? '(All Time)' : `(${format(start, 'MMM d')} - ${format(end, 'MMM d')})`;

  if (timeUsageLoading || studyGoalsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Analytics
        </h2>
        <DateRangeSelector value={dateRange} onChange={setDateRange} options={dateRangeOptions} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TimeUsagePieChart data={timeUsage} colors={COLORS} dateRangeLabel={dateRangeLabel} totalHours={totalHours} />
        <TimeUsageBarChart data={timeUsage} isMobile={isMobile} colors={COLORS} />
      </div>

      <StudyGoalsProgress studyGoals={studyGoals} loading={studyGoalsLoading} />
    </div>
  );
};
