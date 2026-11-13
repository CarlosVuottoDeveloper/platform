import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { alpha, color, control, danger, radii } from '@industry/tokens';
import { PRIMARY_ACTION_FILL } from './PrimaryActionSurface';
import { IconButton, resolveIconButtonBackground, resolveIconButtonIconColor } from './IconButton';

const grant = {
  nativeEvent: { touches: [], changedTouches: [], timestamp: 0 },
  persist: jest.fn(),
};

describe('resolveIconButtonBackground', () => {
  it('uses the opaque primary base fill for the solid variant, pressed or not', () => {
    expect(resolveIconButtonBackground('solid', false)).toBe(PRIMARY_ACTION_FILL);
    expect(resolveIconButtonBackground('solid', true)).toBe(PRIMARY_ACTION_FILL);
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
  it('uses the text color for ghost and solid', () => {
    expect(resolveIconButtonIconColor('ghost')).toBe(color.text);
    expect(resolveIconButtonIconColor('solid')).toBe(color.text);
  });

  it('uses a danger tone for danger', () => {
    expect(resolveIconButtonIconColor('danger')).toBe(danger['300']);
  });
});

describe('IconButton', () => {
  it('renders the primary surface and no flat accent fill for the solid variant', () => {
    render(<IconButton icon="Send" label="Enviar" variant="solid" />);
    expect(screen.getByTestId('icon-button-surface')).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByLabelText('Enviar').props.style).backgroundColor,
    ).not.toBe(color.accent);
  });

  it('renders no primary surface for ghost and danger', () => {
    render(<IconButton icon="Send" label="Enviar" />);
    expect(screen.queryByTestId('icon-button-surface')).toBeNull();
  });

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

  it('tints while pressed', () => {
    render(<IconButton icon="ListFilter" label="Filtrar" />);
    const el = screen.getByLabelText('Filtrar');

    fireEvent(el, 'responderGrant', grant);
    expect(el.props.style[0]).toMatchObject({ backgroundColor: color.surface });
  });
});
