import { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { useCourses } from '@/hooks/useCourses';
import { CourseModal } from '@/components/CourseModal';
import { StudyGoalModal } from '@/components/StudyGoalModal';
import { Course } from '@/types';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { CourseCard } from '@/components/courses/CourseCard';
import { EmptyCoursesCard } from '@/components/courses/EmptyCoursesCard';

const Courses = () => {
  const { user, loading } = useAuth();
  const { courses, deleteCourse, isLoading } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm 
        onToggleMode={() => setIsSignUp(!isSignUp)}
        isSignUp={isSignUp}
      />
    );
  }

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This will remove it from all associated events and tasks.')) {
      deleteCourse(courseId);
    }
  };

  const handleSetStudyGoal = (course: Course) => {
    setSelectedCourse(course);
    setIsGoalModalOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Course Management</h1>
          <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <EmptyCoursesCard onAddCourse={handleAddCourse} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onSetGoal={handleSetStudyGoal}
              />
            ))}
          </div>
        )}

        <CourseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
        />

        <StudyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
        />
      </div>
    </TooltipProvider>
  );
};

export default Courses;
