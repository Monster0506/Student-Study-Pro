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
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="lastWeek">Last Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="allTime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Time Usage Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Time Distribution {dateRange === 'allTime' ? '(All Time)' : `(${format(start, 'MMM d')} - ${format(end, 'MMM d')})`}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {totalHours.toFixed(1)} hours
            </p>
          </CardHeader>
          <CardContent>
            {timeUsage.length > 0 ? (
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoryName, hours, percent }) => 
                        `${categoryName}: ${hours.toFixed(1)}h (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="hours"
                    >
                      {timeUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.colorHex || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No events found for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Usage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Hours by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {timeUsage.length > 0 ? (
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="categoryName" 
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No events found for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Study Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {studyGoalsLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading goals...
            </div>
          ) : studyGoals.length > 0 ? (
            <div className="space-y-4">
              {studyGoals.map((goal) => (
                <div key={goal.courseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.courseName}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.actualHours.toFixed(1)} / {goal.targetHours} hours
                    </span>
                  </div>
                  <Progress 
                    value={goal.progress} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No study goals set
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
