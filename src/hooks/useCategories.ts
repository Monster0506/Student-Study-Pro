import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventCategory } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map((cat: any): EventCategory => ({
        id: cat.id,
        name: cat.name,
        colorHex: cat.color_hex,
        isDefault: cat.is_default,
      }));
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<EventCategory, 'id' | 'isDefault'>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_categories')
        .insert({
          name: categoryData.name,
          color_hex: categoryData.colorHex,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast("Category created successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to create category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: EventCategory) => {
      const { data, error } = await supabase
        .from('event_categories')
        .update({
          name: categoryData.name,
          color_hex: categoryData.colorHex,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast("Category updated successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to update category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('event_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast("Category deleted successfully!");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to delete category");
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
