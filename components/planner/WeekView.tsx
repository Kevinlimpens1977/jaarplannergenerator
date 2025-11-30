'use client';

import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { formatDateHeader } from '@/lib/utils/dateUtils';
import type { EventWithDetails } from '@/lib/types/database';
import EventChip from './EventChip';

interface WeekViewProps {
  weekDates: Date[];
  events: EventWithDetails[];
  selectedCalendarIds: string[];
}

export default function WeekView({ weekDates, events, selectedCalendarIds }: WeekViewProps) {
  // Filter events based on selected calendars
  const filteredEvents = events.filter((event) =>
    event.event_calendars.some((ec) =>
      selectedCalendarIds.includes(ec.calendar_id)
    )
  );

  // Group events by day
  const getEventsForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    return filteredEvents.filter((event) => {
      const eventStart = parseISO(event.start_datetime);
      const eventEnd = parseISO(event.end_datetime);

      // Check if event overlaps with this day
      return (
        isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
        (eventStart <= dayStart && eventEnd >= dayEnd)
      );
    });
  };

  if (selectedCalendarIds.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">
          Selecteer minimaal één kalender om activiteiten te zien.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDates.map((date) => {
          const dayEvents = getEventsForDay(date);
          const isToday = isWithinInterval(new Date(), {
            start: startOfDay(date),
            end: endOfDay(date),
          });

          return (
            <div key={date.toISOString()} className="bg-white min-h-[300px]">
              <div
                className={`p-3 border-b-2 ${
                  isToday ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                  {formatDateHeader(date)}
                </div>
              </div>
              <div className="p-3">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Geen activiteiten</p>
                ) : (
                  dayEvents.map((event) => (
                    <EventChip key={event.id} event={event} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
