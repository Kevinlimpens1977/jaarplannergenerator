'use client';

import { Calendar } from '@/lib/types/database';

interface CalendarFilterProps {
  calendars: Calendar[];
  selectedCalendarIds: string[];
  onCalendarToggle: (calendarId: string) => void;
}

export default function CalendarFilter({
  calendars,
  selectedCalendarIds,
  onCalendarToggle,
}: CalendarFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-700 mb-3">Kalenders</h3>
      <div className="space-y-2">
        {calendars.map((calendar) => (
          <label
            key={calendar.id}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedCalendarIds.includes(calendar.id)}
              onChange={() => onCalendarToggle(calendar.id)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: calendar.color }}
            />
            <span className="text-sm text-gray-700">{calendar.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
