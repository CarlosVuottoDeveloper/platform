import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteCurrentUser } from '../../services/authService';
import { deleteAllUserData, downloadAllData } from '../../services/userDataService';
import { mockSignedInAs, renderForUser, testUser } from '../../test-utils';
import { DataSection } from './DataSection';

jest.mock('../../services/authService');
jest.mock('../../services/userDataService');

describe('DataSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
  });

  it('exports all of the user data', async () => {
    jest.mocked(downloadAllData).mockResolvedValue();
    renderForUser(<DataSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Exportar meus dados' }));

    expect(downloadAllData).toHaveBeenCalledWith(testUser.uid);
  });

  it('warns when the export fails', async () => {
    jest.mocked(downloadAllData).mockRejectedValue({ code: 'unavailable' });
    renderForUser(<DataSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Exportar meus dados' }));

    expect(await screen.findByText('Não foi possível exportar.')).toBeInTheDocument();
  });

  it('only deletes after the user types EXCLUIR, erasing the data before the account', async () => {
    const calls: string[] = [];
    jest.mocked(deleteAllUserData).mockImplementation(async () => {
      calls.push('data');
    });
    jest.mocked(deleteCurrentUser).mockImplementation(async () => {
      calls.push('account');
    });
    renderForUser(<DataSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('button', { name: 'Excluir tudo' })).toBeDisabled();
    await userEvent.type(dialog.getByLabelText('Digite EXCLUIR para confirmar'), 'excluir');
    expect(dialog.getByRole('button', { name: 'Excluir tudo' })).toBeDisabled();
    await userEvent.clear(dialog.getByLabelText('Digite EXCLUIR para confirmar'));
    await userEvent.type(dialog.getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await userEvent.click(dialog.getByRole('button', { name: 'Excluir tudo' }));

    await waitFor(() => expect(calls).toEqual(['data', 'account']));
    expect(deleteAllUserData).toHaveBeenCalledWith(testUser.uid);
  });

  it('keeps the account when erasing the data fails', async () => {
    jest.mocked(deleteAllUserData).mockRejectedValue({ code: 'unavailable' });
    renderForUser(<DataSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.type(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir tudo' }));

    expect(
      await screen.findByText('Não foi possível excluir. Tente novamente.'),
    ).toBeInTheDocument();
    expect(deleteCurrentUser).not.toHaveBeenCalled();
  });

  it('explains what happened when the data is gone but the account could not be removed', async () => {
    jest.mocked(deleteAllUserData).mockResolvedValue();
    jest.mocked(deleteCurrentUser).mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    renderForUser(<DataSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.type(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir tudo' }));

    expect(
      await screen.findByText(
        'Seus dados foram excluídos, mas o acesso não pôde ser removido. Tente excluir a conta de novo.',
      ),
    ).toBeInTheDocument();
  });

  it('closes without deleting when cancelled', async () => {
    renderForUser(<DataSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteAllUserData).not.toHaveBeenCalled();
  });
});
