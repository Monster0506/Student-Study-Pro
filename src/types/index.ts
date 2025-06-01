export type EventType = 'CLASS' | 'STUDY' | 'PERSONAL' | 'APPOINTMENT';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  description?: string;
  isAllDay?: boolean;
  categoryId?: string;
  courseId?: string;
  rruleString?: string;
  reminderSettings?: ReminderSetting[];
}

export interface EventCategory {
  id: string;
  name: string;
  colorHex: string;
  isDefault: boolean;
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  instructor?: string;
  colorHex: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'notdone' | 'pending' | 'done' | 'onhold' | 'cancelled' | 'urgent' | 'ambiguous';
  courseId?: string;
  course?: Course;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  pomodorosCompleted?: number;
  courseId?: string;
  taskId?: string;
}

export interface StudyGoal {
  id: string;
  courseId: string;
  targetHoursWeekly: number;
  startDate: Date;
  isActive: boolean;
  course?: Course;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultReminderMinutes: number;
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroCyclesBeforeLongBreak: number;
}

export interface ReminderSetting {
  minutesBefore: number;
}

export interface RecurrenceSettings {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek: number[];
  endDate?: Date;
  occurrences?: number;
  // Advanced monthly recurrence
  monthlyType?: 'dayOfMonth' | 'nthWeekday' | 'lastWeekday';
  nthWeek?: number; // 1=first, 2=second, ... -1=last
  weekday?: number; // 0=Sunday, 1=Monday, ...
  endAfterOccurrences?: number;
}

export interface TimeUsageData {
  categoryName: string;
  hours: number;
  colorHex: string;
}

export interface StudyGoalProgress {
  courseId: string;
  courseName: string;
  targetHours: number;
  actualHours: number;
  progress: number;
}

export const EVENT_TYPE_COLORS = {
  CLASS: 'bg-blue-500',
  STUDY: 'bg-green-500',
  PERSONAL: 'bg-purple-500',
  APPOINTMENT: 'bg-orange-500'
} as const;

export const EVENT_TYPE_LABELS = {
  CLASS: 'Class',
  STUDY: 'Study',
  PERSONAL: 'Personal',
  APPOINTMENT: 'Appointment'
} as const;

export const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-red-600 bg-red-50'
} as const;

export const STATUS_COLORS = {
  todo: 'text-gray-600 bg-gray-50',
  inprogress: 'text-blue-600 bg-blue-50',
  done: 'text-green-600 bg-green-50'
} as const;
