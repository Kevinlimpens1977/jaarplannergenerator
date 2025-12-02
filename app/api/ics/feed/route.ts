import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/supabase/queries';
import crypto from 'crypto';
import { generateICSContent } from '@/lib/ics/generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching events for ICS feed...');
    // Get all active events
    const events = await getAllEvents();
    console.log(`Found ${events.length} events`);
    
    // Generate ICS content
    const icsContent = generateICSContent(events);
    
    // Return with proper headers for Outlook compatibility
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Disposition': 'attachment; filename="dacapo-agenda.ics"'
      },
    });
  } catch (error) {
    console.error('Error generating ICS feed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Error generating calendar feed' },
      { status: 500 }
    );
  }
}