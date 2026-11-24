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

export const PRIORITY_TONES: Record<TicketPriority, BadgeTone> = {
  very_low: 'neutral',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  very_high: 'danger',
};

export function isPriorityMaximum(priority: TicketPriority): boolean {
  return priority === 'very_high';
}
