import type { TicketStatus } from '../../constants/ticketStatus';
import type { TicketPriority } from '../../constants/ticketPriority';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  creatorId: string;
  creatorName: string;
  createdAt: Date | null;
  assigneeId: string | null;
  assigneeName: string | null;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date | null;
}

const MONTH_ABBREVIATIONS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatDayMonth(date: Date | null): string {
  if (!date) return '';
  return `${pad(date.getDate())} ${MONTH_ABBREVIATIONS[date.getMonth()]}`;
}

export function formatDateLong(date: Date | null): string {
  if (!date) return '';
  return `${formatDayMonth(date)} ${date.getFullYear()}`;
}

export function formatDateTimeShort(date: Date | null): string {
  if (!date) return '';
  return `${formatDayMonth(date)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
