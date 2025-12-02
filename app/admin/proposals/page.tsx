'use client';

import { useState, useEffect } from 'react';
import { getEventsByStatus, approveEvent, rejectEvent, getCurrentUser } from '@/lib/supabase/queries';
import type { EventWithDetails, User } from '@/lib/types/database';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<EventWithDetails[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [proposalsData, userData] = await Promise.all([
        getEventsByStatus('ingediend'),
        getCurrentUser(),
      ]);
      setProposals(proposalsData);
      setCurrentUser(userData);
    } catch (err) {
      console.error(err);
      setError('Kon voorstellen niet laden');
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (eventId: string) => {
    if (!currentUser) {
      alert('Gebruiker niet ingelogd');
      return;
    }

    if (!confirm('Weet je zeker dat je deze activiteit wilt goedkeuren?')) {
      return;
    }

    setActionInProgress(eventId);
    try {
      await approveEvent(eventId, currentUser.id, comments[eventId] || undefined);
      alert('Activiteit goedgekeurd! De activiteit is nu zichtbaar in de planner.');
      await loadData();
      setComments((prev) => {
        const newComments = { ...prev };
        delete newComments[eventId];
        return newComments;
      });
    } catch (err) {
      console.error(err);
      alert('Er is een fout opgetreden bij het goedkeuren');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (eventId: string) => {
    if (!currentUser) {
      alert('Gebruiker niet ingelogd');
      return;
    }

    if (!confirm('Weet je zeker dat je deze activiteit wilt afwijzen?')) {
      return;
    }

    setActionInProgress(eventId);
    try {
      await rejectEvent(eventId, currentUser.id, comments[eventId] || undefined);
      alert('Activiteit afgewezen.');
      await loadData();
      setComments((prev) => {
        const newComments = { ...prev };
        delete newComments[eventId];
        return newComments;
      });
    } catch (err) {
      console.error(err);
      alert('Er is een fout opgetreden bij het afwijzen');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCommentChange = (eventId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [eventId]: comment }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-green-50 p-8 rounded-2xl shadow-sm border border-green-200 text-center">
          <p className="text-green-700">Voorstellen laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Fout</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6 text-gray-900">
        Voorstellen beoordelen
      </h1>

      {proposals.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600">Geen ingediende voorstellen om te beoordelen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-sm border-2 border-gray-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-2">{proposal.title}</h2>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {proposal.event_calendars.map((ec) => (
                      <span
                        key={ec.calendar_id}
                        className="px-2 py-1 rounded text-white text-xs"
                        style={{ backgroundColor: ec.calendars.color }}
                      >
                        {ec.calendars.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-emerald-600 font-medium">
                  Ingediend op{' '}
                  {format(parseISO(proposal.created_at), 'd MMM yyyy HH:mm', { locale: nl })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Datum:</span>
                  <p className="text-gray-900">
                    {format(parseISO(proposal.start_datetime), 'd MMMM yyyy', { locale: nl })}
                    {parseISO(proposal.end_datetime).toDateString() !==
                      parseISO(proposal.start_datetime).toDateString() && (
                      <> tot {format(parseISO(proposal.end_datetime), 'd MMMM yyyy', { locale: nl })}</>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Tijd:</span>
                  <p className="text-gray-900">
                    {proposal.all_day ? (
                      'Hele dag'
                    ) : (
                      <>
                        {format(parseISO(proposal.start_datetime), 'HH:mm')} -{' '}
                        {format(parseISO(proposal.end_datetime), 'HH:mm')}
                      </>
                    )}
                  </p>
                </div>

                {proposal.category && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Categorie:</span>
                    <p className="text-gray-900 capitalize">{proposal.category}</p>
                  </div>
                )}

                {proposal.location && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Locatie:</span>
                    <p className="text-gray-900">{proposal.location}</p>
                  </div>
                )}

                {proposal.audience && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Doelgroep:</span>
                    <p className="text-gray-900">{proposal.audience}</p>
                  </div>
                )}

                {proposal.creator && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Ingediend door:</span>
                    <p className="text-gray-900">{proposal.creator.name}</p>
                  </div>
                )}
              </div>

              {proposal.description && (
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase">Beschrijving:</span>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{proposal.description}</p>
                </div>
              )}

              <div className="border-t border-emerald-200 pt-4">
                <label className="block text-[11px] font-bold text-emerald-700 tracking-[0.1em] uppercase mb-2">
                  Opmerking (optioneel):
                </label>
                <textarea
                  value={comments[proposal.id] || ''}
                  onChange={(e) => handleCommentChange(proposal.id, e.target.value)}
                  rows={2}
                  placeholder="Voeg een opmerking toe voor de indiener..."
                  className="w-full px-3 py-2 rounded-2xl bg-white/90 border-2 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-400 transition-all duration-200 mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(proposal.id)}
                    disabled={actionInProgress === proposal.id}
                    className="btn btn-primary"
                  >
                    {actionInProgress === proposal.id ? 'Bezig...' : '✓ Goedkeuren'}
                  </button>
                  <button
                    onClick={() => handleReject(proposal.id)}
                    disabled={actionInProgress === proposal.id}
                    className="btn bg-red-600 text-white hover:bg-red-700 border-transparent"
                  >
                    {actionInProgress === proposal.id ? 'Bezig...' : '✗ Afwijzen'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
