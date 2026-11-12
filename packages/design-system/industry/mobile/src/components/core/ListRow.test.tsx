import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { color, radii } from '@industry/tokens';
import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('renders title, meta, lead and trail', () => {
    const { getByText } = render(
      <ListRow lead={<Text>lead</Text>} title="Título" meta="Meta" trail={<Text>trail</Text>} />,
    );

    expect(getByText('lead')).toBeTruthy();
    expect(getByText('Título')).toBeTruthy();
    expect(getByText('Meta')).toBeTruthy();
    expect(getByText('trail')).toBeTruthy();
  });

  it('is a button role when onPress is given', () => {
    const { getByRole } = render(<ListRow title="Título" onPress={jest.fn()} />);

    expect(getByRole('button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<ListRow title="Título" onPress={onPress} />);

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalled();
  });

  it('forwards onPressIn/onPressOut alongside its own pressed-state tracking', () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const { getByRole } = render(
      <ListRow title="Título" onPress={jest.fn()} onPressIn={onPressIn} onPressOut={onPressOut} />,
    );
    const row = getByRole('button');

    fireEvent(row, 'pressIn');
    fireEvent(row, 'pressOut');

    expect(onPressIn).toHaveBeenCalled();
    expect(onPressOut).toHaveBeenCalled();
  });

  it('omits meta when not provided', () => {
    const { getByText, queryByText } = render(<ListRow title="Só título" />);

    expect(getByText('Só título')).toBeTruthy();
    expect(queryByText('Meta')).toBeNull();
  });

  it('is a rounded surface row with a divider', () => {
    const { getByTestId } = render(<ListRow title="Título" testID="row" />);

    const style = StyleSheet.flatten(getByTestId('row').props.style);
    expect(style.borderRadius).toBe(radii.md);
    expect(style.backgroundColor).toBe(color.surface);
    expect(style.borderBottomColor).toBe(color.divider);
  });

  it('tints the row with surface2 while pressed', () => {
    const { getByTestId } = render(<ListRow title="Título" testID="row" onPress={jest.fn()} />);

    fireEvent(getByTestId('row'), 'pressIn');

    expect(StyleSheet.flatten(getByTestId('row').props.style).backgroundColor).toBe(color.surface2);
  });
});
