import { render, screen } from '@testing-library/react';
import { RingProgress, resolveRingDash } from './RingProgress';

const CIRCUMFERENCE_AT_RADIUS_50 = 2 * Math.PI * 50;

describe('resolveRingDash', () => {
  it('fills the whole circumference when value equals max', () => {
    const { fraction, dashoffset } = resolveRingDash(100, 100, 50);
    expect(fraction).toBe(1);
    expect(dashoffset).toBeCloseTo(0);
  });

  it('draws half the circumference at half of max', () => {
    const { fraction, dashoffset, dasharray } = resolveRingDash(50, 100, 50);
    expect(fraction).toBe(0.5);
    expect(dashoffset).toBeCloseTo(CIRCUMFERENCE_AT_RADIUS_50 / 2);
    expect(dasharray).toBe(`${CIRCUMFERENCE_AT_RADIUS_50} ${CIRCUMFERENCE_AT_RADIUS_50}`);
  });

  it('clamps a value above max to a full ring', () => {
    expect(resolveRingDash(250, 100, 50).fraction).toBe(1);
  });

  it('clamps a negative value to an empty ring', () => {
    const { fraction, dashoffset } = resolveRingDash(-10, 100, 50);
    expect(fraction).toBe(0);
    expect(dashoffset).toBeCloseTo(CIRCUMFERENCE_AT_RADIUS_50);
  });

  it('treats non-finite value or max as zero', () => {
    expect(resolveRingDash(Number.NaN, 100, 50)).toMatchObject({ fraction: 0, now: 0 });
    expect(resolveRingDash(10, Number.POSITIVE_INFINITY, 50)).toMatchObject({
      fraction: 0,
      now: 0,
    });
  });

  it('returns the sanitised max', () => {
    expect(resolveRingDash(5, -5, 50).max).toBe(0);
    expect(resolveRingDash(5, Number.NaN, 50).max).toBe(0);
    expect(resolveRingDash(5, 80, 50).max).toBe(80);
  });

  it('returns the clamped value as now', () => {
    expect(resolveRingDash(250, 100, 50).now).toBe(100);
    expect(resolveRingDash(45, 100, 50).now).toBe(45);
  });

  it('yields fraction 0 when max is zero or negative', () => {
    expect(resolveRingDash(10, 0, 50).fraction).toBe(0);
    expect(resolveRingDash(10, -5, 50).fraction).toBe(0);
  });
});

describe('RingProgress', () => {
  it('exposes a progressbar with min, max and the current value', () => {
    render(<RingProgress value={45} accessibilityLabel="Progresso" />);

    const bar = screen.getByRole('progressbar', { name: 'Progresso' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '45');
  });

  it('reports the clamped value as aria-valuenow', () => {
    render(<RingProgress value={300} max={200} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '200');
  });

  it('reports zero as aria-valuenow for a negative value', () => {
    render(<RingProgress value={-4} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('draws a full ring when value is above max', () => {
    render(<RingProgress value={500} testID="ring" />);
    const offset = Number(screen.getByTestId('ring-arc').getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(0);
  });

  it('leaves half the arc undrawn at half of max', () => {
    render(<RingProgress value={50} testID="ring" />);
    const offset = Number(screen.getByTestId('ring-arc').getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(Math.PI * 53);
  });

  it('draws no arc when value is negative', () => {
    render(<RingProgress value={-5} testID="ring" />);
    expect(screen.queryByTestId('ring-arc')).not.toBeInTheDocument();
    expect(screen.getByTestId('ring-track')).toBeInTheDocument();
  });

  it('strokes the track with surface-2 and the arc with a gradient from the primary tokens', () => {
    render(<RingProgress value={50} testID="ring" />);
    const arc = screen.getByTestId('ring-arc');

    expect(arc.getAttribute('stroke')).toMatch(/^url\(#.+\)$/);
    expect(screen.getByTestId('ring-track').getAttribute('stroke')).toBe('var(--color-surface-2)');
    expect(arc.getAttribute('stroke-linecap')).toBe('round');
  });

  it('gives each instance its own gradient id', () => {
    render(
      <>
        <RingProgress value={10} testID="a" />
        <RingProgress value={20} testID="b" />
      </>,
    );
    expect(screen.getByTestId('a-arc').getAttribute('stroke')).not.toBe(
      screen.getByTestId('b-arc').getAttribute('stroke'),
    );
  });

  it('treats a NaN value as zero', () => {
    render(<RingProgress value={Number.NaN} testID="ring" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.queryByTestId('ring-arc')).not.toBeInTheDocument();
  });

  it('treats a non-finite max as zero', () => {
    render(<RingProgress value={10} max={Number.NaN} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('never uses a negative radius when thickness exceeds size', () => {
    render(<RingProgress value={50} size={20} thickness={40} testID="ring" />);
    expect(screen.getByTestId('ring-track').getAttribute('r')).toBe('0');
    expect(screen.getByTestId('ring-arc').getAttribute('r')).toBe('0');
  });

  it('lets pointer events reach the centerLabel through the svg', () => {
    render(<RingProgress value={45} centerLabel={<button>detalhe</button>} testID="ring" />);
    const svg = screen.getByTestId('ring-track').closest('svg') as SVGElement;

    expect(svg.style.pointerEvents).toBe('none');
  });

  it('strokes the arc with the primary gradient start and end tokens', () => {
    render(<RingProgress value={50} testID="ring" />);
    const gradientId = (screen.getByTestId('ring-arc').getAttribute('stroke') as string).slice(
      5,
      -1,
    );
    const stops = document.getElementById(gradientId)?.querySelectorAll('stop');

    expect(stops?.[0]?.style.stopColor).toBe('var(--gradient-primary-start)');
    expect(stops?.[1]?.style.stopColor).toBe('var(--gradient-primary-end)');
  });

  it('renders a numeric zero centerLabel', () => {
    render(<RingProgress value={0} centerLabel={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('reports a valid range for a negative max', () => {
    render(<RingProgress value={3} max={-5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders the centerLabel', () => {
    render(<RingProgress value={45} centerLabel={<span>45%</span>} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('sizes the root to the size prop and defaults to 120', () => {
    render(<RingProgress value={10} testID="ring" />);
    const root = screen.getByTestId('ring');
    expect(root.style.width).toBe('120px');
    expect(root.style.height).toBe('120px');
  });
});
