import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Course } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StudyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
}

export const StudyGoalModal = ({ isOpen, onClose, course }: StudyGoalModalProps) => {
  const queryClient = useQueryClient();
  const [targetHours, setTargetHours] = useState('');

  // Get existing goal for this course
  const { data: existingGoal } = useQuery({
    queryKey: ['study-goal', course?.id],
    queryFn: async () => {
      if (!course) return null;
      
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('course_id', course.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!course && isOpen,
  });

  useEffect(() => {
    if (existingGoal) {
      setTargetHours(existingGoal.target_hours_weekly.toString());
    } else {
      setTargetHours('');
    }
  }, [existingGoal]);

  const saveGoalMutation = useMutation({
    mutationFn: async () => {
      if (!course) throw new Error('No course selected');
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const hours = parseFloat(targetHours);
      if (isNaN(hours) || hours <= 0) {
        throw new Error('Please enter a valid number of hours');
      }

      if (existingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('study_goals')
          .update({ target_hours_weekly: hours })
          .eq('id', existingGoal.id);

        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await supabase
          .from('study_goals')
          .insert({
            user_id: userData.user.id,
            course_id: course.id,
            target_hours_weekly: hours,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goal'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast("Study goal created successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast(error.message || "Failed to create study goal");
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async () => {
      if (!existingGoal) return;
      
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', existingGoal.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goal'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast("Study goal deleted successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast(error.message || "Failed to delete study goal");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoalMutation.mutate();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this study goal?')) {
      deleteGoalMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>
            Set Study Goal for {course?.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="targetHours">Weekly Study Hours Target</Label>
            <Input
              id="targetHours"
              type="number"
              step="0.5"
              min="0.5"
              max="50"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="e.g. 10.5"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              How many hours per week do you want to study for this course?
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={saveGoalMutation.isPending}
            >
              {existingGoal ? 'Update Goal' : 'Set Goal'}
            </Button>
            {existingGoal && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteGoalMutation.isPending}
              >
                Remove
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
