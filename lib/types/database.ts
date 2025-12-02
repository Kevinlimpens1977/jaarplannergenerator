// TypeScript types voor het datamodel

export type UserRole = 'viewer' | 'contributor' | 'approver' | 'admin';
export type EventStatus = 'concept' | 'ingediend' | 'goedgekeurd' | 'afgewezen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface Calendar {
  id: string;
  name: string;
  code: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  uid: string;
  title: string;
  description: string | null;
  school_year: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  category: string | null;
  location: string | null;
  audience: string | null;
  status: EventStatus;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventCalendar {
  id: string;
  event_id: string;
  calendar_id: string;
}

export interface ApprovalsLog {
  id: string;
  event_id: string;
  approver_id: string;
  action: 'goedgekeurd' | 'afgewezen';
  comment: string | null;
  created_at: string;
}

// Extended types met relaties
export interface EventWithCalendars extends Event {
  calendars?: Calendar[];
  creator?: User;
  approver?: User;
}

export interface EventWithDetails extends Event {
  event_calendars: {
    calendar_id: string;
    calendars: Calendar;
  }[];
  creator?: User;
  approver?: User;
}

// Formulier types
export interface EventFormData {
  uid?: string;
  title: string;
  description: string;
  school_year: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  category: string;
  location: string;
  audience: string;
  calendar_ids: string[];
}

// Filter types
export interface PlannerFilters {
  school_year: string;
  calendar_ids: string[];
  categories?: string[];
  start_date?: string;
  end_date?: string;
}

// Database types voor Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      calendars: {
        Row: Calendar;
        Insert: Omit<Calendar, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Calendar, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'uid' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_calendars: {
        Row: EventCalendar;
        Insert: Omit<EventCalendar, 'id'>;
        Update: Partial<Omit<EventCalendar, 'id'>>;
      };
      approvals_log: {
        Row: ApprovalsLog;
        Insert: Omit<ApprovalsLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ApprovalsLog, 'id' | 'created_at'>>;
      };
    };
  };
}
