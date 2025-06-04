import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { useCategories } from '@/hooks/useCategories';
import { usePreferences } from '@/hooks/usePreferences';
import { CategoryModal } from '@/components/CategoryModal';
import { EventCategory } from '@/types';
import { fetchCanvasCourses, fetchCanvasAssignments, fetchCanvasQuizzes, fetchCanvasAnnouncements } from '@/lib/canvas';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import { EventCategoriesSection } from '@/components/settings/EventCategoriesSection';
import { ReminderSettingsSection } from '@/components/settings/ReminderSettingsSection';
import { CanvasIntegrationSection } from '@/components/settings/CanvasIntegrationSection';

const Settings = () => {
  const { user, loading } = useAuth();
  const { categories, deleteCategory } = useCategories();
  const { preferences, updatePreferences } = usePreferences();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [reminderSettings, setReminderSettings] = useState({
    defaultReminderMinutes: preferences?.defaultReminderMinutes || 15,
  });

  // Canvas Integration state
  const [canvasUrl, setCanvasUrl] = useState('');
  const [canvasToken, setCanvasToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isPreviewed, setIsPreviewed] = useState(false);

  const { createCourse, courses: localCourses } = useCourses();
  const { createEvent, events: localEvents } = useEvents();
  const [coursesRefreshed, setCoursesRefreshed] = useState(false);

  if (loading) {
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

  // Handlers for modular sections
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };
  const handleEditCategory = (category: EventCategory) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };
  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? Events using this category will be uncategorized.')) {
      deleteCategory(categoryId);
    }
  };
  const handleSaveReminderSettings = () => {
    updatePreferences(reminderSettings);
  };
  const handleConnectCanvas = async () => {
    if (!canvasUrl || !canvasToken) {
      setImportError('Please enter both your Canvas URL and API token.');
      return;
    }
    setImportLoading(true);
    setImportError(null);
    try {
      const res = await fetch(`/api/canvas-proxy?status=1&token=${encodeURIComponent(canvasToken)}&baseUrl=${encodeURIComponent(canvasUrl)}`);
      const data = await res.json();
      if (!data.ok) {
        setImportError(data.error || 'Failed to connect to Canvas.');
        setIsConnected(false);
        setImportLoading(false);
        return;
      }
      setIsConnected(true);
      setImportError(null);
    } catch (err: any) {
      setImportError('Failed to connect to Canvas.');
      setIsConnected(false);
    }
    setImportLoading(false);
  };
  const handleImportCanvas = async () => {
    setImportLoading(true);
    setImportError(null);
    setImportPreview([]);
    setIsPreviewed(false);
    try {
      let courses = await fetchCanvasCourses(canvasUrl, canvasToken);
      if (typeof courses === 'string') {
        courses = JSON.parse(courses);
      }
      type CanvasCourse = { id: number|string, name?: string, course_code?: string };
      const typedCourses: CanvasCourse[] = Array.isArray(courses)
        ? (courses as any[]).filter(c => typeof c === 'object' && c !== null && 'id' in c && !c.access_restricted_by_date)
        : [];
      const allItems = [];
      for (const course of typedCourses) {
        const courseId = course.id;
        const assignments = await fetchCanvasAssignments(canvasUrl, canvasToken, courseId);
        assignments
          .filter((a: any) => a.due_at)
          .forEach((a: any) => {
            allItems.push({
              id: a.id,
              title: a.name,
              due_at: a.due_at,
              course: course.name || course.course_code || 'Unknown Course',
              description: a.description || '',
              type: 'CLASS',
              canvas_id: String(a.id),
              canvas_type: 'assignment',
            });
          });
        const quizzes = await fetchCanvasQuizzes(canvasUrl, canvasToken, courseId);
        quizzes
          .filter((q: any) => q.due_at)
          .forEach((q: any) => {
            allItems.push({
              id: `quiz-${q.id}`,
              title: q.title,
              due_at: q.due_at,
              course: course.name || course.course_code || 'Unknown Course',
              description: q.description || '',
              type: 'QUIZ',
              canvas_id: String(q.id),
              canvas_type: 'quiz',
            });
          });
        const announcements = await fetchCanvasAnnouncements(canvasUrl, canvasToken, courseId);
        announcements
          .filter((a: any) => a.posted_at)
          .forEach((a: any) => {
            allItems.push({
              id: `announcement-${a.id}`,
              title: a.title,
              due_at: a.posted_at,
              course: course.name || course.course_code || 'Unknown Course',
              description: a.message || '',
              type: 'CLASS',
              canvas_id: String(a.id),
              canvas_type: 'announcement',
            });
          });
      }
      setImportPreview(allItems);
      setIsPreviewed(true);
      setImportLoading(false);
    } catch (err: any) {
      setImportError(err.message || 'Failed to import from Canvas.');
      setImportLoading(false);
    }
  };
  const handleConfirmImport = async () => {
    if (!importPreview.length) return;
    setImportLoading(true);
    setImportError(null);
    try {
      let courses = await fetchCanvasCourses(canvasUrl, canvasToken);
      if (typeof courses === 'string') {
        courses = JSON.parse(courses);
      }
      const typedCourses = Array.isArray(courses)
        ? (courses as any[]).filter(c => typeof c === 'object' && c !== null && 'id' in c && !c.access_restricted_by_date)
        : [];
      for (const course of typedCourses) {
        const alreadyExists = localCourses.some(localCourse =>
          localCourse.canvas_id === String(course.id)
        );
        if (alreadyExists) continue;
        await new Promise(resolve => setTimeout(resolve, 100));
        createCourse({
          name: course.name || course.course_code || 'Untitled Course',
          code: course.course_code,
          instructor: '',
          colorHex: '#8888ff',
          canvas_id: String(course.id),
        });
      }
      setCoursesRefreshed(false);
      let retries = 0;
      while ((!localCourses || localCourses.length < typedCourses.length) && retries < 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        retries++;
      }
      setCoursesRefreshed(true);
      const courseMap: Record<string, string> = {};
      for (const localCourse of localCourses) {
        if (localCourse.name) courseMap[localCourse.name] = localCourse.id;
        if (localCourse.code) courseMap[localCourse.code] = localCourse.id;
      }
      for (const item of importPreview) {
        let courseId: string | undefined = undefined;
        if (item.course && courseMap[item.course]) {
          courseId = courseMap[item.course];
        }
        if (!courseId) continue;
        const alreadyExists = localEvents.some(ev =>
          ev.canvas_id === item.canvas_id
        );
        if (alreadyExists) continue;
        await new Promise(resolve => setTimeout(resolve, 100));
        const end = new Date(item.due_at);
        const start = new Date(end.getTime() - 60 * 60 * 1000);
        createEvent({
          title: item.title,
          start,
          end,
          type: item.type,
          description: item.description || '',
          isAllDay: false,
          courseId,
          categoryId: undefined,
          rruleString: undefined,
          reminderSettings: [],
          canvas_id: item.canvas_id,
          canvas_type: item.canvas_type,
        });
      }
      setImportLoading(false);
      setImportError(null);
      alert('Import complete!');
    } catch (err: any) {
      setImportLoading(false);
      setImportError(err.message || 'Failed to import Canvas data.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-8 px-2 sm:px-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <EventCategoriesSection
        categories={categories}
        onAdd={handleAddCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />
      <ReminderSettingsSection
        defaultReminderMinutes={reminderSettings.defaultReminderMinutes}
        onChange={minutes => setReminderSettings({ ...reminderSettings, defaultReminderMinutes: minutes })}
        onSave={handleSaveReminderSettings}
      />
      <CanvasIntegrationSection
        canvasUrl={canvasUrl}
        canvasToken={canvasToken}
        isConnected={isConnected}
        isPreviewed={isPreviewed}
        importLoading={importLoading}
        importError={importError}
        importPreview={importPreview}
        onUrlChange={setCanvasUrl}
        onTokenChange={setCanvasToken}
        onConnect={handleConnectCanvas}
        onPreview={handleImportCanvas}
        onImport={handleConfirmImport}
        onRemovePreviewItem={idx => setImportPreview(prev => prev.filter((_, i) => i !== idx))}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
};

export default Settings;
