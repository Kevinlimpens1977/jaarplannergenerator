'use client';

import { useState, useEffect } from 'react';
import { getWeekDates, getNextWeek, getPreviousWeek } from '@/lib/utils/dateUtils';
import { getCalendars, getEvents } from '@/lib/supabase/queries';
import type { Calendar, EventWithDetails } from '@/lib/types/database';
import PlannerFilters from '@/components/planner/PlannerFilters';
import WeekNavigation from '@/components/planner/WeekNavigation';
import WeekView from '@/components/planner/WeekView';
import SubscribeModal from '@/components/SubscribeModal';

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeUrl, setSubscribeUrl] = useState('');

  // Debug: Check if env vars are loaded
  useEffect(() => {
    console.log('ENV Check - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('ENV Check - Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
  }, []);

  const weekDates = getWeekDates(currentDate);

  // Load calendars
  useEffect(() => {
    async function loadCalendars() {
      try {
        console.log('Loading calendars...');
        const data = await getCalendars();
        console.log('Calendars loaded:', data);
        setCalendars(data);
        // Select all calendars by default
        setSelectedCalendarIds(data.map((c) => c.id));
        setError(null);
      } catch (err: any) {
        const errorMessage = err?.message || 'Unknown error';
        console.error('Error loading calendars:', err);
        setError(`Kon kalenders niet laden: ${errorMessage}`);
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
      } catch (err: any) {
        const errorMessage = err?.message || 'Unknown error';
        console.error('Error loading events:', err);
        setError(`Kon activiteiten niet laden: ${errorMessage}`);
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

  const handleSubscribeCalendar = () => {
    if (selectedCalendarIds.length === 0) {
      alert('Selecteer minimaal één kalender om op te abonneren');
      return;
    }

    const params = new URLSearchParams({
      school_year: '2026/2027',
      calendar_ids: selectedCalendarIds.join(','),
    });

    const url = `${window.location.origin}/api/ics/subscribe?${params.toString()}`;
    setSubscribeUrl(url);
    setShowSubscribeModal(true);
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
        <div className="flex gap-2">
          {/* Week/Month Toggle */}
          <div className="flex items-center bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Maand (4 weken)
            </button>
          </div>
          <button 
            onClick={handleSubscribeCalendar}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            title="Download kalender voor Outlook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download voor Outlook
          </button>
          <button 
            onClick={handleExportView}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            Exporteer huidige view naar .ics
          </button>
        </div>
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
      ) : viewMode === 'week' ? (
        <WeekView
          weekDates={weekDates}
          events={events}
          selectedCalendarIds={selectedCalendarIds}
        />
      ) : (
        <div className="space-y-6">
          {[0, 1, 2, 3].map((weekOffset) => {
            const weekStartDate = new Date(currentDate);
            weekStartDate.setDate(weekStartDate.getDate() + (weekOffset * 7));
            const offsetWeekDates = getWeekDates(weekStartDate);
            
            return (
              <div key={weekOffset} className="border-t-2 border-gray-300 pt-4">
                <WeekView
                  weekDates={offsetWeekDates}
                  events={events}
                  selectedCalendarIds={selectedCalendarIds}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        subscribeUrl={subscribeUrl}
      />
    </div>
  );
}
