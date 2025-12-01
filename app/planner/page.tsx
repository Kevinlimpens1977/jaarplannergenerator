'use client';

import { useState, useEffect } from 'react';
import { getWeekDates, getNextWeek, getPreviousWeek, getMonthDates, getNextMonth, getPreviousMonth, getMonthName, formatWeekNumber } from '@/lib/utils/dateUtils';
import { getCalendars, getEvents } from '@/lib/supabase/queries';
import type { Calendar, EventWithDetails } from '@/lib/types/database';
import PlannerFilters from '@/components/planner/PlannerFilters';
import WeekView from '@/components/planner/WeekView';
import MonthView from '@/components/planner/MonthView';
import SubscribeModal from '@/components/SubscribeModal';

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [workweekOnly, setWorkweekOnly] = useState(true);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2025/2026');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeUrl, setSubscribeUrl] = useState('');

  // Debug: Check if env vars are loaded
  useEffect(() => {
    console.log('ENV Check - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('ENV Check - Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
  }, []);

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

  // Load events based on current view and date
  useEffect(() => {
    async function loadEvents() {
      if (calendars.length === 0) return;

      setLoading(true);
      try {
        let startDate: string;
        let endDate: string;

        if (viewMode === 'week') {
          const weekDates = getWeekDates(currentDate, false); // Always fetch full week to be safe
          startDate = weekDates[0].toISOString();
          endDate = weekDates[weekDates.length - 1].toISOString();
        } else {
          const monthDates = getMonthDates(currentDate, false); // Always fetch full month to be safe
          startDate = monthDates[0].toISOString();
          endDate = monthDates[monthDates.length - 1].toISOString();
        }
        
        const data = await getEvents({
          school_year: selectedSchoolYear,
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
  }, [currentDate, calendars, selectedCalendarIds, viewMode, selectedSchoolYear]);

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

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(getPreviousWeek(currentDate));
    } else {
      setCurrentDate(getPreviousMonth(currentDate));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(getNextWeek(currentDate));
    } else {
      setCurrentDate(getNextMonth(currentDate));
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  const handleExportView = () => {
    if (selectedCalendarIds.length === 0) {
      alert('Selecteer minimaal één kalender om te exporteren');
      return;
    }

    let startDate: string;
    let endDate: string;

    if (viewMode === 'week') {
      const weekDates = getWeekDates(currentDate, workweekOnly);
      startDate = weekDates[0].toISOString();
      endDate = weekDates[weekDates.length - 1].toISOString();
    } else {
      const monthDates = getMonthDates(currentDate, workweekOnly);
      startDate = monthDates[0].toISOString();
      endDate = monthDates[monthDates.length - 1].toISOString();
    }
    
    const params = new URLSearchParams({
      school_year: selectedSchoolYear,
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
      school_year: selectedSchoolYear,
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-dacapo-dark-900 mb-2">
            Jaarplanner {selectedSchoolYear}
          </h1>
          <p className="text-gray-500">
            Beheer en bekijk alle schoolactiviteiten in één overzicht.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* View Toggles Container */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {/* Week/Month Toggle */}
            <div className="flex items-center border-r border-gray-200 pr-1 mr-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'week'
                    ? 'bg-dacapo-blue-50 text-dacapo-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'bg-dacapo-blue-50 text-dacapo-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Maand
              </button>
            </div>
            
            {/* Workweek/Full Week Toggle */}
            <div className="flex items-center pl-1">
              <button
                onClick={() => setWorkweekOnly(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  workweekOnly
                    ? 'bg-dacapo-green-50 text-dacapo-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ma-Vr
              </button>
              <button
                onClick={() => setWorkweekOnly(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !workweekOnly
                    ? 'bg-dacapo-green-50 text-dacapo-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Ma-Zo
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handleSubscribeCalendar}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm"
              title="Download kalender voor Outlook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-dacapo-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Outlook</span>
            </button>
            <button 
              onClick={handleExportView}
              className="px-4 py-2 bg-dacapo-green-600 text-white rounded-lg hover:bg-dacapo-green-500 transition-all duration-200 text-sm font-medium shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Exporteer</span>
            </button>
          </div>
        </div>
      </div>

      <PlannerFilters
        calendars={calendars}
        selectedCalendarIds={selectedCalendarIds}
        onCalendarToggle={handleCalendarToggle}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        selectedSchoolYear={selectedSchoolYear}
        onSchoolYearChange={setSelectedSchoolYear}
      />

      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-dacapo-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-dacapo-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold text-dacapo-dark-900">
            {viewMode === 'week'
              ? `${formatWeekNumber(currentDate)} - ${getWeekDates(currentDate)[0] ? getWeekDates(currentDate)[0].toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }) : ''}`
              : getMonthName(currentDate)
            }
          </h2>
        </div>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 text-sm font-medium text-dacapo-blue-600 bg-dacapo-blue-50 hover:bg-dacapo-blue-100 rounded-lg transition-colors"
        >
          Vandaag
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dacapo-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Activiteiten laden...</p>
        </div>
      ) : viewMode === 'week' ? (
        <WeekView
          weekDates={getWeekDates(currentDate, workweekOnly)}
          events={events}
          selectedCalendarIds={selectedCalendarIds}
        />
      ) : (
        <MonthView
          monthDates={getMonthDates(currentDate, workweekOnly)}
          currentMonth={currentDate}
          events={events}
          selectedCalendarIds={selectedCalendarIds}
          workweekOnly={workweekOnly}
        />
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
