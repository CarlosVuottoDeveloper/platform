import { fireEvent, render, screen } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';

const OPTIONS = ['a', { value: 'b', label: 'Beta' }];
const dotOf = (radio: HTMLElement) => radio.nextElementSibling as HTMLElement;

describe('RadioGroup', () => {
  it('renders a labelled radiogroup with every option', () => {
    render(
      <RadioGroup label="Plano" name="plan" options={OPTIONS} value="a" onChange={jest.fn()} />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Plano' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'a' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Beta' })).not.toBeChecked();
  });

  it('calls onChange when another option is picked', () => {
    const onChange = jest.fn();
    render(<RadioGroup name="plan" options={OPTIONS} value="a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Beta' }));

    expect(onChange).toHaveBeenCalled();
  });

  it('outlines an unchecked radio with the control border', () => {
    render(<RadioGroup name="plan" options={OPTIONS} value="a" onChange={jest.fn()} />);
    const dot = dotOf(screen.getByRole('radio', { name: 'Beta' }));

    expect(dot.style.borderColor).toBe('var(--color-control-border)');
    expect(dot.style.background).toBe('transparent');
  });

  it('fills the checked radio with the accent and a bg-coloured dot', () => {
    render(<RadioGroup name="plan" options={OPTIONS} value="a" onChange={jest.fn()} />);
    const dot = dotOf(screen.getByRole('radio', { name: 'a' }));

    expect(dot.style.borderColor).toBe('var(--color-accent)');
    expect(dot.style.background).toBe('var(--color-accent)');
    expect(dot.style.boxShadow).toBe('inset 0 0 0 4px var(--color-bg)');
  });

  it('accents the border on hover and shows a focus ring on focus', () => {
    render(<RadioGroup name="plan" options={OPTIONS} value="a" onChange={jest.fn()} />);
    const radio = screen.getByRole('radio', { name: 'Beta' });

    fireEvent.mouseEnter(screen.getByText('Beta'));
    expect(dotOf(radio).style.borderColor).toBe('var(--color-accent)');
    fireEvent.mouseLeave(screen.getByText('Beta'));
    expect(dotOf(radio).style.borderColor).toBe('var(--color-control-border)');

    fireEvent.focus(radio);
    expect(dotOf(radio).style.outline).toBe('2px solid var(--color-accent)');
    fireEvent.blur(radio);
    expect(dotOf(radio).style.outline).toBe('none');
  });
});
