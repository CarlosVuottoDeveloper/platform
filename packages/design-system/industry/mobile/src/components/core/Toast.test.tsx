import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { color, radii, semanticColor } from '@industry/tokens';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders the title and body', () => {
    const { getByText } = render(<Toast title="Salvo">Detalhes da ação.</Toast>);

    expect(getByText('Salvo')).toBeTruthy();
    expect(getByText('Detalhes da ação.')).toBeTruthy();
  });

  it('omits the dismiss button when onDismiss is not given', () => {
    const { queryByLabelText } = render(<Toast title="Salvo" />);

    expect(queryByLabelText('Dispensar')).toBeNull();
  });

  it('calls onDismiss when the dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = render(<Toast title="Salvo" onDismiss={onDismiss} />);

    fireEvent.press(getByLabelText('Dispensar'));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('omits the title when not provided', () => {
    const { getByText } = render(<Toast>Só corpo</Toast>);

    expect(getByText('Só corpo')).toBeTruthy();
  });

  it('colors the title with the tone accent color, not the default black text', () => {
    const { getByText } = render(
      <Toast tone="danger" title="Erro ao salvar">
        Detalhes.
      </Toast>,
    );

    const styles = [getByText('Erro ao salvar').props.style].flat();
    expect(styles.some((s) => s?.color === semanticColor.danger)).toBe(true);
  });

  it("colors each tone's title with that tone's own accent color", () => {
    const { getByText: getSuccessText } = render(<Toast tone="success" title="Salvo" />);
    const successStyles = [getSuccessText('Salvo').props.style].flat();
    expect(successStyles.some((s) => s?.color === semanticColor.success)).toBe(true);

    const { getByText: getWarningText } = render(<Toast tone="warning" title="Atenção" />);
    const warningStyles = [getWarningText('Atenção').props.style].flat();
    expect(warningStyles.some((s) => s?.color === semanticColor.warning)).toBe(true);
  });

  it('is a rounded surface2 card', () => {
    const { toJSON } = render(<Toast title="Salvo" />);

    const style = StyleSheet.flatten((toJSON() as ReactTestRendererJSON).props.style);
    expect(style.borderRadius).toBe(radii.md);
    expect(style.backgroundColor).toBe(color.surface2);
  });
});
