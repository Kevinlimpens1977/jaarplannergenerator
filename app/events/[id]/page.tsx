import { getEventById } from '@/lib/supabase/queries';
import { formatEventTime } from '@/lib/utils/dateUtils';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  let event;
  let error = null;

  try {
    event = await getEventById(params.id);
  } catch (err) {
    error = 'Activiteit niet gevonden';
    console.error(err);
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Fout</h2>
          <p className="text-red-700">{error || 'Activiteit niet gevonden'}</p>
          <Link href="/planner" className="text-green-600 hover:underline mt-4 inline-block">
            ← Terug naar planner
          </Link>
        </div>
      </div>
    );
  }

  const startDate = parseISO(event.start_datetime);
  const endDate = parseISO(event.end_datetime);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/planner" className="text-green-600 hover:underline mb-4 inline-block">
        ← Terug naar planner
      </Link>

      <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-8 mt-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">{event.title}</h1>
            <div className="flex gap-2 flex-wrap">
              {event.event_calendars.map((ec) => (
                <span
                  key={ec.calendar_id}
                  className="px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: ec.calendars.color }}
                >
                  {ec.calendars.name}
                </span>
              ))}
            </div>
          </div>
          <a
            href={`/api/ics/single?id=${event.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            Download .ics
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-green-900 mb-4">Details</h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-green-700">Datum:</span>
                <p className="text-green-900">
                  {format(startDate, 'd MMMM yyyy', { locale: nl })}
                  {!event.all_day && endDate.toDateString() !== startDate.toDateString() && (
                    <> tot {format(endDate, 'd MMMM yyyy', { locale: nl })}</>
                  )}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-green-700">Tijd:</span>
                <p className="text-green-900">
                  {formatEventTime(event.start_datetime, event.end_datetime, event.all_day)}
                </p>
              </div>

              {event.category && (
                <div>
                  <span className="text-sm font-medium text-green-700">Categorie:</span>
                  <p className="text-green-900 capitalize">{event.category}</p>
                </div>
              )}

              {event.location && (
                <div>
                  <span className="text-sm font-medium text-green-700">Locatie:</span>
                  <p className="text-green-900">{event.location}</p>
                </div>
              )}

              {event.audience && (
                <div>
                  <span className="text-sm font-medium text-green-700">Doelgroep:</span>
                  <p className="text-green-900">{event.audience}</p>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-green-700">Schooljaar:</span>
                <p className="text-green-900">{event.school_year}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-green-700">Status:</span>
                <p className="text-green-900 capitalize">{event.status}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-green-900 mb-4">Beschrijving</h2>
            <p className="text-green-900 whitespace-pre-wrap">
              {event.description || 'Geen beschrijving beschikbaar'}
            </p>

            {event.creator && (
              <div className="mt-6">
                <span className="text-sm font-medium text-green-700">Ingediend door:</span>
                <p className="text-green-900">{event.creator.name}</p>
              </div>
            )}

            {event.approver && (
              <div className="mt-3">
                <span className="text-sm font-medium text-green-700">Goedgekeurd door:</span>
                <p className="text-green-900">{event.approver.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
