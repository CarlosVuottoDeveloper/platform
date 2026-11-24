import { render, screen, within } from '@testing-library/react';
import { WHATSAPP_URL } from '../content/contact';
import { PROCESS_STEPS } from '../content/process';
import { mockWideScreen } from '../test-utils';
import { Process } from './Process';

describe('Process', () => {
  it('shows each step with a gradient number', () => {
    mockWideScreen(true);
    render(<Process />);
    const section = screen.getByRole('region', { name: 'Como eu trabalho' });

    for (const step of PROCESS_STEPS) {
      const number = within(section).getByText(step.number);
      expect(number.style.backgroundClip).toBe('text');
      expect(within(section).getByText(step.title)).toBeInTheDocument();
    }
  });

  it('lists the steps in order with numbers that stay readable on the card', () => {
    mockWideScreen(true);
    render(<Process />);
    const list = screen.getByRole('list', { name: 'Etapas' });

    expect(within(list).getAllByRole('listitem')).toHaveLength(PROCESS_STEPS.length);
    for (const step of PROCESS_STEPS) {
      const background = within(list).getByText(step.number).style.background;
      expect(background).toContain('var(--color-accent-500)');
      expect(background).not.toContain('var(--color-accent-700)');
    }
  });

  it('invites the visitor to talk on WhatsApp', () => {
    mockWideScreen(true);
    render(<Process />);

    expect(screen.getByText('Tem um projeto em mente?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vamos conversar' })).toHaveAttribute(
      'href',
      WHATSAPP_URL,
    );
  });

  it.each([
    [true, 'repeat(4, minmax(0, 1fr))'],
    [false, 'minmax(0, 1fr)'],
  ])('lays the steps out for the screen (wide: %s)', (isWide, columns) => {
    mockWideScreen(isWide);
    render(<Process />);

    expect(screen.getByTestId('process-grid').style.gridTemplateColumns).toBe(columns);
  });

  it('sets the step descriptions and the call to action in body-size text', () => {
    mockWideScreen(false);
    render(<Process />);

    PROCESS_STEPS.forEach((step) =>
      expect(screen.getByText(step.description).style.fontSize).toBe('var(--text-body)'),
    );
    expect(
      screen.getByText('Me conte a ideia e eu te ajudo a tirar do papel.').style.fontSize,
    ).toBe('var(--text-body)');
  });
});
