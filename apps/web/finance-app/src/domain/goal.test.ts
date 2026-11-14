import { goalProgress } from './goal';
import type { Goal } from './goal';

const goal: Goal = { id: 'g1', name: 'Viagem', targetCents: 1000000, deadline: null };
const contribution = (amountCents: number, id = String(amountCents)) => ({
  id,
  amountCents,
  date: '2026-03-01',
});

describe('goalProgress', () => {
  it('sums the contributions against the target', () => {
    expect(goalProgress(goal, [contribution(250000, 'a'), contribution(250000, 'b')])).toEqual({
      savedCents: 500000,
      remainingCents: 500000,
      ratio: 0.5,
    });
  });

  it('starts at zero', () => {
    expect(goalProgress(goal, [])).toEqual({ savedCents: 0, remainingCents: 1000000, ratio: 0 });
  });

  it('caps the ratio at 1 and never shows a negative remainder', () => {
    expect(goalProgress(goal, [contribution(1200000)])).toEqual({
      savedCents: 1200000,
      remainingCents: 0,
      ratio: 1,
    });
  });
});
