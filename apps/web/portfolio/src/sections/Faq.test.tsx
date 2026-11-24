import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from '../content/faq';
import { Faq } from './Faq';

describe('Faq', () => {
  it('lists every question in the doubts section', () => {
    render(<Faq />);
    const section = screen.getByRole('region', { name: 'Dúvidas frequentes' });

    expect(section).toHaveAttribute('id', 'duvidas');
    for (const item of FAQ) {
      expect(screen.getByRole('button', { name: item.question })).toBeInTheDocument();
    }
  });

  it('shows an answer when its question is opened', async () => {
    render(<Faq />);
    const [first] = FAQ;
    const question = screen.getByRole('button', { name: first?.question });

    await userEvent.click(question);

    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(first?.answer ?? '')).toBeVisible();
  });
});
