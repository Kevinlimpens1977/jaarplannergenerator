import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/supabase/queries';
import { generateOutlookICS, generateICSFilename } from '@/lib/ics/generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('id');

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID is vereist' }, { status: 400 });
  }

  try {
    const event = await getEventById(eventId);
    
    if (!event) {
      return NextResponse.json({ error: 'Activiteit niet gevonden' }, { status: 404 });
    }

    // Generate ICS file
    const icsContent = generateOutlookICS([event]);
    const filename = generateICSFilename(event.title.toLowerCase().replace(/\s+/g, '-'));

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
