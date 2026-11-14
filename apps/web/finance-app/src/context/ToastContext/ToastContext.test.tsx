import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastContext';

function Trigger() {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast('danger', 'Algo deu errado')}>
      Disparar
    </button>
  );
}

describe('ToastProvider', () => {
  it('shows a message and lets the user dismiss it', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Disparar' }));
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dispensar' }));
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument();
  });

  it('refuses to be used outside its provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Trigger />)).toThrow('useToast precisa de um ToastProvider');
    consoleError.mockRestore();
  });
});
