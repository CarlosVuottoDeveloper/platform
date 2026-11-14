import { tx } from '../../domain/transaction.test-helpers';
import { movementIconName } from './movementIcon';

const installment = { groupId: 'g', index: 3, count: 10 };

describe('movementIconName', () => {
  it('shows a calendar for anything still to come, whatever its kind', () => {
    expect(movementIconName(tx({ kind: 'expense' }), { pending: true })).toBe('calendar-check');
    expect(movementIconName(tx({ kind: 'income' }), { pending: true })).toBe('calendar-check');
    expect(movementIconName(tx({ kind: 'transfer', toAccountId: 'b' }), { pending: true })).toBe(
      'calendar-check',
    );
  });

  it('shows arrows both ways for a transfer', () => {
    expect(movementIconName(tx({ kind: 'transfer', toAccountId: 'b' }), { pending: false })).toBe(
      'arrow-left-right',
    );
  });

  it('shows a card for an instalment', () => {
    expect(movementIconName(tx({ kind: 'expense', installment }), { pending: false })).toBe(
      'credit-card',
    );
  });

  it('shows a rising line for income and a falling one for an expense', () => {
    expect(movementIconName(tx({ kind: 'income' }), { pending: false })).toBe('trending-up');
    expect(movementIconName(tx({ kind: 'expense' }), { pending: false })).toBe('trending-down');
  });
});
