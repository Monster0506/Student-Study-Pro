export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_all_day: boolean | null
          recurrence_ends_on: string | null
          series_id: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          is_all_day?: boolean | null
          recurrence_ends_on?: string | null
          series_id?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_all_day?: boolean | null
          recurrence_ends_on?: string | null
          series_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          default_reminder_minutes: number
          pomodoro_work_minutes: number
          pomodoro_short_break_minutes: number
          pomodoro_long_break_minutes: number
          pomodoro_cycles_before_long_break: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          theme?: string
          default_reminder_minutes?: number
          pomodoro_work_minutes?: number
          pomodoro_short_break_minutes?: number
          pomodoro_long_break_minutes?: number
          pomodoro_cycles_before_long_break?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          theme?: string
          default_reminder_minutes?: number
          pomodoro_work_minutes?: number
          pomodoro_short_break_minutes?: number
          pomodoro_long_break_minutes?: number
          pomodoro_cycles_before_long_break?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 
