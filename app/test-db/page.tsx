'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testQueries() {
      try {
        // Test 1: Fetch calendars
        console.log('Test 1: Fetching calendars...');
        const { data: calendars, error: calError } = await supabase
          .from('calendars')
          .select('*');
        
        if (calError) throw new Error(`Calendars error: ${calError.message}`);
        console.log('✅ Calendars:', calendars);

        // Test 2: Fetch events (simple)
        console.log('Test 2: Fetching events (simple)...');
        const { data: events, error: evError } = await supabase
          .from('events')
          .select('*')
          .limit(5);
        
        if (evError) throw new Error(`Events error: ${evError.message}`);
        console.log('✅ Events:', events);

        // Test 3: Fetch events with event_calendars join
        console.log('Test 3: Fetching events with event_calendars...');
        const { data: eventsWithCal, error: ev2Error } = await supabase
          .from('events')
          .select('*, event_calendars(*)')
          .limit(5);
        
        if (ev2Error) throw new Error(`Events+EventCal error: ${ev2Error.message}`);
        console.log('✅ Events with event_calendars:', eventsWithCal);

        // Test 4: Full query
        console.log('Test 4: Full query...');
        const { data: fullEvents, error: fullError } = await supabase
          .from('events')
          .select(`
            *,
            event_calendars (
              calendar_id,
              calendars (*)
            )
          `)
          .limit(5);
        
        if (fullError) throw new Error(`Full query error: ${fullError.message}`);
        console.log('✅ Full events:', fullEvents);

        setResult({
          calendars: calendars?.length || 0,
          events: events?.length || 0,
          eventsWithCal: eventsWithCal?.length || 0,
          fullEvents: fullEvents?.length || 0,
        });
      } catch (err: any) {
        console.error('❌ Test failed:', err);
        setError(err.message);
      }
    }

    testQueries();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Supabase Connection Test</h1>
      {error ? (
        <div style={{ color: 'red', backgroundColor: '#fee', padding: '10px', borderRadius: '5px' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : result ? (
        <div style={{ color: 'green', backgroundColor: '#efe', padding: '10px', borderRadius: '5px' }}>
          <strong>✅ All tests passed!</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : (
        <div>Loading tests...</div>
      )}
      <div style={{ marginTop: '20px' }}>
        <p>Open browser console (F12) to see detailed logs</p>
      </div>
    </div>
  );
}
