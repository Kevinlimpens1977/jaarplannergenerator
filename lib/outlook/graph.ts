import type { EventWithDetails } from '@/lib/types/database';

// Configuration
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

interface GraphEvent {
  subject: string;
  body: {
    contentType: 'HTML';
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  isAllDay: boolean;
  categories: string[];
}

// Helper to convert our Event to Graph Event
function mapEventToGraph(event: EventWithDetails): GraphEvent {
  const calendarNames = event.event_calendars
    .map((ec) => ec.calendars.name)
    .join(', ');

  const description = `
    <p>${event.description || ''}</p>
    <br/>
    <p><strong>Kalenders:</strong> ${calendarNames}</p>
    <p><strong>Doelgroep:</strong> ${event.audience || 'Niet gespecificeerd'}</p>
    <p><strong>Categorie:</strong> ${event.category || 'Algemeen'}</p>
  `;

  return {
    subject: event.title,
    body: {
      contentType: 'HTML',
      content: description,
    },
    start: {
      dateTime: event.start_datetime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: event.end_datetime,
      timeZone: 'UTC',
    },
    location: event.location
      ? {
          displayName: event.location,
        }
      : undefined,
    isAllDay: event.all_day,
    categories: [
      'DaCapo Jaarplanner',
      ...(event.category ? [event.category] : []),
    ],
  };
}

// Create event in Outlook
export async function createOutlookEvent(
  accessToken: string,
  event: EventWithDetails,
  calendarId: string = 'primary' // Or a specific calendar ID
): Promise<string> {
  const graphEvent = mapEventToGraph(event);

  const response = await fetch(`${GRAPH_ENDPOINT}/me/calendars/${calendarId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphEvent),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error creating Outlook event: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id; // Return the Outlook ID
}

// Update event in Outlook
export async function updateOutlookEvent(
  accessToken: string,
  outlookId: string,
  event: EventWithDetails,
  calendarId: string = 'primary'
): Promise<void> {
  const graphEvent = mapEventToGraph(event);

  const response = await fetch(
    `${GRAPH_ENDPOINT}/me/calendars/${calendarId}/events/${outlookId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphEvent),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error updating Outlook event: ${JSON.stringify(error)}`);
  }
}

// Delete event from Outlook
export async function deleteOutlookEvent(
  accessToken: string,
  outlookId: string,
  calendarId: string = 'primary'
): Promise<void> {
  const response = await fetch(
    `${GRAPH_ENDPOINT}/me/calendars/${calendarId}/events/${outlookId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error deleting Outlook event: ${JSON.stringify(error)}`);
  }
}

// Create a dedicated calendar for the planner
export async function createPlannerCalendar(
  accessToken: string,
  name: string = 'DaCapo Jaarplanner'
): Promise<string> {
  const response = await fetch(`${GRAPH_ENDPOINT}/me/calendars`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error creating calendar: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}