import type { BadgeTone } from '@industry/mobile';

export type TicketPriority = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export const ALL_PRIORITIES: TicketPriority[] = ['very_low', 'low', 'medium', 'high', 'very_high'];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  very_low: 'Muito baixa',
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  very_high: 'Muito alta',
};

// Priority is a distinct axis from ticket status (see STATUS_TONES) — only
// the top level should read as urgent, so most of the scale stays neutral.
export const PRIORITY_TONES: Record<TicketPriority, BadgeTone> = {
  very_low: 'neutral',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  very_high: 'danger',
};

// "very_high" is the one priority badge that also renders solid (see call
// sites using `solid={isPriorityMaximum(priority)}`) — reserved for the top
// of the scale so a solid fill still reads as urgent once it's used.
export function isPriorityMaximum(priority: TicketPriority): boolean {
  return priority === 'very_high';
}
