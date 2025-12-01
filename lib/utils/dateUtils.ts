import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, getWeek, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, addMonths, subMonths } from 'date-fns';
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

export function getMonthDates(date: Date, workweekOnly: boolean = false) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  // We want to show full weeks, so start from the beginning of the week of the 1st
  const calendarStart = startOfWeek(start, { weekStartsOn: 1 });
  // And end at the end of the week of the last day
  const calendarEnd = endOfWeek(end, { weekStartsOn: 1 });

  const dates = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  if (workweekOnly) {
    return dates.filter(date => !isWeekend(date));
  }

  return dates;
}

export function formatWeekNumber(date: Date) {
  return `Week ${getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 })}`;
}

export function formatDateHeader(date: Date) {
  return {
    dayName: format(date, 'EEEE', { locale: nl }),
    date: format(date, 'd MMMM', { locale: nl })
  };
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

export function getNextMonth(date: Date) {
  return addMonths(date, 1);
}

export function getPreviousMonth(date: Date) {
  return subMonths(date, 1);
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

export function getMonthName(date: Date) {
  return format(date, 'MMMM yyyy', { locale: nl });
}

export function getCurrentSchoolYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  // Assume school year starts in August (month index 7)
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

export function getNextSchoolYear(currentSchoolYear: string): string {
  const [start, end] = currentSchoolYear.split('/').map(Number);
  return `${start + 1}/${end + 1}`;
}
