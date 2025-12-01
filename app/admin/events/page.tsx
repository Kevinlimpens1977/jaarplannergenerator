'use client';

import { useState, useEffect } from 'react';
import { getEvents, deleteEvent, getCalendars, updateEvent, copyEventToMultipleDates, batchCreateEvents } from '@/lib/supabase/queries';
import type { EventWithDetails, Calendar } from '@/lib/types/database';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';
import EditEventModal from '@/components/admin/EditEventModal';
import CopyEventModal from '@/components/admin/CopyEventModal';
import BatchCreateModal from '@/components/admin/BatchCreateModal';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2026/2027');
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [batchCreateModalOpen, setBatchCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);

  useEffect(() => {
    loadCalendars();
  }, []);

  useEffect(() => {
    if (calendars.length > 0) {
      loadEvents();
    }
  }, [selectedSchoolYear, calendars]);

  async function loadCalendars() {
    try {
      const data = await getCalendars();
      setCalendars(data);
      setSelectedCalendarIds(data.map((c) => c.id));
    } catch (err) {
      console.error(err);
      setError('Kon kalenders niet laden');
    }
  }

  async function loadEvents() {
    setLoading(true);
    try {
      // Load all events for the school year (including all statuses for admin)
      const data = await getEvents({
        school_year: selectedSchoolYear,
        calendar_ids: selectedCalendarIds,
        includeAllStatuses: true,
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Kon activiteiten niet laden');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Weet je zeker dat je "${eventTitle}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    setDeleteInProgress(eventId);
    try {
      await deleteEvent(eventId);
      alert('Activiteit verwijderd');
      await loadEvents();
    } catch (err) {
      console.error(err);
      alert('Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeleteInProgress(null);
    }
  };

  const handleEdit = (event: EventWithDetails) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (eventId: string, updates: any) => {
    await updateEvent(eventId, updates, updates.calendar_ids);
    alert('Activiteit bijgewerkt');
    await loadEvents();
  };

  const handleCopy = (event: EventWithDetails) => {
    setSelectedEvent(event);
    setCopyModalOpen(true);
  };

  const handleSaveCopy = async (eventId: string, targetDates: string[], targetSchoolYear: string) => {
    // Convert 2026/2027 format to 2026-2027 for database
    const dbSchoolYear = targetSchoolYear.replace('/', '-');
    const result = await copyEventToMultipleDates(eventId, targetDates, dbSchoolYear);
    alert(`${result.length} activiteit(en) gekopieerd`);
    await loadEvents();
  };

  const handleBatchCreate = async (eventData: any, dates: string[]) => {
    // Convert 2026/2027 format to 2026-2027 for database
    const dbSchoolYear = selectedSchoolYear.replace('/', '-');
    const result = await batchCreateEvents(eventData, dates, dbSchoolYear);
    alert(`${result.length} activiteit(en) aangemaakt`);
    await loadEvents();
  };

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(calendarId) ? prev.filter((id) => id !== calendarId) : [...prev, calendarId]
    );
  };

  const handleSelectAllCalendars = () => {
    setSelectedCalendarIds(calendars.map((c) => c.id));
  };

  const handleDeselectAllCalendars = () => {
    setSelectedCalendarIds([]);
  };

  // Re-load events when calendar filter changes
  useEffect(() => {
    if (calendars.length > 0 && selectedCalendarIds.length > 0) {
      loadEvents();
    }
  }, [selectedCalendarIds]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'goedgekeurd':
        return 'bg-green-100 text-green-800';
      case 'ingediend':
        return 'bg-yellow-100 text-yellow-800';
      case 'afgewezen':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && calendars.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Fout</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Alle activiteiten beheren</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setBatchCreateModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Meerdaags project
          </button>
          <Link
            href="/submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Nieuwe activiteit
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="school_year" className="block text-sm font-medium text-gray-700 mb-2">
            Schooljaar:
          </label>
          <select
            id="school_year"
            value={selectedSchoolYear}
            onChange={(e) => setSelectedSchoolYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2026/2027">2026/2027</option>
            <option value="2027/2028">2027/2028</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Kalenders:</label>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllCalendars}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Alles
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleDeselectAllCalendars}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Niets
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {calendars.map((calendar) => (
              <label key={calendar.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCalendarIds.includes(calendar.id)}
                  onChange={() => handleCalendarToggle(calendar.id)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{calendar.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Events lijst */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Activiteiten laden...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Geen activiteiten gevonden voor de geselecteerde filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kalenders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {event.title}
                      </Link>
                      {event.category && (
                        <span className="block text-xs text-gray-500 capitalize mt-1">
                          {event.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {format(parseISO(event.start_datetime), 'd MMM yyyy', { locale: nl })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {event.event_calendars.map((ec) => (
                          <span
                            key={ec.calendar_id}
                            className="inline-block w-4 h-4 rounded"
                            style={{ backgroundColor: ec.calendars.color }}
                            title={ec.calendars.name}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Bewerken
                        </button>
                        <button
                          onClick={() => handleCopy(event)}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Kopiëren
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={deleteInProgress === event.id}
                          className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400"
                        >
                          {deleteInProgress === event.id ? 'Verwijderen...' : 'Verwijderen'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditEventModal
        event={selectedEvent}
        calendars={calendars}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEdit}
      />

      <CopyEventModal
        event={selectedEvent}
        isOpen={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false);
          setSelectedEvent(null);
        }}
        onCopy={handleSaveCopy}
      />

      <BatchCreateModal
        calendars={calendars}
        isOpen={batchCreateModalOpen}
        onClose={() => setBatchCreateModalOpen(false)}
        onBatchCreate={handleBatchCreate}
      />
    </div>
  );
}
