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
      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="text-dacapo-blue-100 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen kalenders geselecteerd</h3>
        <p className="text-gray-500">
          Selecteer minimaal één kalender in de filters om activiteiten te zien.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`grid gap-px bg-gray-200 ${weekDates.length === 5 ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-7'}`}>
        {weekDates.map((date) => {
          const dayEvents = getEventsForDay(date);
          const isToday = isWithinInterval(new Date(), {
            start: startOfDay(date),
            end: endOfDay(date),
          });

          return (
            <div key={date.toISOString()} className="bg-white min-h-[200px] md:min-h-[400px] flex flex-col">
              <div
                className={`p-4 border-b ${
                  isToday 
                    ? 'bg-dacapo-blue-50 border-dacapo-blue-200' 
                    : 'bg-gray-50/50 border-gray-100'
                }`}
              >
                <div className={`font-semibold text-sm md:text-base ${isToday ? 'text-dacapo-blue-600' : 'text-gray-700'}`}>
                  <div className="capitalize">{formatDateHeader(date).dayName}</div>
                  <div className="text-xs md:text-sm font-normal text-gray-500 mt-0.5">
                    {formatDateHeader(date).date}
                  </div>
                </div>
              </div>
              <div className="p-3 flex-1 space-y-2">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-300 italic">Geen activiteiten</p>
                  </div>
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
