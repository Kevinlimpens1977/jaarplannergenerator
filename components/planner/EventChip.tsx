'use client';

import Link from 'next/link';
import type { EventWithDetails } from '@/lib/types/database';
import { formatEventTime } from '@/lib/utils/dateUtils';

interface EventChipProps {
  event: EventWithDetails;
}

export default function EventChip({ event }: EventChipProps) {
  // Get the first calendar color (events can be in multiple calendars)
  const primaryCalendar = event.event_calendars[0]?.calendars;
  const backgroundColor = primaryCalendar?.color || '#3B82F6';

  return (
    <Link
      href={`/events/${event.id}`}
      className="block mb-2 p-2 rounded shadow-sm hover:shadow-md transition-shadow text-white text-sm"
      style={{ backgroundColor }}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-xs opacity-90 mt-1">
        {formatEventTime(event.start_datetime, event.end_datetime, event.all_day)}
      </div>
      {event.category && (
        <div className="text-xs opacity-75 mt-1 capitalize">
          {event.category}
        </div>
      )}
    </Link>
  );
}
