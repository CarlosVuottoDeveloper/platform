import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../context/ToastContext/ToastContext';
import { useSubmitWrite } from './useSubmitWrite';

function Harness({ write, onClose }: { write: () => Promise<unknown>; onClose: () => void }) {
  const submit = useSubmitWrite(onClose);
  return (
    <button type="button" onClick={() => submit(write)}>
      Salvar
    </button>
  );
}

function setOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: online });
}

function renderHarness(write: () => Promise<unknown>) {
  const onClose = jest.fn();
  render(
    <ToastProvider>
      <Harness write={write} onClose={onClose} />
    </ToastProvider>,
  );
  return onClose;
}

describe('useSubmitWrite', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('closes after the write is confirmed', async () => {
    const onClose = renderHarness(() => Promise.resolve());

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open and warns when the write fails', async () => {
    const onClose = renderHarness(() => Promise.reject({ code: 'permission-denied' }));

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes right away when offline, since the write is queued locally', async () => {
    setOnline(false);
    const write = jest.fn(() => new Promise<void>(() => undefined));
    const onClose = renderHarness(write);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(write).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('Sem conexão. A alteração será enviada quando a internet voltar.'),
    ).toBeInTheDocument();
  });

  it('still warns if a write queued offline is later refused', async () => {
    setOnline(false);
    renderHarness(() => Promise.reject({ code: 'permission-denied' }));

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });
});
