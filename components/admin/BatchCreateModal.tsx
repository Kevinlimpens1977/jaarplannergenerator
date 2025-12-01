'use client';

import { useState } from 'react';
import type { Calendar } from '@/lib/types/database';
import { format, addDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { nl } from 'date-fns/locale';

interface BatchCreateModalProps {
  calendars: Calendar[];
  isOpen: boolean;
  onClose: () => void;
  onBatchCreate: (eventData: any, dates: string[]) => Promise<void>;
}

type DateMode = 'consecutive' | 'weekdays' | 'manual';

export default function BatchCreateModal({ calendars, isOpen, onClose, onBatchCreate }: BatchCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '09:00',
    end_time: '15:00',
    all_day: false,
    location: '',
    audience: '',
    category: '',
    calendar_ids: [] as string[],
  });

  const [dateMode, setDateMode] = useState<DateMode>('consecutive');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Ma-Vr
  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const weekdayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  const generatePreview = () => {
    if (!startDate || !endDate) {
      setPreviewDates([]);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setPreviewDates([]);
      return;
    }

    let dates: Date[] = [];

    if (dateMode === 'consecutive') {
      dates = eachDayOfInterval({ start, end });
    } else if (dateMode === 'weekdays') {
      const allDates = eachDayOfInterval({ start, end });
      dates = allDates.filter(date => selectedWeekdays.includes(date.getDay()));
    }

    setPreviewDates(dates.slice(0, 50)); // Limit preview to 50 days
  };

  const handleCalendarToggle = (calendarId: string) => {
    setFormData(prev => ({
      ...prev,
      calendar_ids: prev.calendar_ids.includes(calendarId)
        ? prev.calendar_ids.filter(id => id !== calendarId)
        : [...prev.calendar_ids, calendarId]
    }));
  };

  const handleWeekdayToggle = (day: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (previewDates.length === 0) {
      alert('Geen datums geselecteerd');
      return;
    }

    if (formData.calendar_ids.length === 0) {
      alert('Selecteer minimaal één kalender');
      return;
    }

    setCreating(true);
    try {
      const dateStrings = previewDates.map(d => format(d, 'yyyy-MM-dd'));
      await onBatchCreate(formData, dateStrings);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        start_time: '09:00',
        end_time: '15:00',
        all_day: false,
        location: '',
        audience: '',
        category: '',
        calendar_ids: [],
      });
      setStartDate('');
      setEndDate('');
      setPreviewDates([]);
    } catch (error) {
      alert('Fout bij aanmaken');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Meerdaags project aanmaken</h2>
            <button onClick={onClose} className="text-white hover:bg-green-700 rounded-full p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left column: Event details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Activiteit details</h3>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start tijd</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    disabled={formData.all_day}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eind tijd</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    disabled={formData.all_day}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kalenders *</label>
                <div className="grid grid-cols-1 gap-2">
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
            </div>

            {/* Right column: Date selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Datums selecteren</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={dateMode === 'consecutive'}
                      onChange={() => setDateMode('consecutive')}
                      className="rounded-full"
                    />
                    <span className="text-sm">Alle opeenvolgende dagen</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={dateMode === 'weekdays'}
                      onChange={() => setDateMode('weekdays')}
                      className="rounded-full"
                    />
                    <span className="text-sm">Specifieke weekdagen</span>
                  </label>
                </div>
              </div>

              {dateMode === 'weekdays' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekdagen</label>
                  <div className="flex gap-2">
                    {weekdayNames.map((name, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleWeekdayToggle(index)}
                        className={`px-3 py-2 rounded text-sm font-medium ${
                          selectedWeekdays.includes(index)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start datum *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eind datum *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={generatePreview}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Preview genereren
              </button>

              {previewDates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview ({previewDates.length} {previewDates.length === 1 ? 'dag' : 'dagen'})
                  </label>
                  <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-1 bg-gray-50">
                    {previewDates.map((date, index) => (
                      <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="font-medium">{format(date, 'EEEE', { locale: nl })}</span>
                        <span>{format(date, 'dd-MM-yyyy')}</span>
                      </div>
                    ))}
                    {previewDates.length === 50 && (
                      <p className="text-xs text-orange-600 pt-2">⚠️ Preview beperkt tot 50 dagen</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={creating || previewDates.length === 0 || formData.calendar_ids.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Aanmaken...' : `${previewDates.length} activiteiten aanmaken`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
