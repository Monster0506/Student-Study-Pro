
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first course to start organizing your schedule and tasks.
            </p>
            <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.colorHex }}
                    />
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.code && (
                  <Badge variant="outline">{course.code}</Badge>
                )}
                {course.instructor && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instructor: {course.instructor}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetStudyGoal(course)}
                  className="w-full"
                >
                  Set Study Goal
                </Button>
              </CardContent>
            </Card>
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
  );
};

export default Courses;
