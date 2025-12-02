import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/supabase/queries';
import { generateOutlookICS, generateICSFilename } from '@/lib/ics/generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventIds } = body as { eventIds: string[] };

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json(
        { error: 'Event IDs array is vereist' },
        { status: 400 }
      );
    }

    // Fetch all events
    const eventPromises = eventIds.map((id) => getEventById(id));
    const events = await Promise.all(eventPromises);

    // Filter out any null results
    const validEvents = events.filter((event) => event !== null);

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'Geen geldige activiteiten gevonden' },
        { status: 404 }
      );
    }

    // Generate ICS file
    const icsContent = generateOutlookICS(validEvents);
    const filename = generateICSFilename('dacapo-selectie');

    // Return ICS file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating ICS:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het genereren van het .ics bestand' },
      { status: 500 }
    );
  }
}
