import type { BadgeTone } from '@industry/mobile';

export type TicketStatus = 'open' | 'in_progress' | 'done';

export const ALL_STATUSES: TicketStatus[] = ['open', 'in_progress', 'done'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  done: 'Concluído',
};

export const STATUS_PLURAL_LABELS: Record<TicketStatus, string> = {
  open: 'abertos',
  in_progress: 'em andamento',
  done: 'concluídos',
};

export const STATUS_TONES: Record<TicketStatus, BadgeTone> = {
  open: 'accent',
  in_progress: 'warning',
  done: 'success',
};
