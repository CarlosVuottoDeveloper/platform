import { render, screen, waitFor } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders the resolved svg for a known icon name', async () => {
    render(<Icon name="check" />);

    await waitFor(() => {
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('is accessible with the given aria-label', async () => {
    render(<Icon name="check" aria-label="check icon" />);

    const svg = await screen.findByLabelText('check icon');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('is aria-hidden when no aria-label is given', async () => {
    render(<Icon name="check" />);

    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('maps named sizes to pixel values', async () => {
    render(<Icon name="check" size="lg" />);

    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });

  it('accepts a numeric size directly', async () => {
    render(<Icon name="check" size={32} />);

    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
    });
  });

  it('paints a CSS variable colour through style, which SVG attributes cannot resolve', async () => {
    render(<Icon name="check" color="var(--viz-1)" />);

    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg?.style.color).toBe('var(--viz-1)');
    });
  });

  it('inherits the surrounding colour by default', async () => {
    render(<Icon name="check" />);

    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg?.style.color).toBe('');
    });
  });
});
