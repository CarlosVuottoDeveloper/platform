import { render, screen } from '@testing-library/react';
import { BrandIcon } from './BrandIcon';
import type { BrandName } from './BrandIcon';

const NAMES: BrandName[] = ['linkedin', 'github', 'whatsapp'];

describe('BrandIcon', () => {
  it.each(NAMES)('draws the %s mark in the surrounding text colour', (name) => {
    const { container } = render(<BrandIcon name={name} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(/^M/);
  });

  it('draws a different mark for each brand', () => {
    const paths = NAMES.map((name) => {
      const { container } = render(<BrandIcon name={name} />);
      return container.querySelector('path')?.getAttribute('d');
    });

    expect(new Set(paths).size).toBe(NAMES.length);
  });

  it.each([
    ['md', '20'],
    [32, '32'],
  ] as const)('sizes the %s icon at %spx', (size, px) => {
    const { container } = render(<BrandIcon name="github" size={size} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', px);
    expect(svg).toHaveAttribute('height', px);
  });

  it('is decorative without a label', () => {
    const { container } = render(<BrandIcon name="linkedin" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('is an image named by its label', () => {
    render(<BrandIcon name="whatsapp" aria-label="WhatsApp" />);

    expect(screen.getByRole('img', { name: 'WhatsApp' })).toBeInTheDocument();
  });
});
