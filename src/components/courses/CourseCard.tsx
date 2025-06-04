import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, BookOpen } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onSetGoal: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete, onSetGoal }) => {
  return (
    <Card className="group relative border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-xl transition-shadow p-0">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-6 pl-6 pr-6">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow border-4" style={{ backgroundColor: course.colorHex, borderColor: 'var(--card-bg, #fff)' }}>
          {course.name?.[0]?.toUpperCase() || <BookOpen className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-xl font-extrabold leading-tight text-gray-900 dark:text-gray-100 truncate">
            {course.name}
          </CardTitle>
          {course.code && (
            <div className="text-sm text-blue-700 dark:text-blue-300 font-mono truncate mt-0.5">
              {course.code}
            </div>
          )}
          {course.instructor && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              Instructor: {course.instructor}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0 pb-4 px-6">
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetGoal(course)}
            className="w-auto px-3 py-1 text-xs font-semibold border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800"
          >
            Set Study Goal
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(course)}
                className="hover:bg-blue-100 dark:hover:bg-gray-800 p-1"
                aria-label="Edit Course"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Course</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(course.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-gray-800 p-1"
                aria-label="Delete Course"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Course</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}; 