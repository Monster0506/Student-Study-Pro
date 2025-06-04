import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyCoursesCardProps {
  onAddCourse: () => void;
}

export const EmptyCoursesCard: React.FC<EmptyCoursesCardProps> = ({ onAddCourse }) => (
  <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 border-0">
    <CardContent className="p-12 text-center flex flex-col items-center">
      <BookOpen className="mx-auto h-14 w-14 text-blue-300 dark:text-gray-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No courses yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Add your first course to start organizing your schedule, tasks, and study goals. Courses imported from Canvas will appear here too.
      </p>
      <Button onClick={onAddCourse} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-base font-medium">
        <Plus className="mr-2 h-5 w-5" />
        Add Your First Course
      </Button>
    </CardContent>
  </Card>
); 