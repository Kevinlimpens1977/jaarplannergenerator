'use client';

import Link from 'next/link';
import type { EventWithDetails } from '@/lib/types/database';
import { formatEventTime } from '@/lib/utils/dateUtils';

interface EventChipProps {
  event: EventWithDetails;
  compact?: boolean;
}

export default function EventChip({ event, compact = false }: EventChipProps) {
  // Get the first calendar color (events can be in multiple calendars)
  const primaryCalendar = event.event_calendars[0]?.calendars;
  const backgroundColor = primaryCalendar?.color || '#3B82F6';

  if (compact) {
    return (
      <Link
        href={`/events/${event.id}`}
        className="block group relative"
        title={`${event.title} (${formatEventTime(event.start_datetime, event.end_datetime, event.all_day)})`}
      >
        <div 
          className="flex items-center px-2 py-1 rounded text-xs font-medium text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 truncate"
          style={{ backgroundColor }}
        >
          <span className="truncate">{event.title}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="block group"
    >
      <div 
        className="p-3 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-white border border-white/10"
        style={{ backgroundColor }}
      >
        <div className="font-semibold text-sm truncate leading-tight mb-1">
          {event.title}
        </div>
        
        <div className="flex items-center gap-2 text-xs opacity-90">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            {formatEventTime(event.start_datetime, event.end_datetime, event.all_day)}
          </span>
        </div>

        {event.category && (
          <div className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/20 backdrop-blur-sm uppercase tracking-wide">
            {event.category}
          </div>
        )}
      </div>
    </Link>
  );
}
