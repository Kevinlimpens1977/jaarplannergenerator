import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateICS } from '@/lib/ics/generator';
import type { Database } from '@/lib/types/database';

/**
 * API Route: Subscribe to calendar(s)
 * GET /api/ics/subscribe?calendar_ids=id1,id2,id3&school_year=2026/2027
 * 
 * This endpoint generates a persistent iCal feed that users can subscribe to in Outlook.
 * The feed will always show current events and updates automatically.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const calendarIdsParam = searchParams.get('calendar_ids');
    const schoolYear = searchParams.get('school_year') || '2026/2027';

    if (!calendarIdsParam) {
      return NextResponse.json(
        { error: 'calendar_ids parameter is required' },
        { status: 400 }
      );
    }

    const calendarIds = calendarIdsParam.split(',');
    
    // Create Supabase client for server-side use
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }
    
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Fetch calendar names for the feed title
    const { data: calendars } = await supabase
      .from('calendars')
      .select('name, code')
      .in('id', calendarIds);

    const calendarNames = calendars?.map((c: any) => c.name).join(', ') || 'Calendars';

    // Fetch all approved events for the selected calendars and school year
    // Get events from 3 months ago to 1 year in the future
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_calendars (
          calendar_id,
          calendars (*)
        ),
        creator:created_by (name, email)
      `)
      .eq('status', 'goedgekeurd')
      .eq('school_year', schoolYear)
      .gte('start_datetime', startDate.toISOString())
      .lte('start_datetime', endDate.toISOString())
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // Filter events that belong to the selected calendars
    const filteredEvents = (events || []).filter((event: any) => {
      const eventCalendarIds = event.event_calendars?.map((ec: any) => ec.calendar_id) || [];
      return eventCalendarIds.some((id: string) => calendarIds.includes(id));
    });

    console.log(`Filtered ${filteredEvents.length} events for calendars:`, calendarIds);

    // Generate ICS content - even if no events, still generate valid ICS
    const icsContent = generateICS(
      filteredEvents,
      `DaCapo Jaarplanner - ${calendarNames}`,
      `Abonnement op kalender(s): ${calendarNames}. Deze feed wordt automatisch bijgewerkt.`
    );

    // Return ICS file with appropriate headers for download
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8; method=PUBLISH',
        'Content-Disposition': `inline; filename="dacapo-kalender-${schoolYear.replace('/', '-')}.ics"`,
        'Cache-Control': 'no-cache, must-revalidate',
        'X-WR-CALNAME': `DaCapo Jaarplanner - ${calendarNames}`,
      },
    });
  } catch (error) {
    console.error('Error generating ICS subscription:', error);
    
    // Return a simple valid ICS file instead of error
    const fallbackICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DaCapo College//Jaarplanner 26/27//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:DaCapo Jaarplanner 26/27
X-WR-TIMEZONE:Europe/Amsterdam
X-WR-CALDESC:Jaarplanner voor DaCapo College - Nog geen events beschikbaar
END:VCALENDAR`;

    return new NextResponse(fallbackICS, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="dacapo-kalender.ics"`,
      },
    });
  }
}
