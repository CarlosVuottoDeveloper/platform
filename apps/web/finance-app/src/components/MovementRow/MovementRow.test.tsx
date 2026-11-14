import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import type { Transaction } from '../../domain/transaction';
import { tx } from '../../domain/transaction.test-helpers';
import { mockWideScreen, money } from '../../test-utils';
import { MovementRow } from './MovementRow';

const accounts = [
  { id: 'a1', name: 'Nubank', type: 'bank' },
  { id: 'a2', name: 'Carteira', type: 'cash' },
] as Account[];
const categories = [
  { id: 'c1', name: 'Alimentação', kind: 'expense' },
  { id: 'c3', name: 'Salário', kind: 'income' },
] as Category[];

interface RowOptions {
  pending?: boolean;
  forecast?: boolean;
  showDate?: boolean;
  withActions?: boolean;
  divided?: boolean;
}

function renderRow(
  transaction: Transaction,
  {
    pending = false,
    forecast = false,
    showDate = false,
    withActions = true,
    divided = false,
  }: RowOptions = {},
) {
  const actions = withActions ? { onEdit: jest.fn(), onDelete: jest.fn() } : null;
  render(
    <ul>
      <MovementRow
        transaction={transaction}
        accounts={accounts}
        categories={categories}
        pending={pending}
        forecast={forecast}
        showDate={showDate}
        actions={actions}
        divided={divided}
      />
    </ul>,
  );
  return { row: screen.getByTestId(`transaction-${transaction.id}`), actions };
}

