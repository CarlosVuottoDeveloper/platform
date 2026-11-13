import { fireEvent, render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders the label as a hidden tooltip role', () => {
    render(
      <Tooltip label="Excluir">
        <button type="button">Ação</button>
      </Tooltip>,
    );

    expect(screen.getByRole('tooltip')).toHaveTextContent('Excluir');
  });

  it('opens on hover and closes on mouse leave', () => {
    render(
      <Tooltip label="Excluir">
        <button type="button">Ação</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole('tooltip').parentElement as HTMLElement;

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '1' });

    fireEvent.mouseLeave(wrapper);
    expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '0' });
  });

  it('opens on focus and closes on blur', () => {
    render(
      <Tooltip label="Excluir">
        <button type="button">Ação</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole('tooltip').parentElement as HTMLElement;

    fireEvent.focus(wrapper);
    expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '1' });

    fireEvent.blur(wrapper);
    expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '0' });
  });

  it('closes on Escape while open', () => {
    render(
      <Tooltip label="Excluir">
        <button type="button">Ação</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole('tooltip').parentElement as HTMLElement;

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '1' });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('tooltip')).toHaveStyle({ opacity: '0' });
  });

  it('wires aria-describedby onto a valid element child', () => {
    render(
      <Tooltip label="Excluir">
        <button type="button">Ação</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Ação' });
    const tooltip = screen.getByRole('tooltip');

    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('accepts non-element children as-is', () => {
    render(<Tooltip label="Excluir">Texto simples</Tooltip>);

    expect(screen.getByText('Texto simples')).toBeInTheDocument();
  });

  it('flips to the opposite side when the tooltip would render off-screen', () => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: -10, bottom: 0, left: 0, right: 0, width: 0, height: 0 } as DOMRect);

    render(
      <Tooltip label="Excluir" side="top">
        <button type="button">Ação</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole('tooltip').parentElement as HTMLElement;

    fireEvent.mouseEnter(wrapper);

    expect(screen.getByRole('tooltip')).toHaveStyle({ top: '100%' });

    jest.restoreAllMocks();
  });

  it('renders the bubble as a rounded surface-2 card in the body font', () => {
    render(
      <Tooltip label="Excluir">
        <button type="button">Ação</button>
      </Tooltip>,
    );

    const bubble = screen.getByRole('tooltip');
    expect(bubble.style.background).toBe('var(--color-surface-2)');
    expect(bubble.style.borderRadius).toBe('var(--radius-md)');
    expect(bubble.style.border).toBe('1px solid var(--color-divider-strong)');
    expect(bubble.style.boxShadow).toBe('var(--shadow-md)');
    expect(bubble.style.fontFamily).toBe('');
  });
});
