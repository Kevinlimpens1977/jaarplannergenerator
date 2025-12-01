import type { EventWithDetails } from '@/lib/types/database';
import { parseISO, format } from 'date-fns';

// Helper function to format date for ICS (YYYYMMDDTHHMMSSZ)
function formatICSDate(date: Date, allDay: boolean = false): string {
  if (allDay) {
    // For all-day events, use date only format (YYYYMMDD)
    return format(date, 'yyyyMMdd');
  }
  // For timed events, use UTC format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// Escape special characters in ICS content
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Generate UID for event
function generateUID(eventId: string): string {
  return `${eventId}@dacapo-jaarplanner.nl`;
}

// Convert a single event to ICS VEVENT component
export function eventToICS(event: EventWithDetails): string {
  const startDate = parseISO(event.start_datetime);
  const endDate = parseISO(event.end_datetime);
  const now = new Date();

  const calendarNames = event.event_calendars
    .map((ec) => ec.calendars.name)
    .join(', ');

  const categories = [
    event.category || 'DaCapo',
    ...event.event_calendars.map((ec) => ec.calendars.name),
  ]
    .filter(Boolean)
    .join(',');

  let vevent = 'BEGIN:VEVENT\r\n';
  vevent += `UID:${generateUID(event.id)}\r\n`;
  vevent += `DTSTAMP:${formatICSDate(now)}\r\n`;
  
  if (event.all_day) {
    vevent += `DTSTART;VALUE=DATE:${formatICSDate(startDate, true)}\r\n`;
    vevent += `DTEND;VALUE=DATE:${formatICSDate(endDate, true)}\r\n`;
  } else {
    vevent += `DTSTART:${formatICSDate(startDate)}\r\n`;
    vevent += `DTEND:${formatICSDate(endDate)}\r\n`;
  }

  vevent += `SUMMARY:${escapeICSText(event.title)}\r\n`;

  if (event.description) {
    vevent += `DESCRIPTION:${escapeICSText(event.description)}\r\n`;
  }

  if (event.location) {
    vevent += `LOCATION:${escapeICSText(event.location)}\r\n`;
  }

  vevent += `CATEGORIES:${escapeICSText(categories)}\r\n`;
  vevent += `STATUS:CONFIRMED\r\n`;
  vevent += `TRANSP:OPAQUE\r\n`;
  vevent += `END:VEVENT\r\n`;

  return vevent;
}

// Generate complete ICS file content
export function generateICS(
  events: EventWithDetails[], 
  calendarName?: string,
  calendarDescription?: string
): string {
  let ics = 'BEGIN:VCALENDAR\r\n';
  ics += 'VERSION:2.0\r\n';
  ics += 'PRODID:-//DaCapo College//Jaarplanner 26/27//NL\r\n';
  ics += 'CALSCALE:GREGORIAN\r\n';
  ics += 'METHOD:PUBLISH\r\n';
  ics += `X-WR-CALNAME:${escapeICSText(calendarName || 'DaCapo Jaarplanner 26/27')}\r\n`;
  ics += 'X-WR-TIMEZONE:Europe/Amsterdam\r\n';
  ics += `X-WR-CALDESC:${escapeICSText(calendarDescription || 'Jaarplanner voor DaCapo College schooljaar 2026/2027')}\r\n`;

  // Add timezone information for Europe/Amsterdam
  ics += 'BEGIN:VTIMEZONE\r\n';
  ics += 'TZID:Europe/Amsterdam\r\n';
  ics += 'BEGIN:DAYLIGHT\r\n';
  ics += 'TZOFFSETFROM:+0100\r\n';
  ics += 'TZOFFSETTO:+0200\r\n';
  ics += 'DTSTART:19700329T020000\r\n';
  ics += 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\n';
  ics += 'END:DAYLIGHT\r\n';
  ics += 'BEGIN:STANDARD\r\n';
  ics += 'TZOFFSETFROM:+0200\r\n';
  ics += 'TZOFFSETTO:+0100\r\n';
  ics += 'DTSTART:19701025T030000\r\n';
  ics += 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\n';
  ics += 'END:STANDARD\r\n';
  ics += 'END:VTIMEZONE\r\n';

  // Add all events
  events.forEach((event) => {
    ics += eventToICS(event);
  });

  ics += 'END:VCALENDAR\r\n';

  return ics;
}

// Generate filename for ICS download
export function generateICSFilename(prefix: string = 'dacapo-jaarplanner'): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  return `${prefix}-${date}.ics`;
}
