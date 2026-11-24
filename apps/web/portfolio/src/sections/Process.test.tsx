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
});
