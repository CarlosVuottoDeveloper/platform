import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Category } from '../../domain/category';
import {
  createCategory,
  seedDefaultCategories,
  setCategoryArchived,
  subscribeToCategories,
  updateCategory,
} from '../../services/categoriesService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { Settings } from './Settings';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/transactionsService');
jest.mock('../../services/categoriesService');

const category = (overrides: Partial<Category>): Category => ({
  id: 'c1',
  name: 'Alimentação',
  kind: 'expense',
  color: 'viz-5',
  icon: 'utensils',
  archived: false,
  ...overrides,
});

function mockCategories(categories: Category[]) {
  jest.mocked(subscribeToCategories).mockImplementation((_uid, onChange) => {
    onChange(categories);
    return jest.fn();
  });
}

describe('Settings — categories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    mockCategories([
      category({ id: 'c1', name: 'Alimentação' }),
      category({ id: 'c2', name: 'Salário', kind: 'income' }),
      category({ id: 'c3', name: 'Antiga', archived: true }),
    ]);
  });

  it('seeds the default categories once for the signed-in user', async () => {
    renderSignedIn(<Settings />);
    await userEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(seedDefaultCategories).toHaveBeenCalledTimes(1);
    expect(seedDefaultCategories).toHaveBeenCalledWith(testUser.uid);
  });

  it('lists categories by kind, with archived ones apart', () => {
    renderSignedIn(<Settings />);

    expect(
      within(screen.getByRole('region', { name: 'Categorias de despesa' })).getByText(
        'Alimentação',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Categorias de receita' })).getByText('Salário'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Categorias arquivadas' })).getByText('Antiga'),
    ).toBeInTheDocument();
  });

  it('creates a category', async () => {
    jest.mocked(createCategory).mockResolvedValue('new-id');
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nome'), 'Pets');
    await userEvent.selectOptions(within(dialog).getByLabelText('Tipo'), 'Receita');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(createCategory).toHaveBeenCalledWith(testUser.uid, {
      name: 'Pets',
      kind: 'income',
      color: 'viz-1',
      icon: 'tag',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requires a name', async () => {
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o nome')).toBeInTheDocument();
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('renames a category without changing its kind', async () => {
    jest.mocked(updateCategory).mockResolvedValue();
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Alimentação' }));
    const name = screen.getByLabelText('Nome');
    await userEvent.clear(name);
    await userEvent.type(name, 'Mercado');
    expect(screen.getByLabelText('Tipo')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateCategory).toHaveBeenCalledWith(testUser.uid, 'c1', {
      name: 'Mercado',
      kind: 'expense',
      color: 'viz-5',
      icon: 'utensils',
    });
  });

  it('archives and unarchives a category', async () => {
    jest.mocked(setCategoryArchived).mockResolvedValue();
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Arquivar Alimentação' }));
    expect(setCategoryArchived).toHaveBeenCalledWith(testUser.uid, 'c1', true);

    await userEvent.click(screen.getByRole('button', { name: 'Desarquivar Antiga' }));
    expect(setCategoryArchived).toHaveBeenCalledWith(testUser.uid, 'c3', false);
  });

  it('warns when saving fails and keeps the form open', async () => {
    jest.mocked(createCategory).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Pets');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Pets');
  });
});
