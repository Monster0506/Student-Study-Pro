
export type EventType = 'CLASS' | 'STUDY' | 'PERSONAL' | 'APPOINTMENT';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  description?: string;
  isAllDay?: boolean;
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
