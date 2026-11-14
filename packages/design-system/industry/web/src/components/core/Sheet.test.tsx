import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Sheet } from './Sheet';

async function renderSheet(ui: ReactElement) {
  const result = render(ui);
  const close = screen.getByRole('button', { name: 'Fechar' });
  await waitFor(() => expect(close.querySelector('svg')).not.toBeNull());
  return result;
}

describe('Sheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Sheet open={false}>Conteúdo</Sheet>);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title, children and actions when open', () => {
    render(
      <Sheet title="Título" actions={<button type="button">Ação</button>}>
        <p>Conteúdo</p>
      </Sheet>,
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  it('is an accessible dialog', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onDismiss when the backdrop is clicked', async () => {
    const onDismiss = jest.fn();
    await renderSheet(
      <Sheet title="Título" onDismiss={onDismiss}>
        Conteúdo
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not call onDismiss when the sheet body is clicked', async () => {
    const onDismiss = jest.fn();
    await renderSheet(
      <Sheet title="Título" onDismiss={onDismiss}>
        Conteúdo
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('dialog'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('rounds only its top corners on a gradient surface with a soft border', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByRole('dialog')).toHaveStyle({
      background: 'var(--gradient-surface) border-box no-repeat',
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      border: '1px solid var(--color-divider)',
    });
  });

  it('sizes the title with the h4 token', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByText('Título')).toHaveStyle({ fontSize: 'var(--text-h4)' });
  });

  it('applies the consumer style to the dialog', () => {
    render(
      <Sheet title="Título" style={{ maxWidth: 480 }}>
        Conteúdo
      </Sheet>,
    );

    expect(screen.getByRole('dialog')).toHaveStyle({ maxWidth: '480px' });
  });

  it('offers a close button that dismisses the sheet', async () => {
    const onDismiss = jest.fn();
    await renderSheet(
      <Sheet title="Título" onDismiss={onDismiss}>
        Conteúdo
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has no close button when it cannot be dismissed', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
  });

  it('dismisses on Escape', async () => {
    const onDismiss = jest.fn();
    await renderSheet(
      <Sheet title="Título" onDismiss={onDismiss}>
        Conteúdo
      </Sheet>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('is named by its title', () => {
    render(<Sheet title="Nova movimentação">Conteúdo</Sheet>);

    expect(screen.getByRole('dialog', { name: 'Nova movimentação' })).toBeInTheDocument();
  });

  it('focuses the first control of the content, not the close button', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
        <button type="button">Salvar</button>
      </Sheet>,
    );

    expect(screen.getByRole('textbox', { name: 'Valor' })).toHaveFocus();
  });

  it('focuses the close button when the content has no control', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <p>Só texto</p>
      </Sheet>,
    );

    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('skips disabled controls when choosing the first focus', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <button type="button" disabled>
          Inativo
        </button>
        <button type="button">Ativo</button>
      </Sheet>,
    );

    expect(screen.getByRole('button', { name: 'Ativo' })).toHaveFocus();
  });

  it('wraps Tab from the last control back to the first', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
        <button type="button">Salvar</button>
      </Sheet>,
    );
    const last = screen.getByRole('button', { name: 'Salvar' });
    act(() => last.focus());

    fireEvent.keyDown(last, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('wraps Shift+Tab from the first control to the last', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
        <button type="button">Salvar</button>
      </Sheet>,
    );
    const first = screen.getByRole('button', { name: 'Fechar' });
    act(() => first.focus());

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus();
  });

  it('leaves Tab alone between controls in the middle', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
        <button type="button">Salvar</button>
      </Sheet>,
    );
    const middle = screen.getByRole('textbox', { name: 'Valor' });
    act(() => middle.focus());

    const notPrevented = fireEvent.keyDown(middle, { key: 'Tab' });

    expect(notPrevented).toBe(true);
    expect(middle).toHaveFocus();
  });

  it('returns focus to the element that opened it once closed', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { unmount } = await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
      </Sheet>,
    );
    expect(screen.getByRole('textbox', { name: 'Valor' })).toHaveFocus();

    unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('closes quietly when the element that opened it is gone', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
      </Sheet>,
    );
    expect(screen.getByRole('textbox', { name: 'Valor' })).toHaveFocus();
    opener.remove();

    expect(() => rerender(<Sheet open={false}>Conteúdo</Sheet>)).not.toThrow();
    expect(document.body).toHaveFocus();
  });

  it('brings Tab back into the sheet after a click left focus outside its controls', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
      </Sheet>,
    );
    act(() => (document.activeElement as HTMLElement).blur());

    fireEvent.keyDown(document.body, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('wraps Shift+Tab to the last control when focus sits on the sheet itself', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input aria-label="Valor" />
        <button type="button">Salvar</button>
      </Sheet>,
    );
    act(() => screen.getByRole('dialog').focus());

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus();
  });

  it('still dismisses on Escape after a click left focus outside its controls', async () => {
    const onDismiss = jest.fn();
    await renderSheet(
      <Sheet title="Título" onDismiss={onDismiss}>
        <input aria-label="Valor" />
      </Sheet>,
    );
    act(() => (document.activeElement as HTMLElement).blur());

    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('can hold focus itself so a click on its body keeps focus inside', () => {
    render(<Sheet title="Título">Conteúdo</Sheet>);

    expect(screen.getByRole('dialog')).toHaveAttribute('tabindex', '-1');
  });

  it('starts on the chosen option of a radio group', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input type="radio" name="kind" value="expense" aria-label="Despesa" readOnly />
        <input type="radio" name="kind" value="income" aria-label="Receita" checked readOnly />
        <input aria-label="Valor" />
      </Sheet>,
    );

    expect(screen.getByRole('radio', { name: 'Receita' })).toHaveFocus();
  });

  it('ignores hidden inputs when choosing the first focus', async () => {
    await renderSheet(
      <Sheet title="Título" onDismiss={() => undefined}>
        <input type="hidden" name="id" value="x" />
        <input aria-label="Valor" />
      </Sheet>,
    );

    expect(screen.getByRole('textbox', { name: 'Valor' })).toHaveFocus();
  });

  it('lets only the innermost of two nested sheets react to Escape', async () => {
    const outer = jest.fn();
    const inner = jest.fn();
    render(
      <Sheet title="Fora" onDismiss={outer}>
        <Sheet title="Dentro" onDismiss={inner}>
          <input aria-label="Valor" />
        </Sheet>
      </Sheet>,
    );
    const [outerClose, innerClose] = screen.getAllByRole('button', { name: 'Fechar' });
    await waitFor(() => expect(outerClose?.querySelector('svg')).not.toBeNull());
    await waitFor(() => expect(innerClose?.querySelector('svg')).not.toBeNull());

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Valor' }), { key: 'Escape' });

    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});
