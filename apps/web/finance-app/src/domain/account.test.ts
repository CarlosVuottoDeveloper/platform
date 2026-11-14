import { ACCOUNT_TYPE_LABELS, groupAccounts, isLiability } from './account';
import type { Account } from './account';

const account = (overrides: Partial<Account>): Account => ({
  id: 'a',
  name: 'Conta',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 0,
  openingDate: '2026-01-01',
  archived: false,
  ...overrides,
});

describe('account', () => {
  it('labels every account type in Portuguese', () => {
    expect(ACCOUNT_TYPE_LABELS).toEqual({
      bank: 'Banco',
      digital_wallet: 'Carteira digital',
      cash: 'Dinheiro',
      investment: 'Investimentos',
      credit_card: 'Cartão de crédito',
      loan: 'Dívida/Empréstimo',
    });
  });

  it('treats credit cards and loans as liabilities', () => {
    expect(isLiability('credit_card')).toBe(true);
    expect(isLiability('loan')).toBe(true);
    expect(isLiability('bank')).toBe(false);
    expect(isLiability('digital_wallet')).toBe(false);
    expect(isLiability('cash')).toBe(false);
    expect(isLiability('investment')).toBe(false);
  });

  it('groups accounts into assets, liabilities and archived, sorted by name', () => {
    const nubank = account({ id: '1', name: 'Nubank' });
    const carteira = account({ id: '2', name: 'Carteira', type: 'cash' });
    const cartao = account({ id: '3', name: 'Cartão', type: 'credit_card' });
    const antiga = account({ id: '4', name: 'Antiga', archived: true });
    const cartaoAntigo = account({
      id: '5',
      name: 'Cartão antigo',
      type: 'credit_card',
      archived: true,
    });

    expect(groupAccounts([nubank, cartao, antiga, carteira, cartaoAntigo])).toEqual({
      assets: [carteira, nubank],
      liabilities: [cartao],
      archived: [antiga, cartaoAntigo],
    });
  });
});
