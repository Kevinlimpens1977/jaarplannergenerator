import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/supabase/queries';
import { generateOutlookICS, generateICSFilename } from '@/lib/ics/generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const schoolYear = searchParams.get('school_year') || '2026/2027';
  const calendarIds = searchParams.get('calendar_ids');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!calendarIds) {
    return NextResponse.json(
      { error: 'Calendar IDs zijn vereist' },
      { status: 400 }
    );
  }

  try {
    // Parse calendar IDs
    const calendarIdArray = calendarIds.split(',');

    // Fetch events with filters
    const events = await getEvents({
      school_year: schoolYear,
      calendar_ids: calendarIdArray,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Geen activiteiten gevonden voor de geselecteerde filters' },
        { status: 404 }
      );
    }

    // Generate ICS file
    const icsContent = generateOutlookICS(events);
    const filename = generateICSFilename(`dacapo-${schoolYear.replace('/', '-')}`);

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
