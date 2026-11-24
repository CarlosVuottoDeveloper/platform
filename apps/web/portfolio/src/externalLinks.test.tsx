import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { FAQ } from './content/faq';

describe('the whole page', () => {
  it('opens every external link in a new tab without handing over the page', () => {
    const { container } = render(<App />);
    const external = [...container.querySelectorAll('a')].filter((link) =>
      link.getAttribute('href')?.startsWith('http'),
    );

    expect(external.length).toBeGreaterThan(5);
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('points every in-page link at a part of the page that exists', () => {
    const { container } = render(<App />);
    const anchors = [...container.querySelectorAll('a')]
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'));

    expect(anchors.length).toBeGreaterThan(0);
    for (const href of anchors) {
      expect(container.querySelector(href)).not.toBeNull();
    }
  });

  it('has exactly one main heading', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it.each(['{Enter}', ' '])('opens a question from the keyboard with %p', async (key) => {
    render(<App />);
    const question = screen.getByRole('button', { name: FAQ[1]?.question });

    question.focus();
    await userEvent.keyboard(key);

    expect(question).toHaveAttribute('aria-expanded', 'true');
  });
});
