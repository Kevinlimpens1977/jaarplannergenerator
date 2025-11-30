'use client';

import { useState } from 'react';
import type { Calendar } from '@/lib/types/database';

interface PlannerFiltersProps {
  calendars: Calendar[];
  selectedCalendarIds: string[];
  onCalendarToggle: (calendarId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function PlannerFilters({
  calendars,
  selectedCalendarIds,
  onCalendarToggle,
  onSelectAll,
  onDeselectAll,
}: PlannerFiltersProps) {
  const allSelected = selectedCalendarIds.length === calendars.length;
  const noneSelected = selectedCalendarIds.length === 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Alles selecteren
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Alles deselecteren
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {calendars.map((calendar) => (
          <label
            key={calendar.id}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedCalendarIds.includes(calendar.id)}
              onChange={() => onCalendarToggle(calendar.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: calendar.color }}
              />
              <span className="text-sm text-gray-700">{calendar.name}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
