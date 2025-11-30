'use client';

import { useState, useEffect } from 'react';
import { getWeekDates, getNextWeek, getPreviousWeek } from '@/lib/utils/dateUtils';
import { getCalendars, getEvents } from '@/lib/supabase/queries';
import type { Calendar, EventWithDetails } from '@/lib/types/database';
import PlannerFilters from '@/components/planner/PlannerFilters';
import WeekNavigation from '@/components/planner/WeekNavigation';
import WeekView from '@/components/planner/WeekView';

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekDates = getWeekDates(currentDate);

  // Load calendars
  useEffect(() => {
    async function loadCalendars() {
      try {
        const data = await getCalendars();
        setCalendars(data);
        // Select all calendars by default
        setSelectedCalendarIds(data.map((c) => c.id));
      } catch (err) {
        setError('Kon kalenders niet laden. Zorg dat je .env.local correct is ingesteld.');
        console.error(err);
      }
    }
    loadCalendars();
  }, []);

  // Load events for current week
  useEffect(() => {
    async function loadEvents() {
      if (calendars.length === 0) return;

      setLoading(true);
      try {
        const startDate = weekDates[0].toISOString();
        const endDate = weekDates[weekDates.length - 1].toISOString();
        
        const data = await getEvents({
          school_year: '2026/2027',
          calendar_ids: selectedCalendarIds,
          start_date: startDate,
          end_date: endDate,
        });
        
        setEvents(data);
        setError(null);
      } catch (err) {
        setError('Kon activiteiten niet laden.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [currentDate, calendars, selectedCalendarIds]);

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(calendarId)
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCalendarIds(calendars.map((c) => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedCalendarIds([]);
  };

  const handlePreviousWeek = () => {
    setCurrentDate(getPreviousWeek(currentDate));
  };

  const handleNextWeek = () => {
    setCurrentDate(getNextWeek(currentDate));
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  const handleExportView = () => {
    if (selectedCalendarIds.length === 0) {
      alert('Selecteer minimaal één kalender om te exporteren');
      return;
    }

    const startDate = weekDates[0].toISOString();
    const endDate = weekDates[weekDates.length - 1].toISOString();
    
    const params = new URLSearchParams({
      school_year: '2026/2027',
      calendar_ids: selectedCalendarIds.join(','),
      start_date: startDate,
      end_date: endDate,
    });

    window.location.href = `/api/ics/view?${params.toString()}`;
  };

  if (error && calendars.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Configuratiefout</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-4">
            Controleer of je een <code className="bg-red-100 px-2 py-1 rounded">.env.local</code> bestand hebt aangemaakt 
            met de juiste Supabase credentials. Zie <code className="bg-red-100 px-2 py-1 rounded">.env.local.example</code> 
            voor een voorbeeld.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Jaarplanner 2026/2027
        </h1>
        <button 
          onClick={handleExportView}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
        >
          Exporteer huidige view naar .ics
        </button>
      </div>

      <PlannerFilters
        calendars={calendars}
        selectedCalendarIds={selectedCalendarIds}
        onCalendarToggle={handleCalendarToggle}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      <WeekNavigation
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onDateSelect={handleDateSelect}
      />

      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Activiteiten laden...</p>
        </div>
      ) : (
        <WeekView
          weekDates={weekDates}
          events={events}
          selectedCalendarIds={selectedCalendarIds}
        />
      )}
    </div>
  );
}
