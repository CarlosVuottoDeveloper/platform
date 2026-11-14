import type { CalendarDate } from './calendarDate';
import type { Cents } from './money';

export interface Goal {
  id: string;
  name: string;
  targetCents: Cents;
  deadline: CalendarDate | null;
}

export type GoalInput = Omit<Goal, 'id'>;

export interface Contribution {
  id: string;
  amountCents: Cents;
  date: CalendarDate;
}

export type ContributionInput = Omit<Contribution, 'id'>;

export function goalProgress(
  goal: Goal,
  contributions: Contribution[],
): { savedCents: Cents; remainingCents: Cents; ratio: number } {
  const savedCents = contributions.reduce(
    (total, contribution) => total + contribution.amountCents,
    0,
  );
  return {
    savedCents,
    remainingCents: Math.max(0, goal.targetCents - savedCents),
    ratio: Math.min(1, savedCents / goal.targetCents),
  };
}
