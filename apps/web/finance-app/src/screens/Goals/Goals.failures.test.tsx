import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetSheet } from '../../components/BudgetSheet/BudgetSheet';
import { ContributionSheet } from '../../components/ContributionSheet/ContributionSheet';
import { GoalSheet } from '../../components/GoalSheet/GoalSheet';
import type { Category } from '../../domain/category';
import { setBudget } from '../../services/budgetsService';
import {
  addContribution,
  createGoal,
  deleteContribution,
  deleteGoal,
  subscribeToContributions,
} from '../../services/goalsService';
import { mockSignedInAs, mockUserData, renderSignedIn, testUser } from '../../test-utils';
import { Goals } from './Goals';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/goalsService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const trip = { id: 'g1', name: 'Viagem de Férias', targetCents: 1000000, deadline: null };
const contributions = { g1: [{ id: 'k1', amountCents: 250000, date: '2026-02-01' }] };
const food = { id: 'c1', name: 'Alimentação', kind: 'expense', archived: false } as Category;

describe('Goals — failures and validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    mockUserData({ goals: [trip], contributions });
  });

  it('warns when removing a contribution or deleting a goal fails', async () => {
    jest.mocked(deleteContribution).mockRejectedValue({ code: 'unavailable' });
    jest.mocked(deleteGoal).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Remover aporte de 01/02/2026' }));
    expect(await screen.findByText('Não foi possível excluir.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Viagem de Férias' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );
    expect(await screen.findAllByText('Não foi possível excluir.')).toHaveLength(2);
  });

  it('warns when the contributions of a goal cannot be loaded', () => {
    jest
      .mocked(subscribeToContributions)
      .mockImplementation((_uid, _goalId, _onChange, onError) => {
        onError('permission-denied');
        return jest.fn();
      });

    renderSignedIn(<Goals />);

    expect(screen.getAllByText('Não foi possível carregar seus dados.').length).toBeGreaterThan(0);
  });

  it('shows a goal that has no contributions yet', () => {
    mockUserData({ goals: [trip] });

    renderSignedIn(<Goals />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('validates a contribution and a goal deadline, and warns when saving a goal fails', async () => {
    jest.mocked(createGoal).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Aportar em Viagem de Férias' }));
    await userEvent.clear(screen.getByLabelText('Data'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe o valor')).toBeInTheDocument();
    expect(screen.getByText('Informe a data')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await userEvent.click(screen.getByRole('button', { name: 'Nova meta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Carro');
    await userEvent.type(screen.getByLabelText('Valor alvo'), '50.000');
    await userEvent.type(screen.getByLabelText('Prazo (opcional)'), '2027-06-30');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createGoal).toHaveBeenCalledWith(
      testUser.uid,
      expect.objectContaining({ deadline: '2027-06-30' }),
    );
    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });

  it('saves nothing from the forms once the session has ended', async () => {
    mockSignedInAs(null);
    renderSignedIn(
      <>
        <GoalSheet goal={trip} onClose={jest.fn()} />
        <ContributionSheet goal={trip} onClose={jest.fn()} />
        <BudgetSheet
          category={food}
          budget={{ id: 'c1', categoryId: 'c1', limitCents: 100 }}
          onClose={jest.fn()}
        />
      </>,
    );

    for (const amount of screen.getAllByLabelText(/Valor$|Teto mensal/)) {
      await userEvent.type(amount, '10');
    }
    for (const button of screen.getAllByRole('button', { name: /Salvar|Remover teto/ })) {
      await userEvent.click(button);
    }

    expect(addContribution).not.toHaveBeenCalled();
    expect(setBudget).not.toHaveBeenCalled();
  });
});