describe('MovementRow', () => {
  beforeEach(() => mockWideScreen(false));

  it('names the movement by its description, with category and account below', () => {
    const { row } = renderRow(
      tx({ id: 'e1', description: 'Mercado', accountId: 'a1', categoryId: 'c1' }),
    );

    expect(within(row).getByText('Mercado')).toBeInTheDocument();
    expect(within(row).getByText('Alimentação · Nubank')).toBeInTheDocument();
  });

  it('falls back to the category name without a description', () => {
    const { row } = renderRow(tx({ id: 'e2', accountId: 'a1', categoryId: 'c1' }));

    expect(within(row).getByText('Alimentação')).toBeInTheDocument();
  });

  it('describes a transfer by its two accounts and offers no edit', () => {
    const { row } = renderRow(
      tx({ id: 'tr', kind: 'transfer', accountId: 'a1', toAccountId: 'a2' }),
    );

    expect(within(row).getByText('Transferência')).toBeInTheDocument();
    expect(within(row).getByText('Nubank → Carteira')).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Excluir Transferência' })).toBeInTheDocument();
  });

  it('starts the detail with the date when asked', () => {
    const { row } = renderRow(
      tx({ id: 'd1', date: '2026-11-14', accountId: 'a1', categoryId: 'c1' }),
      { showDate: true },
    );

    expect(within(row).getByText('14/11/2026 · Alimentação · Nubank')).toBeInTheDocument();
  });

  it('shows which instalment it is', () => {
    const { row } = renderRow(
      tx({ id: 'i3', accountId: 'a1', installment: { groupId: 'g', index: 3, count: 10 } }),
    );

    expect(within(row).getByText('3 de 10')).toBeInTheDocument();
  });

  it('flags an upcoming movement and still lets it be edited or deleted', () => {
    const { row } = renderRow(tx({ id: 'p1', description: 'Aluguel', accountId: 'a1' }), {
      pending: true,
    });

    expect(within(row).getByText('Prevista')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Editar Aluguel' })).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Excluir Aluguel' })).toBeInTheDocument();
  });

  it('offers no buttons on a recurring forecast', () => {
    const { row } = renderRow(tx({ id: 'f1', description: 'Aluguel', accountId: 'a1' }), {
      pending: true,
      forecast: true,
    });

    expect(within(row).queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers no buttons without actions', () => {
    const { row } = renderRow(tx({ id: 'n1', description: 'Café', accountId: 'a1' }), {
      withActions: false,
    });

    expect(within(row).queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls the edit and delete actions', async () => {
    const { row, actions } = renderRow(tx({ id: 'c1x', description: 'Café', accountId: 'a1' }));

    await userEvent.click(within(row).getByRole('button', { name: 'Editar Café' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Excluir Café' }));

    expect(actions?.onEdit).toHaveBeenCalledTimes(1);
    expect(actions?.onDelete).toHaveBeenCalledTimes(1);
  });

  it('colours income green and signs it', () => {
    const { row } = renderRow(
      tx({ id: 's1', kind: 'income', amountCents: 820000, accountId: 'a1', categoryId: 'c3' }),
    );

    const amount = within(row).getByText(money('+R$ 8.200,00'));
    expect(amount.style.color).toBe('var(--color-success-300)');
  });

  it('draws the type icon inside a small bubble', () => {
    const { row } = renderRow(tx({ id: 'b1', accountId: 'a1' }));

    const bubble = row.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(bubble.style.width).toBe('32px');
  });

  it('cuts a long title with an ellipsis instead of widening the row', () => {
    const { row } = renderRow(
      tx({ id: 'l1', description: 'Uma descrição muito longa'.repeat(5), accountId: 'a1' }),
    );

    const title = within(row).getByText(/Uma descrição muito longa/);
    expect(title.style.textOverflow).toBe('ellipsis');
    expect(title.style.whiteSpace).toBe('nowrap');
    expect(title.parentElement?.style.minWidth).toBe('0');
  });

  it('keeps a long title from widening the page around it', () => {
    const { row } = renderRow(
      tx({ id: 'l2', description: 'Uma descrição muito longa'.repeat(5), accountId: 'a1' }),
    );

    const textColumn = within(row).getByText(/Uma descrição muito longa/).parentElement;
    expect(textColumn?.style.width).toBe('0px');
    expect(textColumn?.style.flexGrow).toBe('1');
  });

  it('keeps title and amount together on the first line of a narrow screen', () => {
    const { row } = renderRow(
      tx({
        id: 'n2',
        description: 'Notebook',
        amountCents: 42000,
        accountId: 'a1',
        installment: { groupId: 'g', index: 3, count: 10 },
      }),
      { pending: true },
    );

    const [firstLine, secondLine] = [...row.children] as HTMLElement[];
    expect(firstLine).toContainElement(within(row).getByText('Notebook'));
    expect(firstLine).toContainElement(within(row).getByText(money('-R$ 420,00')));
    expect(secondLine).toContainElement(within(row).getByText('3 de 10'));
    expect(secondLine).toContainElement(within(row).getByText('Prevista'));
    expect(secondLine).toContainElement(
      within(row).getByRole('button', { name: 'Editar Notebook' }),
    );
  });

  it('has no second line on a narrow screen when there is nothing to put there', () => {
    const { row } = renderRow(tx({ id: 'n3', description: 'Café', accountId: 'a1' }), {
      withActions: false,
    });

    expect(row.children).toHaveLength(1);
  });

  it('lays everything on one line on a wide screen', () => {
    mockWideScreen(true);
    const { row } = renderRow(tx({ id: 'w1', description: 'Café', accountId: 'a1' }));

    expect(row.style.display).toBe('flex');
    expect(row).toContainElement(within(row).getByRole('button', { name: 'Editar Café' }));
    expect(within(row).getByText('Café').parentElement?.parentElement).toBe(row);
  });

  it('draws a divider above it only when asked, never below', () => {
    const { row } = renderRow(tx({ id: 'd2', accountId: 'a1' }), { divided: true });

    expect(row.style.borderTop).toBe('1px solid var(--color-divider)');
    expect(row.style.borderBottom).toBe('');
  });

  it('draws no divider for the first row', () => {
    const { row } = renderRow(tx({ id: 'd3', accountId: 'a1' }));

    expect(row.style.borderTop).toBe('');
    expect(row.style.borderBottom).toBe('');
  });
});
