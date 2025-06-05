import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          course:courses(*)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return data.map((task: any): Task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority,
        status: task.status,
        courseId: task.course_id,
        course: task.course ? {
          id: task.course.id,
          name: task.course.name,
          code: task.course.code,
          instructor: task.course.instructor,
          colorHex: task.course.color_hex,
        } : undefined,
      }));
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'course'>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.dueDate?.toISOString(),
          priority: taskData.priority,
          status: taskData.status,
          course_id: taskData.courseId,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast("Task created successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, course, ...taskData }: Task) => {
      const updateObj: any = {
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.dueDate?.toISOString(),
          priority: taskData.priority,
          status: taskData.status,
        course_id: taskData.courseId === undefined ? null : taskData.courseId,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
