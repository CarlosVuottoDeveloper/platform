import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const STEPS = ['Conta', 'Endereço', 'Confirmação'];

describe('Stepper', () => {
  it('renders every step label', () => {
    render(<Stepper steps={STEPS} />);

    expect(screen.getByText('Conta')).toBeInTheDocument();
    expect(screen.getByText('Endereço')).toBeInTheDocument();
    expect(screen.getByText('Confirmação')).toBeInTheDocument();
  });

  it('marks the current step with aria-current', () => {
    render(<Stepper steps={STEPS} current={1} />);

    expect(screen.getByText('Endereço').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('numbers pending steps and checkmarks done steps', () => {
    render(<Stepper steps={STEPS} current={1} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('accepts object steps', () => {
    render(<Stepper steps={[{ label: 'Único' }]} />);

    expect(screen.getByText('Único')).toBeInTheDocument();
  });

  it('renders every step as done when current is past the last index', () => {
    render(<Stepper steps={STEPS} current={STEPS.length} />);

    expect(screen.getAllByText('✓')).toHaveLength(STEPS.length);
  });

  const markerOf = (label: string) =>
    screen.getByText(label).previousElementSibling as HTMLElement as HTMLElement;

  it('fills the active marker with the accent and a bg-coloured number', () => {
    render(<Stepper steps={STEPS} current={1} />);
    const marker = markerOf('Endereço');

    expect(marker.style.background).toBe('var(--color-accent)');
    expect(marker.style.color).toBe('var(--color-bg)');
    expect(marker.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('fills completed markers with the deep accent and a text-coloured check', () => {
    render(<Stepper steps={STEPS} current={1} />);
    const marker = markerOf('Conta');

    expect(marker.style.background).toBe('var(--color-accent-700)');
    expect(marker.style.color).toBe('var(--color-text)');
  });

  it('outlines upcoming markers on surface-2 with the control border', () => {
    render(<Stepper steps={STEPS} current={1} />);
    const marker = markerOf('Confirmação');

    expect(marker.style.background).toBe('var(--color-surface-2)');
    expect(marker.style.borderColor).toBe('var(--color-control-border)');
    expect(marker.style.borderWidth).toBe('1px');
    expect(marker.style.color).toBe('var(--color-neutral-400)');
    expect(markerOf('Endereço').style.borderWidth).toBe('0px');
  });

  it('colours the labels at three levels', () => {
    render(<Stepper steps={STEPS} current={1} />);

    expect(screen.getByText('Endereço').style.color).toBe('var(--color-text)');
    expect(screen.getByText('Conta').style.color).toBe('var(--color-neutral-200)');
    expect(screen.getByText('Confirmação').style.color).toBe('var(--color-neutral-400)');
  });
});
