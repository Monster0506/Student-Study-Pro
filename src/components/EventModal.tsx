
import { useState, useEffect } from 'react';
import { X, Trash2, Repeat } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Event, EventType, EVENT_TYPE_LABELS } from '@/types';
import { RecurrenceModal, RecurrenceSettings } from './RecurrenceModal';
import { useCategories } from '@/hooks/useCategories';
import { useCourses } from '@/hooks/useCourses';
import { usePreferences } from '@/hooks/usePreferences';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  selectedDate?: Date | null;
  onSave: (event: Omit<Event, 'id'>, recurrence?: RecurrenceSettings) => void;
  onDelete?: () => void;
}

export const EventModal = ({ 
  isOpen, 
  onClose, 
  event, 
  selectedDate, 
  onSave, 
  onDelete 
}: EventModalProps) => {
  const { categories } = useCategories();
  const { courses } = useCourses();
  const { preferences } = usePreferences();

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    courseId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
    isAllDay: false,
    reminderMinutes: preferences?.defaultReminderMinutes || 15,
  });

  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);
  const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettings>({
    frequency: 'none',
    interval: 1,
    daysOfWeek: [],
  });

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title,
        categoryId: event.categoryId || '',
        courseId: event.courseId || '',
        startDate: format(event.start, 'yyyy-MM-dd'),
        startTime: format(event.start, 'HH:mm'),
        endDate: format(event.end, 'yyyy-MM-dd'),
        endTime: format(event.end, 'HH:mm'),
        description: event.description || '',
        isAllDay: event.isAllDay || false,
        reminderMinutes: event.reminderSettings?.[0]?.minutesBefore || preferences?.defaultReminderMinutes || 15,
      });
    } else if (selectedDate) {
      // Creating new event
      const defaultEndTime = new Date(selectedDate.getTime() + 60 * 60 * 1000); // 1 hour later
      const defaultCategory = categories.find(c => c.name === 'Class');
      
      setFormData({
        title: '',
        categoryId: defaultCategory?.id || '',
        courseId: '',
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: format(selectedDate, 'HH:mm'),
        endDate: format(selectedDate, 'yyyy-MM-dd'),
        endTime: format(defaultEndTime, 'HH:mm'),
        description: '',
        isAllDay: false,
        reminderMinutes: preferences?.defaultReminderMinutes || 15,
      });
    }
  }, [event, selectedDate, categories, preferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    // Find the selected category to get the type
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    const eventType: EventType = selectedCategory?.name.toUpperCase() as EventType || 'PERSONAL';

    const eventData = {
      title: formData.title,
      start: startDateTime,
      end: endDateTime,
      type: eventType,
      description: formData.description,
      isAllDay: formData.isAllDay,
      categoryId: formData.categoryId || undefined,
      courseId: formData.courseId || undefined,
      reminderSettings: formData.reminderMinutes > 0 ? [{ minutesBefore: formData.reminderMinutes }] : [],
    };

    onSave(eventData, recurrenceSettings.frequency !== 'none' ? recurrenceSettings : undefined);
  };

  const getRecurrenceDescription = () => {
    if (recurrenceSettings.frequency === 'none') return 'Does not repeat';
    
    const intervalText = recurrenceSettings.interval === 1 ? '' : `every ${recurrenceSettings.interval} `;
    const frequencyText = recurrenceSettings.frequency === 'daily' ? 'day' :
                         recurrenceSettings.frequency === 'weekly' ? 'week' : 'month';
    
    return `Repeats ${intervalText}${frequencyText}${recurrenceSettings.interval > 1 ? 's' : ''}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {event ? 'Edit Event' : 'Create Event'}
              {event && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.colorHex }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course">Course (Optional)</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="">No course</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} {course.code && `(${course.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={formData.isAllDay}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isAllDay: checked as boolean })
                }
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  disabled={formData.isAllDay}
                  required={!formData.isAllDay}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  disabled={formData.isAllDay}
                  required={!formData.isAllDay}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reminder">Reminder (minutes before)</Label>
              <Select
                value={formData.reminderMinutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, reminderMinutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!event && (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsRecurrenceOpen(true)}
                >
                  <Repeat className="mr-2 h-4 w-4" />
                  {getRecurrenceDescription()}
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add notes or description"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {event ? 'Update Event' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <RecurrenceModal
        isOpen={isRecurrenceOpen}
        onClose={() => setIsRecurrenceOpen(false)}
        onSave={setRecurrenceSettings}
        initialSettings={recurrenceSettings}
      />
    </>
  );
};
