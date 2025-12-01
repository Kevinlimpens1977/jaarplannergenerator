'use client';

import { useState } from 'react';
import type { EventWithDetails } from '@/lib/types/database';
import { format, parseISO, addDays } from 'date-fns';

interface CopyEventModalProps {
  event: EventWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (eventId: string, targetDates: string[], targetSchoolYear: string) => Promise<void>;
}

export default function CopyEventModal({ event, isOpen, onClose, onCopy }: CopyEventModalProps) {
  const [targetDate, setTargetDate] = useState('');
  const [additionalDates, setAdditionalDates] = useState<string[]>([]);
  const [targetSchoolYear, setTargetSchoolYear] = useState('2026/2027');
  const [copying, setCopying] = useState(false);

  if (!isOpen || !event) return null;

  const handleAddDate = () => {
    if (targetDate && !additionalDates.includes(targetDate)) {
      setAdditionalDates([...additionalDates, targetDate]);
      setTargetDate('');
    }
  };

  const handleRemoveDate = (date: string) => {
    setAdditionalDates(additionalDates.filter(d => d !== date));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (additionalDates.length === 0) {
      alert('Voeg minimaal één datum toe');
      return;
    }

    setCopying(true);
    try {
      await onCopy(event.id, additionalDates.sort(), targetSchoolYear);
      setAdditionalDates([]);
      setTargetDate('');
      onClose();
    } catch (error) {
      alert('Fout bij kopiëren');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Activiteit kopiëren</h2>
            <button onClick={onClose} className="text-white hover:bg-purple-700 rounded-full p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Bron activiteit:</h3>
            <p className="text-sm text-gray-700"><strong>{event.title}</strong></p>
            <p className="text-xs text-gray-600">
              {event.start_datetime && format(parseISO(event.start_datetime), 'dd-MM-yyyy HH:mm')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schooljaar</label>
            <select
              value={targetSchoolYear}
              onChange={(e) => setTargetSchoolYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="2026/2027">2026/2027</option>
              <option value="2027/2028">2027/2028</option>
              <option value="2028/2029">2028/2029</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nieuwe datum toevoegen</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAddDate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Toevoegen
              </button>
            </div>
          </div>

          {additionalDates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kopiëren naar ({additionalDates.length} {additionalDates.length === 1 ? 'datum' : 'datums'}):
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {additionalDates.map(date => (
                  <div key={date} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{format(new Date(date), 'dd-MM-yyyy')}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(date)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p>ℹ️ De activiteit wordt gekopieerd met alle eigenschappen (titel, beschrijving, kalenders, etc.). De tijd blijft hetzelfde.</p>
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
              disabled={copying || additionalDates.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {copying ? 'Kopiëren...' : `Kopiëren naar ${additionalDates.length} ${additionalDates.length === 1 ? 'datum' : 'datums'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
