'use client';

import { useState } from 'react';
import type { Calendar } from '@/lib/types/database';

interface PlannerFiltersProps {
  calendars: Calendar[];
  selectedCalendarIds: string[];
  onCalendarToggle: (calendarId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectedSchoolYear: string;
  onSchoolYearChange: (year: string) => void;
}

export default function PlannerFilters({
  calendars,
  selectedCalendarIds,
  onCalendarToggle,
  onSelectAll,
  onDeselectAll,
  selectedSchoolYear,
  onSchoolYearChange,
}: PlannerFiltersProps) {
  const allSelected = selectedCalendarIds.length === calendars.length;
  const noneSelected = selectedCalendarIds.length === 0;

  const schoolYears = ['2025/2026', '2026/2027', '2027/2028'];

  const getShortSchoolYear = (year: string) => {
    const parts = year.split('/');
    if (parts.length === 2) {
      return `${parts[0].slice(2)}/${parts[1].slice(2)}`;
    }
    return '';
  };

  const shortYear = getShortSchoolYear(selectedSchoolYear);

  // Helper to strip existing year suffix (e.g. " 26/27") from calendar name
  const getBaseCalendarName = (name: string) => {
    return name.replace(/\s\d{2}\/\d{2}$/, '');
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-sm border-2 border-gray-300 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-accent via-green-600 to-emerald-600 p-2 rounded-xl shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-gray-900">Filters</h2>
          <div className="relative">
            <select
              value={selectedSchoolYear}
              onChange={(e) => onSchoolYearChange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border-2 border-emerald-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent cursor-pointer hover:bg-emerald-50 transition-colors"
            >
              {schoolYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Alles selecteren
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Alles deselecteren
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {calendars.map((calendar) => (
          <label
            key={calendar.id}
            className={`
              flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200
              ${selectedCalendarIds.includes(calendar.id)
                ? 'bg-white border-emerald-200 shadow-sm'
                : 'bg-white/50 border-transparent hover:bg-white hover:border-emerald-200'
              }
            `}
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={selectedCalendarIds.includes(calendar.id)}
                onChange={() => onCalendarToggle(calendar.id)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-accent checked:bg-accent focus:ring-2 focus:ring-accent/20"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <div
                className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                style={{ backgroundColor: calendar.color }}
              />
              <span className={`text-sm font-medium ${selectedCalendarIds.includes(calendar.id) ? 'text-gray-900' : 'text-gray-600'}`}>
                {getBaseCalendarName(calendar.name)} {shortYear}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
