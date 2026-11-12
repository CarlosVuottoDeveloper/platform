import { fireEvent, render } from '@testing-library/react-native';
import { color, glow, neutral, radii } from '@industry/tokens';
import { Switch } from './Switch';

describe('Switch', () => {
  it('toggles from unchecked to checked on press when uncontrolled', () => {
    const { getByTestId } = render(<Switch label="Wifi" />);
    const thumb = getByTestId('switch-thumb');

    expect(thumb.props.style).toMatchObject({ backgroundColor: neutral['400'] });

    fireEvent(getByTestId('switch-root'), 'press');

    expect(getByTestId('switch-thumb').props.style).toMatchObject({
      backgroundColor: color.accent,
    });
  });

  it('calls onCheckedChange with the next value', () => {
    const onCheckedChange = jest.fn();
    const { getByTestId } = render(
      <Switch label="Wifi" checked={false} onCheckedChange={onCheckedChange} />,
    );

    fireEvent(getByTestId('switch-root'), 'press');

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onCheckedChange = jest.fn();
    const { getByTestId } = render(
      <Switch label="Wifi" disabled checked={false} onCheckedChange={onCheckedChange} />,
    );

    fireEvent(getByTestId('switch-root'), 'press');

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('sets accessibilityState from checked and disabled', () => {
    const { getByTestId } = render(<Switch label="Wifi" checked disabled />);
    expect(getByTestId('switch-root').props.accessibilityState).toMatchObject({
      checked: true,
      disabled: true,
    });
  });

  it('applies defaultChecked as the initial visual state without pressing', () => {
    const { getByTestId } = render(<Switch label="Wifi" defaultChecked />);

    expect(getByTestId('switch-thumb').props.style).toMatchObject({
      backgroundColor: color.accent,
    });
  });

  it('keeps a controlled checked prop authoritative after a press', () => {
    const { getByTestId } = render(
      <Switch label="Wifi" checked={false} onCheckedChange={jest.fn()} />,
    );

    fireEvent(getByTestId('switch-root'), 'press');

    expect(getByTestId('switch-thumb').props.style).toMatchObject({
      backgroundColor: neutral['400'],
    });
  });

  it('draws an off track on surface2 with a visible border and a glowless thumb', () => {
    const { getByTestId } = render(<Switch label="Wifi" />);
    expect(getByTestId('switch-track').props.style).toMatchObject({
      backgroundColor: color.surface2,
      borderColor: color.controlBorder,
      borderRadius: radii.pill,
    });
    expect(getByTestId('switch-thumb').props.style).toMatchObject({ borderRadius: radii.pill });
    expect(getByTestId('switch-thumb').props.style.boxShadow).toBeUndefined();
  });

  it('glows the accent thumb when on', () => {
    const { getByTestId } = render(<Switch label="Wifi" defaultChecked />);
    expect(getByTestId('switch-thumb').props.style).toMatchObject({
      backgroundColor: color.accent,
      boxShadow: glow.accent,
    });
  });
});
