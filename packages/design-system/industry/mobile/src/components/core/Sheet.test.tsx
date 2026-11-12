import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { alpha, color, fontSize, gradient, radii } from '@industry/tokens';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('renders the title, children and actions when open', () => {
    const { getByText } = render(
      <Sheet title="Título" actions={<Text>Ação</Text>}>
        <Text>Conteúdo</Text>
      </Sheet>,
    );

    expect(getByText('Título')).toBeTruthy();
    expect(getByText('Conteúdo')).toBeTruthy();
    expect(getByText('Ação')).toBeTruthy();
  });

  it('renders nothing queryable when closed', () => {
    const { queryByText } = render(
      <Sheet open={false} title="Título">
        <Text>Conteúdo</Text>
      </Sheet>,
    );

    expect(queryByText('Título')).toBeNull();
    expect(queryByText('Conteúdo')).toBeNull();
  });

  it('calls onDismiss when the backdrop is pressed', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <Sheet testID="status-sheet" onDismiss={onDismiss}>
        <Text>Conteúdo</Text>
      </Sheet>,
    );

    fireEvent.press(getByTestId('status-sheet-backdrop'));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('claims the touch responder so taps on the sheet do not fall through to the backdrop', () => {
    const { getByTestId } = render(
      <Sheet testID="status-sheet">
        <Text>Conteúdo</Text>
      </Sheet>,
    );

    expect(getByTestId('status-sheet').props.onStartShouldSetResponder()).toBe(true);
  });

  it('omits the title when none is given', () => {
    const { queryByTestId } = render(
      <Sheet testID="status-sheet">
        <Text>Conteúdo</Text>
      </Sheet>,
    );

    expect(queryByTestId('status-sheet')).toBeTruthy();
  });

  it('colors the title with the theme text color, not the default black', () => {
    const { getByText } = render(<Sheet title="Título" />);

    const styles = [getByText('Título').props.style].flat();
    expect(styles.some((s) => s?.color === color.text)).toBe(true);
  });

  it('rounds only its top corners on a gradient surface with a soft border', () => {
    const { getByTestId } = render(<Sheet testID="status-sheet" />);

    const style = StyleSheet.flatten(getByTestId('status-sheet-surface').props.style);
    expect(style.borderRadius).toBe(radii.lg);
    expect(style.borderBottomLeftRadius).toBe(0);
    expect(style.borderBottomRightRadius).toBe(0);
    expect(style.backgroundColor).toBe(gradient.surface.colors[0]);
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe(alpha(color.text, 8));
  });

  it('sizes the title with the h4 token', () => {
    const { getByText } = render(<Sheet title="Título" />);

    expect(StyleSheet.flatten(getByText('Título').props.style).fontSize).toBe(fontSize.h4);
  });
});
