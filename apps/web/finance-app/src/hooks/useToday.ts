import { useEffect, useState } from 'react';
import { toCalendarDate } from '../domain/calendarDate';
import type { CalendarDate } from '../domain/calendarDate';

function millisecondsUntilTomorrow(now: Date): number {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime() - now.getTime();
}

export function useToday(): CalendarDate {
  const [today, setToday] = useState(() => toCalendarDate(new Date()));

  useEffect(() => {
    const timer = setTimeout(
      () => setToday(toCalendarDate(new Date())),
      millisecondsUntilTomorrow(new Date()),
    );
    return () => clearTimeout(timer);
  }, [today]);

  return today;
}
