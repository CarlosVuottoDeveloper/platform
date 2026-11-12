import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { accentRamp, alpha, color, control, danger, radii } from '@industry/tokens';
import { IconButton, resolveIconButtonBackground, resolveIconButtonIconColor } from './IconButton';

describe('resolveIconButtonBackground', () => {
  it('fills with the accent color for the solid variant, tinting darker while pressed', () => {
    expect(resolveIconButtonBackground('solid', false)).toBe(color.accent);
    expect(resolveIconButtonBackground('solid', true)).toBe(accentRamp['500']);
  });

  it('fills the ghost variant with surface2, settling to surface while pressed', () => {
    expect(resolveIconButtonBackground('ghost', false)).toBe(color.surface2);
    expect(resolveIconButtonBackground('ghost', true)).toBe(color.surface);
  });

  it('tints the danger variant, deepening while pressed', () => {
    expect(resolveIconButtonBackground('danger', false)).toBe(alpha(danger['400'], 16));
    expect(resolveIconButtonBackground('danger', true)).toBe(alpha(danger['400'], 28));
  });
});

describe('resolveIconButtonIconColor', () => {
  it('uses the text color for solid so the icon reads against the accent fill', () => {
    expect(resolveIconButtonIconColor('solid')).toBe(color.text);
  });

  it('uses the text color for ghost', () => {
    expect(resolveIconButtonIconColor('ghost')).toBe(color.text);
  });

  it('uses a danger tone for danger', () => {
    expect(resolveIconButtonIconColor('danger')).toBe(danger['300']);
  });
});

describe('IconButton', () => {
  it.each(['ghost', 'solid', 'danger'] as const)('is a circle for the %s variant', (variant) => {
    render(<IconButton icon="ListFilter" label="Filtrar" variant={variant} />);
    expect(StyleSheet.flatten(screen.getByLabelText('Filtrar').props.style).borderRadius).toBe(
      radii.pill,
    );
  });

  it('softens the ghost border', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" />);
    expect(StyleSheet.flatten(screen.getByLabelText('Filtrar').props.style).borderColor).toBe(
      alpha(color.text, 10),
    );
  });

  it('renders with its accessible label', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" />);
    expect(screen.getByLabelText('Filtrar')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<IconButton icon="ListFilter" label="Filtrar" onPress={onPress} />);

    fireEvent.press(screen.getByLabelText('Filtrar'));

    expect(onPress).toHaveBeenCalled();
  });

  it('does not call onPress while disabled', () => {
    const onPress = jest.fn();
    render(<IconButton icon="ListFilter" label="Filtrar" onPress={onPress} disabled />);

    fireEvent.press(screen.getByLabelText('Filtrar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shrinks the box for the "sm" size', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" size="sm" />);
    const [flattened] = screen.getByLabelText('Filtrar').props.style;
    expect(flattened).toMatchObject({ width: control.heightSm, height: control.heightSm });
  });

  it('defaults to the "md" box size', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" />);
    const [flattened] = screen.getByLabelText('Filtrar').props.style;
    expect(flattened).toMatchObject({ width: control.height, height: control.height });
  });

  it('renders without a border for the solid variant', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" variant="solid" />);
    const [flattened] = screen.getByLabelText('Filtrar').props.style;
    expect(flattened).toMatchObject({ borderWidth: 0 });
  });

  it('tints on press and reverts on release', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" />);
    const el = screen.getByLabelText('Filtrar');

    fireEvent(el, 'pressIn');
    expect(el.props.style[0]).toMatchObject({ backgroundColor: color.surface });

    fireEvent(el, 'pressOut');
    expect(el.props.style[0]).toMatchObject({ backgroundColor: color.surface2 });
  });
});
