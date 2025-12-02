import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, createEvent, updateEvent, deleteEvent, approveEvent, rejectEvent } from '@/lib/supabase/queries';
import type { PlannerFilters, Event } from '@/lib/types/database';

// Keys for query caching
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: PlannerFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

// Hook for fetching events
export function useEvents(filters: PlannerFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => getEvents(filters),
    enabled: !!filters.school_year && filters.calendar_ids.length > 0,
  });
}

// Hook for creating an event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventData, calendarIds }: { eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>, calendarIds: string[] }) => 
      createEvent(eventData, calendarIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// Hook for approving an event
export function useApproveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, approverId, comment }: { eventId: string, approverId: string, comment?: string }) =>
      approveEvent(eventId, approverId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// Hook for rejecting an event
export function useRejectEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, approverId, comment }: { eventId: string, approverId: string, comment?: string }) =>
      rejectEvent(eventId, approverId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}