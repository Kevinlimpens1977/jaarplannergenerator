import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, getWeek, isSameDay, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export function getWeekDates(date: Date, workweekOnly: boolean = false) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Maandag
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Zondag
  
  const dates = [];
  let currentDate = start;
  
  while (currentDate <= end) {
    // If workweek only, skip Saturday (6) and Sunday (0)
    if (!workweekOnly || (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)) {
      dates.push(currentDate);
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

export function formatWeekNumber(date: Date) {
  return `Week ${getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 })}`;
}

export function formatDateHeader(date: Date) {
  return format(date, 'EEEE d MMMM', { locale: nl });
}

export function formatShortDate(date: Date) {
  return format(date, 'EEE d', { locale: nl });
}

export function getNextWeek(date: Date) {
  return addWeeks(date, 1);
}

export function getPreviousWeek(date: Date) {
  return subWeeks(date, 1);
}

export function formatEventTime(startDateTime: string, endDateTime: string, allDay: boolean) {
  if (allDay) {
    return 'Hele dag';
  }
  
  const start = parseISO(startDateTime);
  const end = parseISO(endDateTime);
  
  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
}

export function isEventOnDay(eventStart: string, eventEnd: string, day: Date) {
  const start = parseISO(eventStart);
  const end = parseISO(eventEnd);
  
  // Check if day is between start and end (inclusive)
  return day >= startOfDay(start) && day <= endOfWeek(end, { weekStartsOn: 1 });
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getMonthYearRange(date: Date) {
  const weekDates = getWeekDates(date);
  const firstDate = weekDates[0];
  const lastDate = weekDates[weekDates.length - 1];
  
  if (firstDate.getMonth() === lastDate.getMonth()) {
    return format(firstDate, 'MMMM yyyy', { locale: nl });
  } else {
    return `${format(firstDate, 'MMMM', { locale: nl })} - ${format(lastDate, 'MMMM yyyy', { locale: nl })}`;
  }
}
