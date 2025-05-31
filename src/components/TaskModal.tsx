import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useCourses } from '@/hooks/useCourses';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export const TaskModal = ({ isOpen, onClose, task }: TaskModalProps) => {
  const { createTask, updateTask } = useTasks();
  const { courses } = useCourses();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'inprogress' | 'done';
    courseId: string;
  }>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    status: 'todo',
    courseId: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
        dueTime: task.dueDate ? format(task.dueDate, 'HH:mm') : '',
        priority: task.priority,
        status: task.status,
        courseId: task.courseId || 'none',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        priority: 'medium',
        status: 'todo',
        courseId: 'none',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let dueDate: Date | undefined;
    if (formData.dueDate) {
      dueDate = new Date(`${formData.dueDate}T${formData.dueTime || '23:59'}`);
    }

    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      dueDate,
      priority: formData.priority,
      status: formData.status,
      courseId: formData.courseId === 'none' ? undefined : formData.courseId,
    };

    if (task) {
      updateTask({ ...taskData, id: task.id, course: task.course });
    } else {
      createTask(taskData);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {task ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes or description"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'todo' | 'inprogress' | 'done') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="course">Course (Optional)</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No course</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} {course.code && `(${course.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                disabled={!formData.dueDate}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
