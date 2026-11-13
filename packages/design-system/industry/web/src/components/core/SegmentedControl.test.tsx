import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = ['dia', { value: 'semana', label: 'Semana', icon: <i data-testid="icon" /> }];
const segmentOf = (radio: HTMLElement) => radio.parentElement as HTMLElement;
const surfaceOf = (segment: HTMLElement) =>
  segment.querySelector('[aria-hidden="true"]') as HTMLElement | null;

describe('SegmentedControl', () => {
  it('renders a radiogroup with every option', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'dia' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Semana' })).not.toBeChecked();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('calls onChange when another option is picked', () => {
    const onChange = jest.fn();
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Semana' }));

    expect(onChange).toHaveBeenCalled();
  });

  it('wraps the segments in a surface pill', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);
    const group = screen.getByRole('radiogroup');

    expect(group.style.background).toBe('var(--color-surface)');
    expect(group.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('puts the active segment on the primary surface without a glow', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);
    const active = segmentOf(screen.getByRole('radio', { name: 'dia' }));
    const surface = surfaceOf(active) as HTMLElement;

    expect(surface.style.background).toBe('var(--gradient-primary) border-box no-repeat');
    expect(surface.style.boxShadow).toBe('');
    expect(surfaceOf(segmentOf(screen.getByRole('radio', { name: 'Semana' })))).toBeNull();
  });

  it('colours the active label with the text colour and the inactive one neutral', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);

    expect((screen.getByText('dia').parentElement as HTMLElement).style.color).toBe(
      'var(--color-text)',
    );
    expect((screen.getByText('Semana').parentElement as HTMLElement).style.color).toBe(
      'var(--color-neutral-400)',
    );
  });

  it('makes every segment fill the full control height', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);

    expect(segmentOf(screen.getByRole('radio', { name: 'dia' })).style.minHeight).toBe(
      'var(--control-h)',
    );
  });

  it('tints an inactive segment on hover and press', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);
    const segment = segmentOf(screen.getByRole('radio', { name: 'Semana' }));

    fireEvent.mouseEnter(segment);
    expect(segment.style.background).toBe('color-mix(in srgb, var(--color-text) 8%, transparent)');

    fireEvent.mouseDown(segment);
    expect(segment.style.background).toBe('color-mix(in srgb, var(--color-text) 14%, transparent)');

    fireEvent.mouseUp(segment);
    fireEvent.mouseLeave(segment);
    expect(segment.style.background).toBe('transparent');
  });

  it('shows a focus ring on the focused segment', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);
    const radio = screen.getByRole('radio', { name: 'Semana' });

    fireEvent.focus(radio);
    expect(segmentOf(radio).style.outline).toBe('2px solid var(--color-accent)');

    fireEvent.blur(radio);
    expect(segmentOf(radio).style.outline).toBe('');
  });

  it('renders a standalone element label raw and skips empty labels', () => {
    render(
      <SegmentedControl
        name="range"
        options={[
          { value: 'a', label: <b data-testid="raw">A</b> },
          { value: 'b', label: '' },
        ]}
        value="a"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByTestId('raw').parentElement).toBe(
      segmentOf(screen.getAllByRole('radio')[0] as HTMLElement),
    );
    expect(
      segmentOf(screen.getAllByRole('radio')[1] as HTMLElement).querySelector('span'),
    ).toBeNull();
  });

  it('wraps fragments and numbers in the styled text element', () => {
    render(
      <SegmentedControl
        name="range"
        options={[
          { value: 'a', label: <>um</> },
          { value: 'b', label: 7 },
        ]}
        value="a"
        onChange={jest.fn()}
      />,
    );

    expect((screen.getByText('um') as HTMLElement).style.fontSize).toBe('14px');
    expect((screen.getByText('7') as HTMLElement).style.fontSize).toBe('14px');
  });

  it('colours the segment root so icons and element labels inherit it', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);

    expect(segmentOf(screen.getByRole('radio', { name: 'dia' })).style.color).toBe(
      'var(--color-text)',
    );
    expect(segmentOf(screen.getByRole('radio', { name: 'Semana' })).style.color).toBe(
      'var(--color-neutral-400)',
    );
  });

  it('lets segments share the width instead of refusing to shrink', () => {
    render(<SegmentedControl name="range" options={OPTIONS} value="dia" onChange={jest.fn()} />);

    expect(segmentOf(screen.getByRole('radio', { name: 'dia' })).style.flexShrink).toBe('');
  });
});
