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
  // First delete related event_calendars entries
  const { error: relError } = await supabase
    .from('event_calendars')
    .delete()
    .eq('event_id', id);

  if (relError) throw relError;

  // Then delete the event itself
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
      status: 'goedgekeurd',
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
      status: 'afgewezen',
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

// ============ ADVANCED EVENT OPERATIONS ============

export async function copyEventToMultipleDates(
  eventId: string,
  targetDates: string[],
  schoolYear: string
) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  // Get the original event with calendar relationships
  const { data: originalEvent, error: fetchError } = await supabase
    .from('events')
    .select(`
      *,
      event_calendars (calendar_id)
    `)
    .eq('id', eventId)
    .single();

  if (fetchError || !originalEvent) {
    console.error('Error fetching original event:', fetchError);
    throw fetchError || new Error('Event not found');
  }

  // Calculate time offset from original date to each target date
  const originalStart = new Date(originalEvent.start_datetime);
  const originalEnd = new Date(originalEvent.end_datetime);
  const duration = originalEnd.getTime() - originalStart.getTime();

  const createdEvents = [];

  for (const targetDateStr of targetDates) {
    const targetDate = new Date(targetDateStr);
    const newStartTime = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      originalStart.getHours(),
      originalStart.getMinutes(),
      originalStart.getSeconds()
    );
    const newEndTime = new Date(newStartTime.getTime() + duration);

    // Create new event
    const newEvent = {
      title: originalEvent.title,
      description: originalEvent.description,
      start_datetime: newStartTime.toISOString(),
      end_datetime: newEndTime.toISOString(),
      all_day: originalEvent.all_day,
      location: originalEvent.location,
      audience: originalEvent.audience,
      category: originalEvent.category,
      school_year: schoolYear,
      status: 'approved',
      created_by: originalEvent.created_by,
      approved_by: originalEvent.approved_by,
      approved_at: new Date().toISOString()
    };

    const { data: createdEvent, error: createError } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single();

    if (createError || !createdEvent) {
      console.error('Error creating event copy:', createError);
      continue; // Skip this date but continue with others
    }

    // Copy calendar relationships
    if (originalEvent.event_calendars && originalEvent.event_calendars.length > 0) {
      const eventCalendars = originalEvent.event_calendars.map((ec: any) => ({
        event_id: createdEvent.id,
        calendar_id: ec.calendar_id
      }));

      const { error: calendarError } = await supabase
        .from('event_calendars')
        .insert(eventCalendars);

      if (calendarError) {
        console.error('Error creating event_calendars for copy:', calendarError);
      }
    }

    createdEvents.push(createdEvent);
  }

  return createdEvents;
}

export async function batchCreateEvents(
  eventTemplate: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    location?: string;
    audience?: string;
    category?: string;
    calendar_ids: string[];
  },
  dates: string[],
  schoolYear: string = '2026-2027'
) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  const user = await getCurrentUser();
  const createdEvents = [];

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    
    let startDatetime: Date;
    let endDatetime: Date;

    if (eventTemplate.all_day) {
      startDatetime = new Date(date.setHours(0, 0, 0, 0));
      endDatetime = new Date(date.setHours(23, 59, 59, 999));
    } else {
      const [startHour, startMinute] = eventTemplate.start_time.split(':').map(Number);
      const [endHour, endMinute] = eventTemplate.end_time.split(':').map(Number);
      
      startDatetime = new Date(date);
      startDatetime.setHours(startHour, startMinute, 0, 0);
      
      endDatetime = new Date(date);
      endDatetime.setHours(endHour, endMinute, 0, 0);
    }

    // Create event
    const newEvent = {
      title: eventTemplate.title,
      description: eventTemplate.description || null,
      start_datetime: startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      all_day: eventTemplate.all_day,
      location: eventTemplate.location || null,
      audience: eventTemplate.audience || null,
      category: eventTemplate.category || null,
      school_year: schoolYear,
      status: 'approved',
      created_by: user.id,
      approved_by: user.id,
      approved_at: new Date().toISOString()
    };

    const { data: createdEvent, error: createError } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single();

    if (createError || !createdEvent) {
      console.error('Error creating batch event:', createError);
      continue;
    }

    // Create calendar relationships
    const eventCalendars = eventTemplate.calendar_ids.map(calendarId => ({
      event_id: createdEvent.id,
      calendar_id: calendarId
    }));

    const { error: calendarError } = await supabase
      .from('event_calendars')
      .insert(eventCalendars);

    if (calendarError) {
      console.error('Error creating event_calendars for batch:', calendarError);
    }

    createdEvents.push(createdEvent);
  }

  return createdEvents;
}
