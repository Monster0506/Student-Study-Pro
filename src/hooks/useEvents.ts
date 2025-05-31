
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventType } from '@/types/event';
import { useToast } from '@/hooks/use-toast';

interface DatabaseEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: EventType;
  description?: string;
  is_all_day?: boolean;
  series_id?: string;
  recurrence_ends_on?: string;
}

const transformDatabaseEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  start: new Date(dbEvent.start_time),
  end: new Date(dbEvent.end_time),
  type: dbEvent.event_type as EventType,
  description: dbEvent.description,
  isAllDay: dbEvent.is_all_day,
});

export const useEvents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

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
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDatabaseEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Event) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          start_time: eventData.start.toISOString(),
          end_time: eventData.end.toISOString(),
          event_type: eventData.type,
          description: eventData.description,
          is_all_day: eventData.isAllDay,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDatabaseEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
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
