import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { color, radii, semanticColor } from '@industry/tokens';
import { TextField } from './TextField';

describe('TextField', () => {
  it('renders the label when given', () => {
    const { getByText } = render(<TextField label="Nome" placeholder="Digite seu nome" />);
    expect(getByText('Nome')).toBeTruthy();
  });

  it('renders no label when omitted', () => {
    const { queryByText } = render(<TextField placeholder="Digite seu nome" />);
    expect(queryByText('Nome')).toBeNull();
  });

  it('renders the hint when given and there is no error', () => {
    const { getByText } = render(<TextField hint="Campo opcional" placeholder="x" />);
    expect(getByText('Campo opcional')).toBeTruthy();
  });

  it('renders the error instead of the hint when both are given', () => {
    const { getByText, queryByText } = render(
      <TextField hint="Campo opcional" error="Campo obrigatório" placeholder="x" />,
    );
    expect(getByText('Campo obrigatório')).toBeTruthy();
    expect(queryByText('Campo opcional')).toBeNull();
  });

  it('calls onFocus and onBlur and updates the border color accordingly', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <TextField placeholder="Digite algo" onFocus={onFocus} onBlur={onBlur} />,
    );
    const input = getByPlaceholderText('Digite algo');

    expect(input.props.style).toMatchObject({ borderColor: color.controlBorder });

    fireEvent(input, 'focus', { nativeEvent: {} });
    expect(onFocus).toHaveBeenCalled();
    expect(input.props.style).toMatchObject({ borderColor: color.accent });

    fireEvent(input, 'blur', { nativeEvent: {} });
    expect(onBlur).toHaveBeenCalled();
    expect(input.props.style).toMatchObject({ borderColor: color.controlBorder });
  });

  it('uses the danger color for the border when there is an error, regardless of focus', () => {
    const { getByPlaceholderText } = render(<TextField error="Inválido" placeholder="x" />);
    expect(getByPlaceholderText('x').props.style).toMatchObject({
      borderColor: semanticColor.danger,
    });
  });

  it('rounds the field with the md radius on a surface fill', () => {
    const { getByPlaceholderText } = render(<TextField placeholder="x" />);
    expect(getByPlaceholderText('x').props.style).toMatchObject({
      borderRadius: radii.md,
      backgroundColor: color.surface,
    });
  });

  it('rounds and outlines the secure-toggle container like a plain field', () => {
    const { getByPlaceholderText } = render(<TextField secureToggle placeholder="x" />);
    expect(getByPlaceholderText('x').parent?.parent?.props.style).toMatchObject({
      borderRadius: radii.md,
      borderColor: color.controlBorder,
    });
  });

  it('uses the string label as the accessibility label', () => {
    const { getByLabelText } = render(<TextField label="Nome" placeholder="x" />);
    expect(getByLabelText('Nome')).toBeTruthy();
  });

  it('does not set an accessibility label from a non-string label', () => {
    const { getByPlaceholderText } = render(
      <TextField label={<Text>Nome</Text>} placeholder="x" />,
    );
    expect(getByPlaceholderText('x').props.accessibilityLabel).toBeUndefined();
  });

  it('uses a taller, top-aligned style with vertical padding when multiline', () => {
    const { getByPlaceholderText } = render(<TextField multiline placeholder="x" />);
    expect(getByPlaceholderText('x').props.style).toMatchObject({
      minHeight: 104,
      paddingVertical: 8,
      textAlignVertical: 'top',
    });
  });

  it('uses the default single-line height and center alignment when not multiline', () => {
    const { getByPlaceholderText } = render(<TextField placeholder="x" />);
    expect(getByPlaceholderText('x').props.style).toMatchObject({
      paddingVertical: 0,
      textAlignVertical: 'center',
    });
  });

  it('does not throw when focus/blur fire without onFocus/onBlur handlers', () => {
    const { getByPlaceholderText } = render(<TextField placeholder="x" />);
    const input = getByPlaceholderText('x');

    expect(() => fireEvent(input, 'focus', { nativeEvent: {} })).not.toThrow();
    expect(() => fireEvent(input, 'blur', { nativeEvent: {} })).not.toThrow();
  });

  describe('secureToggle', () => {
    it('starts hidden and shows a "Mostrar senha" toggle', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <TextField secureToggle placeholder="Senha" />,
      );
      expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(true);
      expect(getByLabelText('Mostrar senha')).toBeTruthy();
    });

    it('reveals the value and flips to "Ocultar senha" when pressed', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <TextField secureToggle placeholder="Senha" />,
      );

      fireEvent.press(getByLabelText('Mostrar senha'));

      expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(false);
      expect(getByLabelText('Ocultar senha')).toBeTruthy();
    });

    it('hides the value again on a second press', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <TextField secureToggle placeholder="Senha" />,
      );

      fireEvent.press(getByLabelText('Mostrar senha'));
      fireEvent.press(getByLabelText('Ocultar senha'));

      expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(true);
    });

    it('does not render a toggle when secureToggle is not set', () => {
      const { queryByLabelText } = render(<TextField secureTextEntry placeholder="Senha" />);
      expect(queryByLabelText('Mostrar senha')).toBeNull();
    });
  });
});
