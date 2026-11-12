import { fireEvent, render, screen } from '@testing-library/react-native';
import { accentRamp, color, control, danger } from '@industry/tokens';
import { IconButton, resolveIconButtonBackground, resolveIconButtonIconColor } from './IconButton';

describe('resolveIconButtonBackground', () => {
  it('fills with the accent color for the solid variant, tinting darker while pressed', () => {
    expect(resolveIconButtonBackground('solid', false)).toBe(color.accent);
    expect(resolveIconButtonBackground('solid', true)).toBe(accentRamp['500']);
  });

  it('stays transparent for the ghost variant until pressed', () => {
    expect(resolveIconButtonBackground('ghost', false)).toBe('transparent');
    expect(resolveIconButtonBackground('ghost', true)).not.toBe('transparent');
  });

  it('stays transparent for the danger variant until pressed', () => {
    expect(resolveIconButtonBackground('danger', false)).toBe('transparent');
    expect(resolveIconButtonBackground('danger', true)).not.toBe('transparent');
  });
});

describe('resolveIconButtonIconColor', () => {
  it('uses the background color for solid so the icon reads against the accent fill', () => {
    expect(resolveIconButtonIconColor('solid')).toBe(color.bg);
  });

  it('uses an accent tone for ghost', () => {
    expect(resolveIconButtonIconColor('ghost')).toBe(accentRamp['300']);
  });

  it('uses a danger tone for danger', () => {
    expect(resolveIconButtonIconColor('danger')).toBe(danger['300']);
  });
});

describe('IconButton', () => {
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
    expect(el.props.style[0]).toMatchObject({ backgroundColor: expect.any(String) });

    fireEvent(el, 'pressOut');
    expect(el.props.style[0]).toMatchObject({ backgroundColor: 'transparent' });
  });
});
