import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create default preferences
        const defaultPrefs: UserPreferences = {
          theme: 'system',
          defaultReminderMinutes: 15,
          pomodoroWorkMinutes: 25,
          pomodoroShortBreakMinutes: 5,
          pomodoroLongBreakMinutes: 15,
          pomodoroCyclesBeforeLongBreak: 4,
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userData.user.id,
            theme: defaultPrefs.theme,
            default_reminder_minutes: defaultPrefs.defaultReminderMinutes,
            pomodoro_work_minutes: defaultPrefs.pomodoroWorkMinutes,
            pomodoro_short_break_minutes: defaultPrefs.pomodoroShortBreakMinutes,
            pomodoro_long_break_minutes: defaultPrefs.pomodoroLongBreakMinutes,
            pomodoro_cycles_before_long_break: defaultPrefs.pomodoroCyclesBeforeLongBreak,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return defaultPrefs;
      }

      // Transform database column names to camelCase
      return {
        theme: data.theme,
        defaultReminderMinutes: data.default_reminder_minutes,
        pomodoroWorkMinutes: data.pomodoro_work_minutes,
        pomodoroShortBreakMinutes: data.pomodoro_short_break_minutes,
        pomodoroLongBreakMinutes: data.pomodoro_long_break_minutes,
        pomodoroCyclesBeforeLongBreak: data.pomodoro_cycles_before_long_break,
      } as UserPreferences;
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefsData: Partial<UserPreferences>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Transform camelCase to snake_case for database
      const dbData = {
        user_id: userData.user.id,
        theme: prefsData.theme,
        default_reminder_minutes: prefsData.defaultReminderMinutes,
        pomodoro_work_minutes: prefsData.pomodoroWorkMinutes,
        pomodoro_short_break_minutes: prefsData.pomodoroShortBreakMinutes,
        pomodoro_long_break_minutes: prefsData.pomodoroLongBreakMinutes,
        pomodoro_cycles_before_long_break: prefsData.pomodoroCyclesBeforeLongBreak,
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(dbData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast({
        title: "Success",
        description: "Preferences updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};
