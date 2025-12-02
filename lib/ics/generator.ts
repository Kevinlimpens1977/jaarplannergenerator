import { Event } from '@/lib/types/database';
import { formatToUTCString } from '@/lib/utils/dateUtils';
import crypto from 'crypto';

export function generateICSContent(events: Event[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AgendaPlan//Kevin Limpens//NL',
    'CALSCALE:GREGORIAN'
  ];

  for (const event of events) {
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    
    // For all-day events, set times to 00:00:00
    if (event.all_day) {
      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCHours(0, 0, 0, 0);
      // For all-day events, end date should be next day
      endDate.setDate(endDate.getDate() + 1);
    }

    const eventLines = [
      'BEGIN:VEVENT',
      `UID:${event.uid?.toString() || crypto.randomUUID()}`,
      `DTSTAMP:${formatToUTCString(new Date())}`,
      `DTSTART:${formatToUTCString(startDate)}`,
      `DTEND:${formatToUTCString(endDate)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description || '')}`,
      event.location ? `LOCATION:${escapeText(event.location)}` : '',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    ];

    lines.push(...eventLines.filter(Boolean)); // Remove empty strings (optional fields)
  }

  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

// Helper function to escape special characters
function escapeText(text: string): string {
  return text
    .replace(/[\\;,]/g, (match) => '\\' + match)
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// For backward compatibility
export const generateICS = generateICSContent;
export const generateOutlookICS = generateICSContent;

// Generate filename for ICS download
export function generateICSFilename(prefix: string = 'dacapo-jaarplanner'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${prefix}-${year}${month}${day}.ics`;
}
