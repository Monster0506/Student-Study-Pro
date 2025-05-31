
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimeUsageData, StudyGoalProgress } from '@/types';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export const useTimeUsageAnalytics = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['analytics', 'time-usage', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async (): Promise<TimeUsageData[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          start_time,
          end_time,
          event_categories!inner(name, color_hex)
        `)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (error) throw error;

      const categoryHours: Record<string, { hours: number; colorHex: string }> = {};

      data.forEach((event: any) => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        const categoryName = event.event_categories.name;
        const colorHex = event.event_categories.color_hex;

        if (!categoryHours[categoryName]) {
          categoryHours[categoryName] = { hours: 0, colorHex };
        }
        categoryHours[categoryName].hours += hours;
      });

      return Object.entries(categoryHours).map(([categoryName, data]) => ({
        categoryName,
        hours: Math.round(data.hours * 100) / 100,
        colorHex: data.colorHex,
      }));
    },
  });
};

export const useStudyGoalProgress = () => {
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  return useQuery({
    queryKey: ['analytics', 'study-goals', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async (): Promise<StudyGoalProgress[]> => {
      // Get active study goals
      const { data: goals, error: goalsError } = await supabase
        .from('study_goals')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('is_active', true);

      if (goalsError) throw goalsError;

      // Get study events for this week
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          start_time,
          end_time,
          course_id,
          event_categories!inner(name)
        `)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .eq('event_categories.name', 'Study');

      if (eventsError) throw eventsError;

      // Calculate actual study hours per course
      const studyHours: Record<string, number> = {};
      events.forEach((event: any) => {
        if (event.course_id) {
          const startTime = new Date(event.start_time);
          const endTime = new Date(event.end_time);
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          if (!studyHours[event.course_id]) {
            studyHours[event.course_id] = 0;
          }
          studyHours[event.course_id] += hours;
        }
      });

      return goals.map((goal: any) => {
        const actualHours = studyHours[goal.course_id] || 0;
        const progress = Math.min((actualHours / goal.target_hours_weekly) * 100, 100);

        return {
          courseId: goal.course_id,
          courseName: goal.course.name,
          targetHours: goal.target_hours_weekly,
          actualHours: Math.round(actualHours * 100) / 100,
          progress: Math.round(progress),
        };
      });
    },
  });
};
