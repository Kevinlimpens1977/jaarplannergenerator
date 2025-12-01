'use client';

import { parseISO, isWithinInterval, startOfDay, endOfDay, isSameMonth, format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { EventWithDetails } from '@/lib/types/database';
import EventChip from './EventChip';

interface MonthViewProps {
  monthDates: Date[];
  currentMonth: Date;
  events: EventWithDetails[];
  selectedCalendarIds: string[];
  workweekOnly: boolean;
}

export default function MonthView({ monthDates, currentMonth, events, selectedCalendarIds, workweekOnly }: MonthViewProps) {
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

  const gridCols = workweekOnly ? 'grid-cols-1 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-7';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with day names - Hidden on mobile */}
      <div className={`hidden sm:grid ${gridCols} bg-gray-50 border-b border-gray-200`}>
        {monthDates.slice(0, workweekOnly ? 5 : 7).map((date) => (
          <div key={date.toISOString()} className="p-3 text-center font-semibold text-sm text-gray-600 uppercase tracking-wider">
            {format(date, 'EEEE', { locale: nl })}
          </div>
        ))}
      </div>

      <div className={`grid ${gridCols} gap-px bg-gray-200`}>
        {monthDates.map((date) => {
          const dayEvents = getEventsForDay(date);
          const isToday = isWithinInterval(new Date(), {
            start: startOfDay(date),
            end: endOfDay(date),
          });
          const isCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <div 
              key={date.toISOString()} 
              className={`bg-white min-h-[100px] sm:min-h-[140px] flex flex-col ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}
            >
              <div className="flex items-center justify-between p-2">
                {/* Mobile day name */}
                <span className="sm:hidden text-xs font-medium text-gray-500">
                  {format(date, 'EEE', { locale: nl })}
                </span>
                <div
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday 
                      ? 'bg-dacapo-blue-600 text-white font-bold shadow-sm' 
                      : !isCurrentMonth 
                        ? 'text-gray-400' 
                        : 'text-gray-700 font-medium'
                  }`}
                >
                  {format(date, 'd')}
                </div>
              </div>
              
              <div className="px-2 pb-2 space-y-1 overflow-y-auto max-h-[120px] custom-scrollbar">
                {dayEvents.map((event) => (
                  <EventChip key={event.id} event={event} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}