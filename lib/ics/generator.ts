import type { EventWithDetails } from '@/lib/types/database';
import { parseISO } from 'date-fns';

// ==================== OUTLOOK-PROOF ICS RULESET ====================

// Helper function to format date for ICS (YYYYMMDDTHHMMSSZ)
// STRICT RULE: All values must be in this exact format: YYYYMMDDTHHMMSSZ
function formatICSDate(date: Date): string {
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
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Sanitize category names
// STRICT RULE: CATEGORIES may ONLY contain letters A–Z, digits 0–9, hyphens (-), commas (,)
function sanitizeCategory(category: string): string {
  if (!category) return '';
  // Remove accents/diacritics
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Keep only allowed chars
  return normalized.replace(/[^a-zA-Z0-9-,]/g, '');
}

// Generate UID for event
function generateUID(eventId: string): string {
  return `${eventId}@agendaplan`;
}

// Convert a single event to ICS VEVENT component
export function eventToICS(event: EventWithDetails): string {
  const startDate = parseISO(event.start_datetime);
  const endDate = parseISO(event.end_datetime);
  const now = new Date();

  let dtStart: string;
  let dtEnd: string;

  // STRICT RULE: All-day events must be converted to UTC: Start at 00:00:00Z, End at 00:00:00Z the next day
  if (event.all_day) {
    // Create UTC dates for start and end
    const utcStart = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0));
    
    // End date is exclusive in ICS, so we add 1 day to the end date
    // Assuming event.end_datetime is stored as the last day of the event
    const utcEnd = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0));
    utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);

    dtStart = formatICSDate(utcStart);
    dtEnd = formatICSDate(utcEnd);
  } else {
    // Timed events are already stored as ISO strings, just ensure they are formatted as UTC
    dtStart = formatICSDate(startDate);
    dtEnd = formatICSDate(endDate);
  }

  const calendarNames = event.event_calendars
    .map((ec) => ec.calendars.name)
    .join(', ');

  const rawCategories = [
    event.category || 'DaCapo',
    ...event.event_calendars.map((ec) => ec.calendars.name),
  ].filter(Boolean);

  const categories = rawCategories
    .map(sanitizeCategory)
    .filter(c => c.length > 0)
    .join(',');

  let vevent = 'BEGIN:VEVENT\r\n';
  vevent += `UID:${generateUID(event.id)}\r\n`;
  vevent += `DTSTAMP:${formatICSDate(now)}\r\n`;
  
  // STRICT RULE: NO “VALUE=DATE”, NO timezone offsets
  vevent += `DTSTART:${dtStart}\r\n`;
  vevent += `DTEND:${dtEnd}\r\n`;

  vevent += `SUMMARY:${escapeICSText(event.title)}\r\n`;

  let description = event.description || '';
  if (calendarNames) {
    description += `\n\nKalenders: ${calendarNames}`;
  }
  if (event.audience) {
    description += `\nDoelgroep: ${event.audience}`;
  }
  
  if (description) {
    vevent += `DESCRIPTION:${escapeICSText(description)}\r\n`;
  }

  if (event.location) {
    vevent += `LOCATION:${escapeICSText(event.location)}\r\n`;
  }

  if (categories) {
    vevent += `CATEGORIES:${categories}\r\n`;
  }

  vevent += `STATUS:CONFIRMED\r\n`;
  vevent += `TRANSP:OPAQUE\r\n`;
  vevent += `END:VEVENT\r\n`;

  return vevent;
}

// Generate complete ICS file content
// STRICT RULE: Create or fix a function called `generateOutlookICS(events)`
export function generateOutlookICS(events: EventWithDetails[]): string {
  // STRICT RULE: The file must start with specific VCALENDAR header
  let ics = 'BEGIN:VCALENDAR\r\n';
  ics += 'VERSION:2.0\r\n';
  ics += 'PRODID:-//AgendaPlan//Kevin Limpens//NL\r\n';
  ics += 'CALSCALE:GREGORIAN\r\n';
  
  // STRICT RULE: Do NOT include any VTIMEZONE or TZID blocks.

  // Add all events
  events.forEach((event) => {
    ics += eventToICS(event);
  });

  ics += 'END:VCALENDAR\r\n';

  return ics;
}

// Alias for backward compatibility, but using the new strict generator
export const generateICS = generateOutlookICS;

// Generate filename for ICS download
export function generateICSFilename(prefix: string = 'dacapo-jaarplanner'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${prefix}-${year}${month}${day}.ics`;
}
