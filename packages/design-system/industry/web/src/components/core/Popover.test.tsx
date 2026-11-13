import { fireEvent, render, screen } from '@testing-library/react';
import { Popover } from './Popover';

describe('Popover', () => {
  it('is closed by default', () => {
    render(<Popover trigger="Abrir">Conteúdo</Popover>);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens when the trigger is clicked', () => {
    render(<Popover trigger="Abrir">Conteúdo</Popover>);

    fireEvent.click(screen.getByText('Abrir'));

    expect(screen.getByRole('dialog')).toHaveTextContent('Conteúdo');
  });

  it('toggles closed when the trigger is clicked again', () => {
    render(<Popover trigger="Abrir">Conteúdo</Popover>);
    const trigger = screen.getByText('Abrir');

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on Enter and Space when the trigger has focus', () => {
    render(<Popover trigger="Abrir">Conteúdo</Popover>);
    const trigger = screen.getByText('Abrir');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <Popover trigger="Abrir">Conteúdo</Popover>
        <button type="button">Fora</button>
      </div>,
    );

    fireEvent.click(screen.getByText('Abrir'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('Fora'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape while open', () => {
    render(<Popover trigger="Abrir">Conteúdo</Popover>);

    fireEvent.click(screen.getByText('Abrir'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports controlled open state via onOpenChange', () => {
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <Popover trigger="Abrir" open={false} onOpenChange={onOpenChange}>
        Conteúdo
      </Popover>,
    );

    fireEvent.click(screen.getByText('Abrir'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Popover trigger="Abrir" open={true} onOpenChange={onOpenChange}>
        Conteúdo
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('flips to the opposite side when the panel would render off-screen', () => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: -10, bottom: 0, left: 0, right: 0, width: 0, height: 0 } as DOMRect);

    render(
      <Popover trigger="Abrir" side="top">
        Conteúdo
      </Popover>,
    );

    fireEvent.click(screen.getByText('Abrir'));

    expect(screen.getByRole('dialog')).toHaveStyle({ top: '100%' });

    jest.restoreAllMocks();
  });

  it.each(['start', 'center', 'end'] as const)('aligns %s along the side axis', (align) => {
    render(
      <Popover trigger="Abrir" align={align}>
        Conteúdo
      </Popover>,
    );

    fireEvent.click(screen.getByText('Abrir'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the panel as a rounded surface-2 card without an outline', () => {
    render(<Popover trigger="Abrir">Conteúdo</Popover>);
    fireEvent.click(screen.getByText('Abrir'));

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveStyle({
      background: 'var(--color-surface-2)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
    });
    expect(panel.style.overflow).toBe('');
    expect(panel.style.border).toBe('');
  });
});
