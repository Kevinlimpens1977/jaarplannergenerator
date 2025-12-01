'use client';

import { useState } from 'react';
import type { EventWithDetails, Calendar } from '@/lib/types/database';
import { format, parseISO } from 'date-fns';

interface EditEventModalProps {
  event: EventWithDetails | null;
  calendars: Calendar[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: string, updates: any) => Promise<void>;
}

export default function EditEventModal({ event, calendars, isOpen, onClose, onSave }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_datetime: event?.start_datetime ? format(parseISO(event.start_datetime), "yyyy-MM-dd'T'HH:mm") : '',
    end_datetime: event?.end_datetime ? format(parseISO(event.end_datetime), "yyyy-MM-dd'T'HH:mm") : '',
    all_day: event?.all_day || false,
    location: event?.location || '',
    audience: event?.audience || '',
    category: event?.category || '',
    calendar_ids: event?.event_calendars?.map(ec => ec.calendar_id) || [],
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(event.id, formData);
      onClose();
    } catch (error) {
      alert('Fout bij opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleCalendarToggle = (calendarId: string) => {
    setFormData(prev => ({
      ...prev,
      calendar_ids: prev.calendar_ids.includes(calendarId)
        ? prev.calendar_ids.filter(id => id !== calendarId)
        : [...prev.calendar_ids, calendarId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Activiteit bewerken</h2>
            <button onClick={onClose} className="text-white hover:bg-blue-700 rounded-full p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
              <input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eind *</label>
              <input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.all_day}
                onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Hele dag activiteit</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doelgroep</label>
              <input
                type="text"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kalenders *</label>
            <div className="grid grid-cols-2 gap-2">
              {calendars.map(calendar => (
                <label key={calendar.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.calendar_ids.includes(calendar.id)}
                    onChange={() => handleCalendarToggle(calendar.id)}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: calendar.color }}></div>
                    <span className="text-sm">{calendar.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving || formData.calendar_ids.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
