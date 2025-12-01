import { supabase } from './client';
import type { Event, EventWithDetails, Calendar, User, PlannerFilters } from '@/lib/types/database';

// ============ CALENDARS ============

export async function getCalendars() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your .env.local file.');
  }
  
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
  return data as Calendar[];
}

export async function getCalendarByCode(code: string) {
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) throw error;
  return data as Calendar;
}

// ============ EVENTS ============

export async function getEvents(filters?: PlannerFilters & { includeAllStatuses?: boolean }) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your .env.local file.');
  }
  
  let query = supabase
    .from('events')
    .select(`
      *,
      event_calendars (
        calendar_id,
        calendars (*)
      ),
      creator:created_by (name, email),
      approver:approved_by (name, email)
    `);

  // Only filter by status if not explicitly requesting all statuses
  if (!filters?.includeAllStatuses) {
    query = query.eq('status', 'goedgekeurd');
  }

  if (filters?.school_year) {
    query = query.eq('school_year', filters.school_year);
  }

  if (filters?.start_date && filters?.end_date) {
    query = query
      .gte('start_datetime', filters.start_date)
      .lte('start_datetime', filters.end_date);
  }

  query = query.order('start_datetime', { ascending: true });

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  return data as EventWithDetails[];
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_calendars (
        calendar_id,
        calendars (*)
      ),
      creator:created_by (name, email),
      approver:approved_by (name, email)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as EventWithDetails;
}

export async function getEventsByStatus(status: 'ingediend' | 'goedgekeurd' | 'afgewezen') {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_calendars (
        calendar_id,
        calendars (*)
      ),
      creator:created_by (name, email)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as EventWithDetails[];
}

export async function createEvent(
  eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>,
  calendarIds: string[]
) {
  // Insert event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert(eventData as any)
    .select()
    .single();

  if (eventError) throw eventError;

  // Insert event_calendars relations
  const eventCalendars = calendarIds.map(calendar_id => ({
    event_id: (event as any).id,
    calendar_id
  }));

  const { error: relError } = await supabase
    .from('event_calendars')
    .insert(eventCalendars as any);

  if (relError) throw relError;

  return event as Event;
}

export async function updateEvent(
  id: string,
  eventData: Partial<Event>,
  calendarIds?: string[]
) {
  // Update event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .update(eventData as any)
    .eq('id', id)
    .select()
    .single();

  if (eventError) throw eventError;

  // Update calendars if provided
  if (calendarIds) {
    // Delete existing relations
    await supabase
      .from('event_calendars')
      .delete()
      .eq('event_id', id);

    // Insert new relations
    const eventCalendars = calendarIds.map(calendar_id => ({
      event_id: id,
      calendar_id
    }));

    const { error: relError } = await supabase
      .from('event_calendars')
      .insert(eventCalendars as any);

    if (relError) throw relError;
  }

  return event as Event;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function approveEvent(eventId: string, approverId: string, comment?: string) {
  // Update event status
  const { data: event, error: eventError } = await supabase
    .from('events')
    .update({
      status: 'goedgekeurd' as any,
      approved_by: approverId
    } as any)
    .eq('id', eventId)
    .select()
    .single();

  if (eventError) throw eventError;

  // Log approval
  const { error: logError } = await supabase
    .from('approvals_log')
    .insert({
      event_id: eventId,
      approver_id: approverId,
      action: 'goedgekeurd',
      comment
    } as any);

  if (logError) throw logError;

  return event as Event;
}

export async function rejectEvent(eventId: string, approverId: string, comment?: string) {
  // Update event status
  const { data: event, error: eventError } = await supabase
    .from('events')
    .update({
      status: 'afgewezen' as any,
      approved_by: approverId
    } as any)
    .eq('id', eventId)
    .select()
    .single();

  if (eventError) throw eventError;

  // Log rejection
  const { error: logError } = await supabase
    .from('approvals_log')
    .insert({
      event_id: eventId,
      approver_id: approverId,
      action: 'afgewezen',
      comment
    } as any);

  if (logError) throw logError;

  return event as Event;
}

// ============ USERS ============

export async function getCurrentUser() {
  // Dit is een placeholder voor echte auth
  // Later vervangen door Supabase Auth
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@dacapo.nl')
    .single();
  
  if (error) {
    // Return a mock user for development
    return {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Test User',
      email: 'test@dacapo.nl',
      role: 'admin' as const,
      department: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as User;
  }
  
  return data as User;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as User;
}
