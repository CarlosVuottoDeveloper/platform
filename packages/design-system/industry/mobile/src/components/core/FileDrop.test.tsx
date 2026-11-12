import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { color, radii } from '@industry/tokens';
import { FileDrop, resolveDropzoneBackground } from './FileDrop';

describe('resolveDropzoneBackground', () => {
  it('tints darker while pressed, otherwise the base surface', () => {
    expect(resolveDropzoneBackground(true)).toBe(color.surface2);
    expect(resolveDropzoneBackground(false)).toBe(color.surface);
  });
});

describe('FileDrop', () => {
  it('renders the default label and hint', () => {
    render(<FileDrop />);
    expect(screen.getByText('Toque para escolher um arquivo')).toBeTruthy();
    expect(screen.getByText('PNG, JPG ou PDF até 10 MB')).toBeTruthy();
  });

  it('renders a custom label and hint', () => {
    render(<FileDrop label="Enviar comprovante" hint="PDF até 5 MB" />);
    expect(screen.getByText('Enviar comprovante')).toBeTruthy();
    expect(screen.getByText('PDF até 5 MB')).toBeTruthy();
  });

  it('keeps a dashed strong divider on a large radius', () => {
    render(<FileDrop testID="drop" />);
    expect(StyleSheet.flatten(screen.getByTestId('drop').props.style)).toMatchObject({
      borderRadius: radii.lg,
      borderStyle: 'dashed',
      borderColor: color.dividerStrong,
    });
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<FileDrop onPress={onPress} testID="drop" />);

    fireEvent.press(screen.getByTestId('drop'));

    expect(onPress).toHaveBeenCalled();
  });

  it('does not call onPress while disabled', () => {
    const onPress = jest.fn();
    render(<FileDrop onPress={onPress} disabled testID="drop" />);

    fireEvent.press(screen.getByTestId('drop'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('drop').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('renders the error message instead of relying on hint alone', () => {
    render(<FileDrop error="Arquivo obrigatório" />);
    expect(screen.getByText('Arquivo obrigatório')).toBeTruthy();
  });

  it('renders no hint line when hint is empty', () => {
    render(<FileDrop hint="" testID="drop" />);
    expect(screen.queryByText('PNG, JPG ou PDF até 10 MB')).toBeNull();
  });
});
