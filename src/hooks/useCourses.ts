import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useCourses = () => {
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map((course: any): Course => ({
        id: course.id,
        name: course.name,
        code: course.code,
        instructor: course.instructor,
        colorHex: course.color_hex,
        canvas_id: course.canvas_id,
      }));
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Omit<Course, 'id'>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('courses')
        .insert({
          name: courseData.name,
          code: courseData.code,
          instructor: courseData.instructor,
          color_hex: courseData.colorHex,
          user_id: userData.user.id,
          canvas_id: courseData.canvas_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast("Course created successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to create course");
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...courseData }: Course) => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          name: courseData.name,
          code: courseData.code,
          instructor: courseData.instructor,
          color_hex: courseData.colorHex,
          canvas_id: courseData.canvas_id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast("Course updated successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to update course");
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast("Course deleted successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to delete course");
    },
  });

  return {
    courses,
    isLoading,
    error,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    deleteCourse: deleteCourseMutation.mutate,
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
    isDeleting: deleteCourseMutation.isPending,
  };
};
