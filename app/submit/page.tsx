'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCalendars, createEvent, getCurrentUser } from '@/lib/supabase/queries';
import type { Calendar, User } from '@/lib/types/database';
import { getCurrentSchoolYear, getNextSchoolYear } from '@/lib/utils/dateUtils';

export default function SubmitPage() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSchoolYear = getCurrentSchoolYear();
  const nextSchoolYear = getNextSchoolYear(currentSchoolYear);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    school_year: currentSchoolYear,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    all_day: false,
    category: '',
    location: '',
    audience: '',
    calendar_ids: [] as string[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [calendarsData, userData] = await Promise.all([
          getCalendars(),
          getCurrentUser(),
        ]);
        setCalendars(calendarsData);
        setCurrentUser(userData);
      } catch (err) {
        console.error(err);
        setError('Kon gegevens niet laden');
      }
    }
    loadData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCalendarToggle = (calendarId: string) => {
    setFormData((prev) => ({
      ...prev,
      calendar_ids: prev.calendar_ids.includes(calendarId)
        ? prev.calendar_ids.filter((id) => id !== calendarId)
        : [...prev.calendar_ids, calendarId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validatie
    if (!formData.title.trim()) {
      setError('Titel is verplicht');
      setLoading(false);
      return;
    }

    if (!formData.start_date) {
      setError('Startdatum is verplicht');
      setLoading(false);
      return;
    }

    if (!formData.end_date) {
      setError('Einddatum is verplicht');
      setLoading(false);
      return;
    }

    if (formData.calendar_ids.length === 0) {
      setError('Selecteer minimaal één kalender');
      setLoading(false);
      return;
    }

    if (!currentUser) {
      setError('Je moet ingelogd zijn om een activiteit in te dienen');
      setLoading(false);
      return;
    }

    try {
      // Construct datetime strings
      let startDateTime: string;
      let endDateTime: string;

      if (formData.all_day) {
        startDateTime = `${formData.start_date}T00:00:00`;
        endDateTime = `${formData.end_date}T23:59:59`;
      } else {
        if (!formData.start_time || !formData.end_time) {
          setError('Start- en eindtijd zijn verplicht als het geen hele dag activiteit is');
          setLoading(false);
          return;
        }
        startDateTime = `${formData.start_date}T${formData.start_time}:00`;
        endDateTime = `${formData.end_date}T${formData.end_time}:00`;
      }

      // Create event
      await createEvent(
        {
          title: formData.title,
          description: formData.description || null,
          school_year: formData.school_year,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          all_day: formData.all_day,
          category: formData.category || null,
          location: formData.location || null,
          audience: formData.audience || null,
          status: 'ingediend',
          created_by: currentUser?.id || null,
          approved_by: null,
        },
        formData.calendar_ids
      );

      // Success - redirect to planner
      alert('Activiteit succesvol ingediend! De activiteit wordt nu beoordeeld door een teamleider.');
      router.push('/planner');
    } catch (err) {
      console.error(err);
      setError('Er is een fout opgetreden bij het indienen van de activiteit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-6 text-gray-900">
        Nieuwe activiteit indienen
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-sm border-2 border-gray-300 p-6 space-y-6">
        {/* Titel */}
        <div>
          <label htmlFor="title" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Titel *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="input"
          />
        </div>

        {/* Beschrijving */}
        <div>
          <label htmlFor="description" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Beschrijving
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 rounded-2xl bg-white/90 border-2 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-400 transition-all duration-200"
          />
        </div>

        {/* Schooljaar */}
        <div>
          <label htmlFor="school_year" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Schooljaar *
          </label>
          <select
            id="school_year"
            name="school_year"
            value={formData.school_year}
            onChange={handleInputChange}
            className="input"
          >
            <option value={currentSchoolYear}>{currentSchoolYear}</option>
            <option value={nextSchoolYear}>{nextSchoolYear}</option>
          </select>
        </div>

        {/* Datum en tijd */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
              Startdatum *
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
              Einddatum *
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>
        </div>

        {/* Hele dag checkbox */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="all_day"
              checked={formData.all_day}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-emerald-300"
            />
            <span className="text-sm font-medium text-gray-700">Dit is een hele dag activiteit</span>
          </label>
        </div>

        {/* Tijden (alleen als niet hele dag) */}
        {!formData.all_day && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
                Starttijd *
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required={!formData.all_day}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
                Eindtijd *
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required={!formData.all_day}
                className="input"
              />
            </div>
          </div>
        )}

        {/* Categorie */}
        <div>
          <label htmlFor="category" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Categorie
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">Selecteer categorie</option>
            <option value="vakantie">Vakantie</option>
            <option value="toetsweek">Toetsweek</option>
            <option value="ouderavond">Ouderavond</option>
            <option value="kwaliteitsactiviteit">Kwaliteitsactiviteit</option>
            <option value="studiedag">Studiedag</option>
            <option value="excursie">Excursie</option>
            <option value="overig">Overig</option>
          </select>
        </div>

        {/* Locatie */}
        <div>
          <label htmlFor="location" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Locatie
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="input"
          />
        </div>

        {/* Doelgroep */}
        <div>
          <label htmlFor="audience" className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Doelgroep
          </label>
          <input
            type="text"
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleInputChange}
            placeholder="Bijv. Alle leerlingen, BB/KB Onderbouw, GT Bovenbouw"
            className="input"
          />
        </div>

        {/* Kalenders */}
        <div>
          <label className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
            Kalenders * (selecteer minimaal één)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calendars.map((calendar) => (
              <label
                key={calendar.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-white/50 p-3 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all"
              >
                <input
                  type="checkbox"
                  checked={formData.calendar_ids.includes(calendar.id)}
                  onChange={() => handleCalendarToggle(calendar.id)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{calendar.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit knoppen */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-8"
          >
            {loading ? 'Indienen...' : 'Activiteit indienen'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/planner')}
            className="btn hover:bg-gray-50"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
