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

export const Analytics = () => {
  const [dateRange, setDateRange] = useState('thisWeek');
  
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
  const { data: studyGoals = [], isLoading: studyGoalsLoading } = useStudyGoalProgress();

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Usage Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              Time Distribution {dateRange === 'allTime' ? '(All Time)' : `(${format(start, 'MMM d')} - ${format(end, 'MMM d')})`}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Total: {totalHours.toFixed(1)} hours
            </p>
          </CardHeader>
          <CardContent>
            {timeUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoryName, hours, percent }) => 
                      `${categoryName}: ${hours.toFixed(1)}h (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
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
            ) : (
              <div className="text-center py-12 text-gray-500">
                No events found for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Usage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hours by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {timeUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoryName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No events found for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Study Goals Progress (This Week)</CardTitle>
          <p className="text-sm text-gray-600">
            Track your weekly study hour goals per course
          </p>
        </CardHeader>
        <CardContent>
          {studyGoals.length > 0 ? (
            <div className="space-y-4">
              {studyGoals.map((goal) => (
                <div key={goal.courseId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.courseName}</span>
                    <span className="text-sm text-gray-600">
                      {goal.actualHours}h / {goal.targetHours}h
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {goal.progress}% complete
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No study goals set yet.</p>
              <p className="text-sm mt-2">Set up study goals in Course Management to track your progress.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
