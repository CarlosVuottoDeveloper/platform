import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toCalendarDate } from '../../domain/calendarDate';
import {
  addContribution,
  createGoal,
  deleteContribution,
  deleteGoal,
  updateGoal,
} from '../../services/goalsService';
import { createTransaction } from '../../services/transactionsService';
import { mockSignedInAs, mockUserData, money, renderSignedIn, testUser } from '../../test-utils';
import { Goals } from './Goals';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/goalsService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const trip = { id: 'g1', name: 'Viagem de Férias', targetCents: 1000000, deadline: '2027-01-31' };
const reserve = { id: 'g2', name: 'Reserva de Emergência', targetCents: 500000, deadline: null };
const contributions = {
  g1: [
    { id: 'k1', amountCents: 250000, date: '2026-02-01' },
    { id: 'k2', amountCents: 250000, date: '2026-03-01' },
  ],
};

const card = (goalId: string) => within(screen.getByTestId(`goal-${goalId}`));

describe('Goals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    mockUserData({ goals: [trip, reserve], contributions });
  });

  it('invites the user to create the first goal', () => {
    mockUserData({ goals: [] });

    renderSignedIn(<Goals />);

    expect(screen.getByText('Nenhuma meta cadastrada')).toBeInTheDocument();
  });

  it('shows the progress of each goal with its deadline', () => {
    renderSignedIn(<Goals />);

    expect(card('g1').getByText(money('R$ 5.000,00 de R$ 10.000,00'))).toBeInTheDocument();
    expect(card('g1').getByText('50%')).toBeInTheDocument();
    expect(card('g1').getByText('Prazo: 31/01/2027')).toBeInTheDocument();
    expect(card('g2').getByText(money('R$ 0,00 de R$ 5.000,00'))).toBeInTheDocument();
    expect(card('g2').queryByText(/Prazo/)).not.toBeInTheDocument();
  });

  it('creates a goal without a deadline', async () => {
    jest.mocked(createGoal).mockResolvedValue('g-new');
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova meta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Carro');
    await userEvent.type(screen.getByLabelText('Valor alvo'), '50.000');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createGoal).toHaveBeenCalledWith(testUser.uid, {
      name: 'Carro',
      targetCents: 5000000,
      deadline: null,
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('requires a name and a target', async () => {
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova meta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o nome')).toBeInTheDocument();
    expect(screen.getByText('Informe o valor alvo')).toBeInTheDocument();
    expect(createGoal).not.toHaveBeenCalled();
  });

  it('edits a goal', async () => {
    jest.mocked(updateGoal).mockResolvedValue();
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Viagem de Férias' }));
    const target = screen.getByLabelText('Valor alvo');
    await userEvent.clear(target);
    await userEvent.type(target, '12.000');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateGoal).toHaveBeenCalledWith(testUser.uid, 'g1', {
      name: 'Viagem de Férias',
      targetCents: 1200000,
      deadline: '2027-01-31',
    });
  });

  it('records a contribution without creating an account movement', async () => {
    jest.mocked(addContribution).mockResolvedValue();
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Aportar em Reserva de Emergência' }));
    await userEvent.type(screen.getByLabelText('Valor'), '300');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(addContribution).toHaveBeenCalledWith(testUser.uid, 'g2', {
      amountCents: 30000,
      date: toCalendarDate(new Date()),
    });
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('lists the contributions of a goal and removes one', async () => {
    jest.mocked(deleteContribution).mockResolvedValue();
    renderSignedIn(<Goals />);

    expect(card('g1').getByText('01/03/2026')).toBeInTheDocument();
    await userEvent.click(card('g1').getByRole('button', { name: 'Remover aporte de 01/02/2026' }));

    expect(deleteContribution).toHaveBeenCalledWith(testUser.uid, 'g1', 'k1');
  });

  it('deletes a goal only after confirmation', async () => {
    jest.mocked(deleteGoal).mockResolvedValue();
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Viagem de Férias' }));
    expect(deleteGoal).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteGoal).toHaveBeenCalledWith(testUser.uid, 'g1');
  });

  it('warns when saving fails', async () => {
    jest.mocked(addContribution).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Goals />);

    await userEvent.click(screen.getByRole('button', { name: 'Aportar em Reserva de Emergência' }));
    await userEvent.type(screen.getByLabelText('Valor'), '300');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });
});
