import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventType, ReminderSetting } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface DatabaseEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: string;
  description?: string;
  is_all_day?: boolean;
  series_id?: string;
  recurrence_ends_on?: string;
  category_id?: string;
  course_id?: string;
  rrule_string?: string;
  reminder_settings_json?: any;
  event_categories?: any;
  courses?: any;
  canvas_id?: string;
  canvas_type?: string;
}

const transformDatabaseEvent = (dbEvent: DatabaseEvent): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  start: new Date(dbEvent.start_time),
  end: new Date(dbEvent.end_time),
  type: dbEvent.event_type as EventType,
  description: dbEvent.description,
  isAllDay: dbEvent.is_all_day,
  categoryId: dbEvent.category_id,
  courseId: dbEvent.course_id,
  rruleString: dbEvent.rrule_string,
  reminderSettings: dbEvent.reminder_settings_json || [],
  canvas_id: dbEvent.canvas_id,
  canvas_type: dbEvent.canvas_type,
});

export const useEvents = () => {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery<Event[], PostgrestError>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_categories (*),
          courses (*)
        `)
        .eq('user_id', userData.user.id);

      if (error) throw error;
      return data.map(transformDatabaseEvent);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id'>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          start_time: eventData.start.toISOString(),
          end_time: eventData.end.toISOString(),
          event_type: eventData.type,
          description: eventData.description,
          is_all_day: eventData.isAllDay,
          category_id: eventData.categoryId,
          course_id: eventData.courseId,
          rrule_string: eventData.rruleString,
          reminder_settings_json: (eventData.reminderSettings || []) as any,
          canvas_id: eventData.canvas_id,
          canvas_type: eventData.canvas_type,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDatabaseEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event created successfully!", {
        description: "Your new event has been added to the calander.",
      })
    },
    onError: (error: any) => {
      toast.error("Failed to create event", {
        description: error.message || "An error occured while creating the event.",
      })
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Event) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          start_time: eventData.start.toISOString(),
          end_time: eventData.end.toISOString(),
          event_type: eventData.type,
          description: eventData.description,
          is_all_day: eventData.isAllDay,
          category_id: eventData.categoryId,
          course_id: eventData.courseId,
          rrule_string: eventData.rruleString,
          reminder_settings_json: (eventData.reminderSettings || []) as any,
          canvas_id: eventData.canvas_id,
          canvas_type: eventData.canvas_type,
        })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) throw error;
      return transformDatabaseEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event updated successfully!", {
        description: "Your changes have been saved.",
      })
    },
    onError: (error: any) => {
      toast.error("Failed to update event", {
        description: error.message || "An error occured while updating the event.",
      })
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userData.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event deleted successfully!", {
        description: "The event has been removed from your calander.",
      })
    },
    onError: (error: any) => {
      toast.error("Failed to delete event", {
        description: error.message || "An error occurred while deleting the event.",
      })
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};
