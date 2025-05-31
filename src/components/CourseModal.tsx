
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
import { useCourses } from '@/hooks/useCourses';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
}

export const CourseModal = ({ isOpen, onClose, course }: CourseModalProps) => {
  const { createCourse, updateCourse } = useCourses();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instructor: '',
    colorHex: '#10B981',
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code || '',
        instructor: course.instructor || '',
        colorHex: course.colorHex,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        instructor: '',
        colorHex: '#10B981',
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = {
      name: formData.name,
      code: formData.code || undefined,
      instructor: formData.instructor || undefined,
      colorHex: formData.colorHex,
    };

    if (course) {
      updateCourse({ ...courseData, id: course.id });
    } else {
      createCourse(courseData);
    }

    onClose();
  };

  const colorOptions = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4',
    '#84CC16', '#EC4899', '#6366F1', '#F97316', '#14B8A6', '#A855F7'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Edit Course' : 'Add Course'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Introduction to Chemistry"
              required
            />
          </div>

          <div>
            <Label htmlFor="code">Course Code (Optional)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CHEM101"
            />
          </div>

          <div>
            <Label htmlFor="instructor">Instructor (Optional)</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="e.g. Dr. Smith"
            />
          </div>

          <div>
            <Label>Course Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.colorHex === color ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, colorHex: color })}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {course ? 'Update Course' : 'Add Course'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
